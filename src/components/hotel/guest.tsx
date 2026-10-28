import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LiveChat } from "@/components/hotel/live-chat";
import { GoldButton, errText } from "@/components/hotel/ui";
import { GROK_PROVIDERS, authClient, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  ACCESS_CENTS,
  accountStatus,
  beginAnonymous,
  finalizePayment,
  guestThread,
  issueActivation,
  openAccountLine,
  sendAccountMessage,
  sendGuestMessage,
  type ThreadView,
} from "@/lib/hotel/comms";
import { DEPARTMENTS, ROSTER, SERVICES, zar } from "@/lib/hotel/catalog";
import { arrive, descend, rise } from "@/lib/hotel/motion";
import { payEmail, startPaystack } from "@/lib/hotel/paystack";

const STORE = "maitland-guest";

type SavedGuest = { id: string; secret: string; hostessKey: string };

function readGuest(): SavedGuest | null {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedGuest;
    if (!parsed.id || !parsed.secret) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function GuestHome() {
  const { user } = useCurrentUserState();
  const [index, setIndex] = useState(0);
  const [sheet, setSheet] = useState<"access" | "chat" | "apply" | null>(null);
  const [thread, setThread] = useState<ThreadView | null>(null);
  const [ready, setReady] = useState(false);
  const [guest, setGuest] = useState<SavedGuest | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activation, setActivation] = useState("");
  const [clip, setClip] = useState(0);
  const [applyName, setApplyName] = useState("");
  const [applyBody, setApplyBody] = useState("");
  const [applyHours, setApplyHours] = useState("");
  const [applyNote, setApplyNote] = useState("");
  const [applySent, setApplySent] = useState(false);
  const host = ROSTER[index] ?? ROSTER[0];
  const pendingLines = useRef<string[]>([]);

  useEffect(() => {
    setGuest(readGuest());
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => setClip((n) => (n + 1) % 2), 8000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!user) {
      setReady(false);
      return;
    }
    accountStatus()
      .then((row) => setReady(row.ready))
      .catch(() => setReady(false));
  }, [user]);

  useEffect(() => {
    if (!guest || guest.hostessKey !== host.key) return;
    guestThread({ data: { guestId: guest.id, secret: guest.secret, hostessKey: host.key } })
      .then((row) => {
        if (row) setThread(row);
      })
      .catch(() => undefined);
  }, [guest, host.key]);

  useEffect(() => {
    if (sheet !== "chat" || !thread) return;
    const timer = setInterval(() => {
      if (guest && thread) {
        guestThread({ data: { guestId: guest.id, secret: guest.secret, hostessKey: thread.hostessKey } })
          .then((row) => row && setThread(row))
          .catch(() => undefined);
      } else if (user) {
        openAccountLine({ data: { hostessKey: host.key } })
          .then(setThread)
          .catch(() => undefined);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [sheet, thread?.id, guest, user, host.key]);

  async function payAnonymous() {
    setBusy(true);
    setError("");
    try {
      const started = await beginAnonymous({ data: { contact: email.trim(), hostessKey: host.key } });
      const paid = await startPaystack({
        amountCents: ACCESS_CENTS,
        email: payEmail(email),
        description: "Executive access, anonymous",
      });
      const next = await finalizePayment({
        data: { guestId: started.guestId, secret: started.secret, reference: paid.reference },
      });
      const saved = { id: started.guestId, secret: started.secret, hostessKey: host.key };
      localStorage.setItem(STORE, JSON.stringify(saved));
      setGuest(saved);
      setThread(next);
      setSheet("chat");
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  async function openWithAccount() {
    setBusy(true);
    setError("");
    try {
      const next = await openAccountLine({ data: { hostessKey: host.key } });
      setThread(next);
      setSheet("chat");
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  async function sendEmailAccount() {
    setBusy(true);
    setError("");
    setActivation("");
    try {
      const signed = await authClient.signUp.email({ email, password, name: name.trim() || "Guest" });
      if (signed.error) {
        const again = await authClient.signIn.email({ email, password });
        if (again.error) throw new Error(again.error.message || signed.error.message || "Could not open the account");
      }
      const link = await issueActivation();
      if (link.already) {
        setReady(true);
        return;
      }
      setActivation(link.path);
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  function startChat() {
    if (!ready && !guest) {
      setSheet("access");
      return;
    }
    setSheet("chat");
    if (ready && !thread) void openWithAccount();
  }

  async function mirror(body: string) {
    if (!thread) {
      pendingLines.current.push(body);
      return;
    }
    await deliver([body], thread.id);
  }

  async function deliver(lines: string[], threadId: string) {
    let current: ThreadView | null = null;
    try {
      for (const body of lines) {
        current = guest
          ? await sendGuestMessage({ data: { guestId: guest.id, secret: guest.secret, threadId, body } })
          : await sendAccountMessage({ data: { threadId, body } });
      }
      if (current) setThread(current);
    } catch (e) {
      setError(errText(e));
    }
  }

  useEffect(() => {
    if (!thread || pendingLines.current.length === 0) return;
    const lines = pendingLines.current;
    pendingLines.current = [];
    void deliver(lines, thread.id);
  }, [thread?.id]);

  const gmail = GROK_PROVIDERS.find((p) => p.idp === "google");
  const nextHost = ROSTER[(index + 1) % ROSTER.length];
  const prevHost = ROSTER[(index + ROSTER.length - 1) % ROSTER.length];

  function shuffle() {
    let step = 0;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % ROSTER.length);
      step += 1;
      if (step >= 8) {
        window.clearInterval(id);
        setIndex(Math.floor(Math.random() * ROSTER.length));
      }
    }, 90);
  }

  const sheetTitle = sheet === "apply" ? "Become a Hostess" : "Unlock the line";

  return (
    <main className="landing">
      <div className="ribbon" aria-hidden="true" />

      <section className="hero" aria-label="Maitland House">
        <div className="house-bg" aria-hidden="true">
          <video className={clip === 0 ? "bg-clip on" : "bg-clip"} autoPlay muted loop playsInline src="/media/house-a.mp4" />
          <video className={clip === 1 ? "bg-clip on" : "bg-clip"} autoPlay muted loop playsInline src="/media/house-b.mp4" />
          <img className="hero-pair" src="/media/splash-pair.jpg" alt="" />
          <div className="hero-veil" />
        </div>

        <div className="landing-top">
          <button type="button" className="tab-btn" onClick={() => setSheet("apply")}>
            Become a Hostess
          </button>
          <button type="button" className="tab-btn gold-fill" onClick={() => (ready ? startChat() : setSheet("access"))}>
            Login
          </button>
        </div>

        <header className={`${descend} hero-brand`}>
          <span className="splash-crest" aria-hidden="true">
            M
          </span>
          <p>Maitland House</p>
          <h1>Bespoke hospitality</h1>
          <p className="splash-sub">Private arrival. The suite is already prepared.</p>
        </header>

        <div className="stage">
          <button
            type="button"
            className="fan-card peek"
            onClick={() => setIndex((i) => (i + 1) % ROSTER.length)}
            aria-label={nextHost.name}
          >
            <img src={nextHost.portrait} alt="" />
          </button>
          <article key={host.key} className={`${arrive} fan-card front`}>
            <img src={host.portrait} alt="" />
            <div className="fan-ov">
              <div className="fan-name">{host.name}</div>
              <div className="fan-vibe">{host.vibe}</div>
            </div>
          </article>
          <span className="sr-only">{prevHost.name}</span>
        </div>

        <div className="ctr">
          <button type="button" onClick={shuffle}>
            Shuffle
          </button>
          <button type="button" onClick={() => setIndex((i) => (i + 1) % ROSTER.length)}>
            Next
          </button>
          <button type="button" className="gold-fill" onClick={startChat}>
            Start Chat
          </button>
        </div>
      </section>

      <section className="menu-list">
        <p className="menu-note">
          One house menu, shared by every hostess. A line opens when Paystack finishes — {zar(ACCESS_CENTS)} to stay anonymous, or an activated email or Gmail account.
        </p>
        {DEPARTMENTS.map((dept, i) => (
          <div key={dept.id} className={`${rise} menu-card`} style={{ animationDelay: `${i * 80}ms` }}>
            <h2>{dept.title}</h2>
            <ul>
              {SERVICES.filter((s) => s.department === dept.id).map((s) => (
                <li key={s.slug}>
                  {s.name}
                  {s.standing ? <span> · every hostess</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Link to="/desk" className="desk-link">
          House desk
        </Link>
      </section>

      <div className="trust" aria-hidden="true">
        <div className="trust-track">
          {["Safe Scrolling", "Secure Payment", "Confidential Information Processing", "POPIA Compliant", "Private & Discreet", "Safe Scrolling", "Secure Payment", "Confidential Information Processing", "POPIA Compliant", "Private & Discreet"].map((item, i) => (
            <span key={`${item}-${i}`}>{item}</span>
          ))}
        </div>
      </div>

      {sheet === "chat" ? (
        <LiveChat key={host.key} host={host} onClose={() => setSheet(null)} onGuestLine={(body) => void mirror(body)} />
      ) : null}

      {sheet && sheet !== "chat" ? (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-bg/80 p-3 sm:items-center">
          <div className={`${rise} max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-4`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl italic">{sheetTitle}</h2>
              <button type="button" className="min-h-11 text-sm text-gold" onClick={() => setSheet(null)}>
                Close
              </button>
            </div>
            {error ? (
              <p className="mt-3 text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}

            {sheet === "apply" ? (
              <form
                className="mt-4 flex flex-col gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!applyName.trim()) return;
                  setApplySent(true);
                }}
              >
                <p className="text-sm leading-relaxed text-muted">
                  Independent hostesses set their own hours and hold the same house menu as the floor. Send a short note, your availability, and a picture or clip. The house replies only if there is a fit.
                </p>
                <input value={applyName} placeholder="First name or alias" onChange={(e) => setApplyName(e.target.value)} required />
                <input value={applyBody} placeholder="Height and weight, if you want them noted" onChange={(e) => setApplyBody(e.target.value)} />
                <input value={applyHours} placeholder="Hours — evenings, weekends, flexible" onChange={(e) => setApplyHours(e.target.value)} />
                <label className="text-sm text-gold">
                  Pictures
                  <input type="file" accept="image/*" multiple className="mt-1" />
                </label>
                <label className="text-sm text-gold">
                  Short video
                  <input type="file" accept="video/*" className="mt-1" />
                </label>
                <textarea rows={4} value={applyNote} placeholder="A short note about yourself" onChange={(e) => setApplyNote(e.target.value)} />
                {applySent ? <p className="text-sm text-gold">Received. The house will reply only if there is a fit.</p> : null}
                <GoldButton type="submit" disabled={!applyName.trim() || applySent}>Send application</GoldButton>
              </form>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                {gmail ? (
                  <GoldButton onClick={() => signIn(gmail.providerId, { callbackURL: "/" })}>Continue with Gmail</GoldButton>
                ) : null}
                <form
                  className="flex flex-col gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void sendEmailAccount();
                  }}
                >
                  <p className="text-xs tracking-widest text-muted uppercase">Email account</p>
                  <input value={name} placeholder="Name" onChange={(e) => setName(e.target.value)} />
                  <input value={email} type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                  <input value={password} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                  <button type="submit" disabled={busy || !email.includes("@") || password.length < 8} className="min-h-11 rounded-full border border-gold text-sm text-gold disabled:opacity-50">
                    Send activation link
                  </button>
                  {activation ? (
                    <a className="text-sm text-gold underline" href={activation}>
                      Open the activation link
                    </a>
                  ) : null}
                </form>
                <div className="flex flex-col gap-2">
                  <p className="text-xs tracking-widest text-muted uppercase">Anonymous · {zar(ACCESS_CENTS)}</p>
                  <p className="text-sm text-muted">Paystack checkout. The line with {host.name} opens when the payment finishes. No account.</p>
                  <GoldButton disabled={busy} onClick={payAnonymous}>
                    {busy ? "Waiting on Paystack…" : `Pay ${zar(ACCESS_CENTS)} with Paystack`}
                  </GoldButton>
                </div>
                {ready ? (
                  <GoldButton disabled={busy} onClick={openWithAccount}>
                    Open the line on this account
                  </GoldButton>
                ) : null}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
