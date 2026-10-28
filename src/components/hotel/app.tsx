import { useEffect, useState, type ReactNode } from "react";
import { CalendarPlus, ConciergeBell, MessageCircle, ScrollText, Users } from "lucide-react";
import { GROK_PROVIDERS, authClient, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { UserButton } from "@/lib/auth/gates";
import {
  DEPARTMENTS,
  DURATIONS,
  ELECTIVES,
  MOODS,
  PERSONAS,
  SERVICES,
  SUITES,
  WINDOWS,
  durationByCode,
  phaseById,
  serviceBySlug,
  splitSlugs,
  zar,
} from "@/lib/hotel/catalog";
import {
  createReservation,
  getReservation,
  loadDesk,
  reviewApplication,
  setHostessStatus,
  submitApplication,
  type Bundle,
  type DeskData,
  type ReservationRow,
} from "@/lib/hotel/api";
import { arrive, descend, rise } from "@/lib/hotel/motion";
import { payEmail, startPaystack } from "@/lib/hotel/paystack";
import { DeskLine } from "@/components/hotel/line";
import { SessionView } from "@/components/hotel/session";
import { Block, Chip, GoldButton, Label, errText } from "@/components/hotel/ui";

type Tab = "floor" | "services" | "book" | "line" | "roster";

export function HouseApp() {
  const { user, isPending } = useCurrentUserState();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || isPending) return <Frame />;
  if (!user) return <Welcome />;
  return <Desk />;
}

function Frame() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-5">
      <p className="text-xs tracking-widest text-gold uppercase">Maitland Hotel</p>
      <h1 className="mt-2 font-display text-4xl italic">House desk</h1>
      <p className="mt-3 text-sm text-muted">Opening the book.</p>
    </main>
  );
}

