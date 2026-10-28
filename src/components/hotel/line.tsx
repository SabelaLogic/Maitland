import { useEffect, useState } from "react";
import { deskMessages, listDeskThreads, replyAsHostess, type DeskThread, type ThreadView } from "@/lib/hotel/comms";
import { zar } from "@/lib/hotel/catalog";
import { rise } from "@/lib/hotel/motion";
import { GoldButton, errText } from "@/components/hotel/ui";

export function DeskLine() {
  const [rows, setRows] = useState<DeskThread[]>([]);
  const [open, setOpen] = useState<ThreadView | null>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    setRows(await listDeskThreads());
  }

  useEffect(() => {
    refresh().catch((e) => setError(errText(e)));
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = open.id;
    const timer = setInterval(() => {
      deskMessages({ data: id })
        .then(setOpen)
        .catch(() => undefined);
    }, 4000);
    return () => clearInterval(timer);
  }, [open?.id]);

  async function load(id: string) {
    setError("");
    try {
      setOpen(await deskMessages({ data: id }));
    } catch (e) {
      setError(errText(e));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        A line opens when Paystack finishes. Anonymous access is R100. Sessions, pours, extensions, and gratuities use the same checkout.
      </p>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {open ? (
        <section className={`${rise} rounded-2xl border border-line bg-surface p-4`}>
          <button type="button" className="min-h-11 text-sm text-gold" onClick={() => setOpen(null)}>
            All lines
          </button>
          <h2 className="font-display text-2xl italic">
            {open.hostessName}
          </h2>
          <ul className="mt-3 flex max-h-80 flex-col gap-2 overflow-y-auto">
            {open.messages.map((msg) => (
              <li key={msg.id} className={msg.author === "guest" ? "text-sm text-muted" : "text-sm"}>
                <span className="text-xs tracking-wide text-gold uppercase">{msg.author}</span>
                <p>{msg.body}</p>
              </li>
            ))}
          </ul>
          <textarea className="mt-3" rows={3} value={body} placeholder="Reply as the hostess" onChange={(e) => setBody(e.target.value)} />
          <div className="mt-3">
            <GoldButton
              disabled={!body.trim()}
              onClick={() =>
                replyAsHostess({ data: { threadId: open.id, body: body.trim() } })
                  .then((next) => {
                    setBody("");
                    setOpen(next);
                  })
                  .catch((e) => setError(errText(e)))
              }
            >
              Send
            </GoldButton>
          </div>
        </section>
      ) : (
        rows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => load(row.id)}
            className={`${rise} rounded-2xl border border-line bg-surface p-4 text-left`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-display text-xl italic">{row.guest_label}</span>
              <span className="text-sm text-gold">{row.amount_cents ? zar(row.amount_cents) : "Account"}</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {row.hostess_name} · {row.guest_kind}
              {row.paystack_ref ? ` · ${row.paystack_ref}` : ""}
            </p>
          </button>
        ))
      )}
      {!open && !rows.length ? <p className="text-sm text-muted">No lines yet.</p> : null}
    </div>
  );
}