function Welcome() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-6 px-5 py-10">
      <header className={arrive}>
        <p className="text-xs tracking-widest text-gold uppercase">Maitland Hotel</p>
        <h1 className="mt-2 font-display text-5xl italic leading-none">House desk</h1>
        <p className={`${descend} mt-4 max-w-sm text-sm leading-relaxed text-muted`}>
          Sixteen hostess services. The guest is met off the lobby. Every fee posts to the room folio, never in the suite.
        </p>
      </header>
      <div className={`${rise} flex flex-col gap-3`}>
        {GROK_PROVIDERS.map((p) => (
          <button
            key={p.providerId}
            type="button"
            onClick={() => signIn(p.providerId, { callbackURL: "/" })}
            className="min-h-11 rounded-full bg-gold text-sm font-medium text-bg"
          >
            Continue with {p.label}
          </button>
        ))}
        <EmailGate />
      </div>
      <div className="flex flex-col gap-3 pb-8">
        {DEPARTMENTS.map((dept, i) => (
          <article
            key={dept.id}
            className={`${rise} rounded-2xl border border-line bg-surface p-4`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <h2 className="font-display text-2xl italic">{dept.title}</h2>
            <p className="mt-1 text-sm text-muted">{dept.line}</p>
            <ul className="mt-3 flex flex-col gap-1">
              {SERVICES.filter((s) => s.department === dept.id).map((s) => (
                <li key={s.slug} className="text-sm">
                  {s.name}
                  {s.standing ? <span className="text-muted"> · standing</span> : null}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </main>
  );
}

function EmailGate() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setBusy(true);
    setError("");
    const signUp = await authClient.signUp.email({ email, password, name: name.trim() || "House" });
    if (signUp.error) {
      const signIn = await authClient.signIn.email({ email, password });
      if (signIn.error) {
        setError(signIn.error.message || signUp.error.message || "Could not open the desk");
        setBusy(false);
        return;
      }
    }
    setBusy(false);
  }

  return (
    <form
      className="mt-2 flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <p className="text-center text-xs tracking-widest text-muted uppercase">or email</p>
      <input value={name} placeholder="Your name" autoComplete="name" onChange={(e) => setName(e.target.value)} />
      <input value={email} type="email" placeholder="Email" autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
      <input
        value={password}
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        onChange={(e) => setPassword(e.target.value)}
      />
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy || !email.includes("@") || password.length < 8}
        className="min-h-11 rounded-full border border-gold text-sm text-gold disabled:opacity-50"
      >
        {busy ? "Opening…" : "Continue with email"}
      </button>
    </form>
  );
}

function Desk() {
  const [data, setData] = useState<DeskData | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("floor");
  const [bundle, setBundle] = useState<Bundle | null>(null);

  async function refresh() {
    const next = await loadDesk();
    setData(next);
    return next;
  }

  useEffect(() => {
    refresh().catch((e) => setError(errText(e)));
  }, []);

  function remember(next: Bundle) {
    setBundle(next);
    setData((prev) => {
      if (!prev) return prev;
      const row = next.reservation;
      const exists = prev.reservations.some((r) => r.id === row.id);
      const reservations = exists
        ? prev.reservations.map((r) => (r.id === row.id ? row : r))
        : [row, ...prev.reservations];
      return { ...prev, reservations };
    });
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-lg">
      <header className="flex flex-wrap items-start justify-between gap-3 px-4 pt-5">
        <div className={arrive}>
          <p className="text-xs tracking-widest text-gold uppercase">Maitland Hotel</p>
          <h1 className="font-display text-3xl italic">House desk</h1>
        </div>
        <UserButton />
      </header>
      <p className={`${descend} px-4 pt-2 text-xs tracking-wide text-muted`}>
        Discretion · Folio only · Code of conduct
      </p>
      <div className="px-4 pt-4 pb-28">
        {error ? (
          <p className="mb-3 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        {!data ? (
          <p className="text-sm text-muted">Loading the book…</p>
        ) : bundle ? (
          <SessionView bundle={bundle} onChange={remember} onBack={() => setBundle(null)} />
        ) : (
          <div key={tab} className={rise}>
            {tab === "floor" ? (
              <Floor
                rows={data.reservations}
                onOpen={(id) => {
                  getReservation({ data: id })
                    .then(setBundle)
                    .catch((e) => setError(errText(e)));
                }}
              />
            ) : null}
            {tab === "services" ? <Services /> : null}
            {tab === "book" ? (
              <Book
                data={data}
                onBooked={(next) => {
                  remember(next);
                  setTab("floor");
                }}
                onError={setError}
              />
            ) : null}
            {tab === "line" ? <DeskLine /> : null}
            {tab === "roster" ? <Roster data={data} onReload={() => refresh().catch((e) => setError(errText(e)))} onError={setError} /> : null}
          </div>
        )}
      </div>
      {bundle ? null : (
        <nav className="dock fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg">
          <div className="mx-auto grid w-full max-w-lg grid-cols-5">
            <NavButton tab="floor" current={tab} onSelect={setTab} label="Floor" icon={<ConciergeBell className="size-5" />} />
            <NavButton tab="services" current={tab} onSelect={setTab} label="Services" icon={<ScrollText className="size-5" />} />
            <NavButton tab="book" current={tab} onSelect={setTab} label="Book" icon={<CalendarPlus className="size-5" />} />
            <NavButton tab="line" current={tab} onSelect={setTab} label="Line" icon={<MessageCircle className="size-5" />} />
            <NavButton tab="roster" current={tab} onSelect={setTab} label="Roster" icon={<Users className="size-5" />} />
          </div>
        </nav>
      )}
    </div>
  );
}

function NavButton({
  tab,
  current,
  onSelect,
  label,
  icon,
}: {
  tab: Tab;
  current: Tab;
  onSelect: (tab: Tab) => void;
  label: string;
  icon: ReactNode;
}) {
  const on = tab === current;
  return (
    <button
      type="button"
      onClick={() => onSelect(tab)}
      className={"flex min-h-14 flex-col items-center justify-center gap-1 text-xs " + (on ? "text-gold" : "text-muted")}
    >
      {icon}
      {label}
    </button>
  );
}

function Floor({ rows, onOpen }: { rows: ReservationRow[]; onOpen: (id: string) => void }) {
  if (!rows.length) {
    return <p className="text-sm text-muted">No blocks yet. Book one from the desk.</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, i) => (
        <button
          key={row.id}
          type="button"
          onClick={() => onOpen(row.id)}
          className={`${rise} rounded-2xl border border-line bg-surface p-4 text-left`}
          style={{ animationDelay: `${Math.min(i, 5) * 50}ms` }}
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-display text-2xl italic">{row.guest_name}</span>
            <span className="text-sm text-gold">{zar(Number(row.folio_cents))}</span>
          </div>
          <p className="mt-1 text-sm text-muted">
            {row.suite} · {row.hostess_name}
          </p>
          <p className="mt-2 text-xs tracking-wide text-gold uppercase">
            {row.window_label} · {phaseById(row.phase)?.label} · {row.status}
          </p>
        </button>
      ))}
    </div>
  );
}

function Services() {
  return (
    <div className="flex flex-col gap-3">
      {DEPARTMENTS.map((dept) => (
        <Block key={dept.id} title={dept.title} kicker={dept.line}>
          {SERVICES.filter((s) => s.department === dept.id).map((s) => (
            <div key={s.slug}>
              <p className="text-sm font-medium">
                {s.name}
                {s.standing ? <span className="font-normal text-muted"> · standing</span> : null}
                {s.supplementCents ? <span className="font-normal text-gold"> · {zar(s.supplementCents)}</span> : null}
              </p>
              <p className="text-sm leading-relaxed text-muted">{s.summary}</p>
            </div>
          ))}
        </Block>
      ))}
    </div>
  );
}

function Book({
  data,
  onBooked,
  onError,
}: {
  data: DeskData;
  onBooked: (bundle: Bundle) => void;
  onError: (message: string) => void;
}) {
  const active = data.hostesses.filter((h) => h.status === "active");
  const [guestName, setGuestName] = useState("");
  const [suite, setSuite] = useState<(typeof SUITES)[number]>(SUITES[0]);
  const [hostessId, setHostessId] = useState(active[0]?.id ?? "");
  const [services, setServices] = useState<string[]>(["in-suite-reception", "suite-ambience"]);
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]["code"]>("evening");
  const [persona, setPersona] = useState<(typeof PERSONAS)[number]["id"]>("conversationalist");
  const [mood, setMood] = useState<(typeof MOODS)[number]["id"]>("amber");
  const [windowLabel, setWindowLabel] = useState<(typeof WINDOWS)[number]>("Tonight");
  const [account, setAccount] = useState<"room" | "corporate">("room");
  const [boundary, setBoundary] = useState("");
  const [nda, setNda] = useState(false);
  const [busy, setBusy] = useState(false);
  const { user } = useCurrentUserState();

  function toggle(slug: string) {
    setServices((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  async function submit() {
    const price = durationByCode(duration);
    const extra = services.reduce((sum, slug) => sum + (serviceBySlug(slug)?.supplementCents ?? 0), 0);
    setBusy(true);
    try {
      const paid = await startPaystack({
        amountCents: (price?.cents ?? 0) + extra,
        email: payEmail(user?.primaryEmail),
        description: `${price?.label ?? "Session"} · ${guestName.trim()}`,
      });
      const next = await createReservation({
        data: {
          guestName,
          suite,
          hostessId,
          services,
          duration,
          persona,
          mood,
          boundary,
          windowLabel,
          account,
          nda,
          paystackRef: paid.reference,
        },
      });
      onBooked(next);
    } catch (e) {
      onError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  const fee = durationByCode(duration);
  const supplements = services.reduce((sum, slug) => sum + (serviceBySlug(slug)?.supplementCents ?? 0), 0);

  return (
    <div className="flex flex-col gap-4">
      <Block title="New block" kicker="Reservation">
        <Label>Guest alias</Label>
        <input value={guestName} placeholder="Alias only" onChange={(e) => setGuestName(e.target.value)} />
        <Label>Suite</Label>
        <select value={suite} onChange={(e) => setSuite(e.target.value as (typeof SUITES)[number])}>
          {SUITES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <Label>Window</Label>
        <div className="flex flex-wrap gap-2">
          {WINDOWS.map((item) => (
            <Chip key={item} on={windowLabel === item} onClick={() => setWindowLabel(item)}>
              {item}
            </Chip>
          ))}
        </div>
        <Label>Hostess</Label>
        <div className="flex flex-wrap gap-2">
          {active.map((host) => (
            <Chip key={host.id} on={hostessId === host.id} onClick={() => setHostessId(host.id)}>
              {host.name}
            </Chip>
          ))}
        </div>
        <Label>Length</Label>
        <div className="flex flex-col gap-2">
          {DURATIONS.map((item) => (
            <Chip key={item.code} on={duration === item.code} onClick={() => setDuration(item.code)}>
              {item.label} · {item.detail} · {zar(item.cents)}
            </Chip>
          ))}
        </div>
      </Block>
      {DEPARTMENTS.map((dept) => {
        const items = ELECTIVES.filter((s) => s.department === dept.id);
        if (!items.length) return null;
        return (
          <Block key={dept.id} title={dept.title}>
            <div className="flex flex-wrap gap-2">
              {items.map((s) => (
                <Chip key={s.slug} on={services.includes(s.slug)} onClick={() => toggle(s.slug)}>
                  {s.name}
                </Chip>
              ))}
            </div>
          </Block>
        );
      })}
      <Block title="Frame">
        <div className="flex flex-wrap gap-2">
          {PERSONAS.map((item) => (
            <Chip key={item.id} on={persona === item.id} onClick={() => setPersona(item.id)}>
              {item.label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((item) => (
            <Chip key={item.id} on={mood === item.id} onClick={() => setMood(item.id)}>
              {item.label}
            </Chip>
          ))}
        </div>
        <textarea
          rows={3}
          value={boundary}
          placeholder="Limits, allergies, topics to avoid"
          onChange={(e) => setBoundary(e.target.value)}
        />
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" className="size-4" checked={nda} onChange={(e) => setNda(e.target.checked)} />
          Non-disclosure accepted. Settlement stays on the folio.
        </label>
        <p className="text-sm text-muted">
          Paystack charges {fee ? zar(fee.cents + supplements) : ""}
          {supplements ? ", including supplements" : ""}. The hostess line opens when the payment finishes. Standing rules still apply.
        </p>
        <GoldButton disabled={busy || !guestName.trim() || !hostessId || !services.length || !nda} onClick={submit}>
          {busy ? "Waiting on Paystack…" : "Pay with Paystack"}
        </GoldButton>
      </Block>
    </div>
  );
}

function Roster({
  data,
  onReload,
  onError,
}: {
  data: DeskData;
  onReload: () => void;
  onError: (message: string) => void;
}) {
  const [name, setName] = useState("");
  const [languages, setLanguages] = useState("");
  const [hours, setHours] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true);
    try {
      await submitApplication({ data: { name, languages, hours, message } });
      setName("");
      setLanguages("");
      setHours("");
      setMessage("");
      onReload();
    } catch (e) {
      onError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {data.hostesses.map((host, i) => (
        <article
          key={host.id}
          className={`${rise} rounded-2xl border border-line bg-surface p-4`}
          style={{ animationDelay: `${Math.min(i, 5) * 40}ms` }}
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl italic">{host.name}</h2>
            <span className="text-xs tracking-wide text-gold uppercase">{host.status}</span>
          </div>
          <p className="text-sm text-muted">{host.vibe}</p>
          <p className="mt-2 text-sm leading-relaxed">{host.bio}</p>
          <p className="mt-2 text-xs text-muted">
            {host.languages} · {host.hours}
          </p>
          <p className="mt-1 text-xs text-muted">
            {splitSlugs(host.specialties)
              .map((slug) => serviceBySlug(slug)?.name)
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="mt-3">
            <Chip
              on={host.status === "active"}
              onClick={() =>
                setHostessStatus({
                  data: { id: host.id, status: host.status === "active" ? "paused" : "active" },
                })
                  .then(onReload)
                  .catch((e) => onError(errText(e)))
              }
            >
              {host.status === "active" ? "On the floor" : "Paused"}
            </Chip>
          </div>
        </article>
      ))}

      <Block title="Intake" kicker="Applications">
        <input value={name} placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input value={languages} placeholder="Languages" onChange={(e) => setLanguages(e.target.value)} />
        <input value={hours} placeholder="Hours she can hold" onChange={(e) => setHours(e.target.value)} />
        <textarea rows={4} value={message} placeholder="Note from the interview" onChange={(e) => setMessage(e.target.value)} />
        <GoldButton disabled={busy || !name.trim() || !languages.trim() || !hours.trim() || !message.trim()} onClick={send}>
          Log application
        </GoldButton>
      </Block>

      {data.applications.map((app) => (
        <article key={app.id} className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-xl italic">{app.name}</h3>
            <span className="text-xs text-gold uppercase">{app.status}</span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {app.languages} · {app.hours}
          </p>
          <p className="mt-2 text-sm leading-relaxed">{app.message}</p>
          {app.status === "review" ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <GoldButton
                onClick={() =>
                  reviewApplication({ data: { id: app.id, decision: "accepted" } })
                    .then(onReload)
                    .catch((e) => onError(errText(e)))
                }
              >
                Accept
              </GoldButton>
              <Chip
                onClick={() =>
                  reviewApplication({ data: { id: app.id, decision: "declined" } })
                    .then(onReload)
                    .catch((e) => onError(errText(e)))
                }
              >
                Decline
              </Chip>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
