import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  AROMAS,
  BAR,
  CONDUCT,
  EXTENSION_CENTS,
  GATE_ACTIONS,
  GATE_SOURCES,
  GRATUITY,
  PHASES,
  PLAYLISTS,
  STANDING,
  durationByCode,
  personaLabel,
  phaseById,
  serviceBySlug,
  splitSlugs,
  zar,
} from "@/lib/hotel/catalog";
import {
  addNote,
  advanceCourse,
  advancePhase,
  cancelReservation,
  logGate,
  orderPour,
  postExtension,
  postGratuity,
  saveEnvironment,
  servePour,
  setAccount,
  setConduct,
  type Bundle,
  type EnvironmentRow,
} from "@/lib/hotel/api";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { arrive, liveOnce, rise } from "@/lib/hotel/motion";
import { payEmail, startPaystack } from "@/lib/hotel/paystack";
import { Block, Chip, GhostButton, GoldButton, Label, clock, errText } from "@/components/hotel/ui";

export function SessionView({
  bundle,
  onChange,
  onBack,
}: {
  bundle: Bundle;
  onChange: (next: Bundle) => void;
  onBack: () => void;
}) {
  const { user } = useCurrentUserState();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [author, setAuthor] = useState<"desk" | "hostess">("desk");
  const [draft, setDraft] = useState<EnvironmentRow>(bundle.environment);
  const reservation = bundle.reservation;
  const locked = reservation.status === "closed" || reservation.status === "cancelled";
  const phaseIndex = PHASES.findIndex((p) => p.id === reservation.phase);
  const next = PHASES[phaseIndex + 1];
  const phase = phaseById(reservation.phase);
  const total = bundle.folio.reduce((sum, line) => sum + Number(line.cents), 0);

  useEffect(() => {
    setDraft(bundle.environment);
  }, [bundle.environment]);

  async function charge(cents: number, description: string) {
    if (cents <= 0) return "";
    const paid = await startPaystack({
      amountCents: cents,
      email: payEmail(user?.primaryEmail),
      description,
    });
    return paid.reference;
  }

  async function run(work: () => Promise<Bundle>) {
    setBusy(true);
    setError("");
    try {
      onChange(await work());
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className={arrive}>
        <button type="button" onClick={onBack} className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm text-gold">
          <ArrowLeft className="size-4" />
          Floor
        </button>
        <p className="text-xs tracking-widest text-gold uppercase">{reservation.window_label}</p>
        <h1 className="font-display text-4xl italic">{reservation.guest_name}</h1>
        <p className="mt-1 text-sm text-muted">
          {reservation.suite} · {reservation.hostess_name} · {durationByCode(reservation.duration_code)?.label}
        </p>
        <p className="mt-2 text-sm">
          <span className={reservation.status === "live" ? liveOnce : ""}>{reservation.status}</span>
          <span className="text-muted"> · {phase?.label} · {reservation.folio_account === "corporate" ? "Corporate account" : "Room folio"}</span>
        </p>
      </div>

      {error ? (
        <p className={`${rise} text-sm text-danger`} role="alert">
          {error}
        </p>
      ) : null}

      <section key={reservation.phase} className={`${rise} rounded-2xl border border-line bg-surface p-4`}>
        <p className="text-xs tracking-widest text-gold uppercase">Pacing</p>
        <ol className="mt-3 flex flex-wrap gap-2">
          {PHASES.map((item, i) => (
            <li
              key={item.id}
              className={
                "rounded-full border px-3 py-1 text-xs " +
                (i === phaseIndex ? "border-gold text-gold" : i < phaseIndex ? "border-line text-fg" : "border-line text-muted")
              }
            >
              {item.label}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm leading-relaxed text-muted">{phase?.cue}</p>
        {next && !locked ? (
          <div className="mt-4">
            <GoldButton disabled={busy} onClick={() => run(() => advancePhase({ data: { id: reservation.id } }))}>
              Move to {next.label}
            </GoldButton>
          </div>
        ) : null}
      </section>

      <Block title="Run of show" kicker="Services">
        <ul className="flex flex-col gap-3">
          {splitSlugs(reservation.services).map((slug) => {
            const service = serviceBySlug(slug);
            if (!service) return null;
            return (
              <li key={slug}>
                <p className="text-sm font-medium">{service.name}</p>
                <p className="text-sm leading-relaxed text-muted">{service.brief}</p>
              </li>
            );
          })}
        </ul>
        <p className="text-xs tracking-wide text-muted uppercase">Always in force</p>
        <ul className="flex flex-col gap-2">
          {STANDING.map((service) => (
            <li key={service.slug} className="text-sm text-muted">
              {service.name}
            </li>
          ))}
        </ul>
        <p className="text-sm">
          Persona · {personaLabel(reservation.persona)}
        </p>
        {reservation.boundary_note ? (
          <p className="text-sm leading-relaxed text-muted">{reservation.boundary_note}</p>
        ) : null}
      </Block>

      <Block title="Suite" kicker="Ambience">
        <Label>Light {draft.lighting}</Label>
        <input
          type="range"
          min={0}
          max={100}
          value={draft.lighting}
          disabled={locked}
          aria-label="Lighting"
          onChange={(e) => setDraft({ ...draft, lighting: Number(e.target.value) })}
        />
        <Label>Climate {(draft.climate_tenths / 10).toFixed(1)}°</Label>
        <input
          type="range"
          min={18}
          max={26}
          step={0.5}
          value={draft.climate_tenths / 10}
          disabled={locked}
          aria-label="Climate"
          onChange={(e) =>
            setDraft({ ...draft, climate_tenths: Math.round(Number(e.target.value) * 10) })
          }
        />
        <div className="flex flex-wrap gap-2">
          {PLAYLISTS.map((item) => (
            <Chip
              key={item.id}
              on={draft.playlist === item.id}
              disabled={locked}
              onClick={() => setDraft({ ...draft, playlist: item.id })}
            >
              {item.label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {AROMAS.map((item) => (
            <Chip
              key={item.id}
              on={draft.aromatherapy === item.id}
              disabled={locked}
              onClick={() => setDraft({ ...draft, aromatherapy: item.id })}
            >
              {item.label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip on={draft.blackout} disabled={locked} onClick={() => setDraft({ ...draft, blackout: !draft.blackout })}>
            Blackout
          </Chip>
          <Chip
            on={draft.white_noise}
            disabled={locked}
            onClick={() => setDraft({ ...draft, white_noise: !draft.white_noise })}
          >
            White noise
          </Chip>
          <Chip
            on={draft.hydrotherapy}
            disabled={locked}
            onClick={() => setDraft({ ...draft, hydrotherapy: !draft.hydrotherapy })}
          >
            Hydrotherapy
          </Chip>
        </div>
        <GoldButton
          disabled={busy || locked}
          onClick={() =>
            run(() =>
              saveEnvironment({
                data: {
                  id: reservation.id,
                  lighting: draft.lighting,
                  climateTenths: draft.climate_tenths,
                  playlist: draft.playlist,
                  blackout: draft.blackout,
                  whiteNoise: draft.white_noise,
                  aromatherapy: draft.aromatherapy,
                  hydrotherapy: draft.hydrotherapy,
                },
              }),
            )
          }
        >
          Save the room
        </GoldButton>
      </Block>

      <Block title="Bar" kicker="Folio, not cash">
        <div className="flex flex-wrap gap-2">
          {BAR.map((item) => (
            <Chip
              key={item.id}
              disabled={busy || locked}
              onClick={() =>
                run(async () => {
                  const paystackRef = await charge(item.cents, item.name);
                  return orderPour({ data: { id: reservation.id, itemId: item.id, notes: "", paystackRef } });
                })
              }
            >
              {item.name}
              {item.cents ? ` · ${zar(item.cents)}` : ""}
            </Chip>
          ))}
        </div>
        <ul className="flex flex-col gap-2">
          {bundle.bar.map((ticket) => (
            <li key={ticket.id} className="flex items-center justify-between gap-3 text-sm">
              <span>
                {ticket.item}
                <span className="text-muted"> · {ticket.status} · {clock(ticket.created_at)}</span>
              </span>
              {ticket.status !== "served" ? (
                <GhostButton disabled={busy} onClick={() => run(() => servePour({ data: { id: reservation.id, ticketId: ticket.id } }))}>
                  Served
                </GhostButton>
              ) : null}
            </li>
          ))}
        </ul>
      </Block>

      {bundle.courses.length ? (
        <Block title="Kitchen" kicker="Courses">
          <ul className="flex flex-col gap-3">
            {bundle.courses.map((course) => (
              <li key={course.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm">{course.course_no}. {course.dish}</p>
                  <p className="text-xs text-muted uppercase">{course.status}</p>
                </div>
                {course.status !== "served" ? (
                  <GhostButton
                    disabled={busy || locked}
                    onClick={() => run(() => advanceCourse({ data: { id: reservation.id, courseId: course.id } }))}
                  >
                    {course.status === "kitchen" ? "Plate" : "Serve"}
                  </GhostButton>
                ) : null}
              </li>
            ))}
          </ul>
        </Block>
      ) : null}

      <Block title="Gate" kicker="Undisturbed">
        <div className="flex flex-col gap-2">
          {GATE_SOURCES.map((source) => (
            <div key={source} className="flex flex-wrap items-center gap-2">
              <span className="min-w-32 text-sm">{source}</span>
              {GATE_ACTIONS.map((action) => (
                <Chip
                  key={action.id}
                  disabled={busy || locked}
                  onClick={() =>
                    run(() => logGate({ data: { id: reservation.id, source, action: action.id } }))
                  }
                >
                  {action.label}
                </Chip>
              ))}
            </div>
          ))}
        </div>
        <ul className="flex flex-col gap-1">
          {bundle.gates.map((event) => (
            <li key={event.id} className="text-sm text-muted">
              {clock(event.created_at)} · {event.source} · {event.action}
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Conduct" kicker="Code">
        {CONDUCT.map((item) => {
          const row = bundle.conduct.find((c) => c.code === item.code);
          const adhered = row ? row.adhered === true : true;
          return (
            <label key={item.code} className="flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="size-4"
                checked={adhered}
                disabled={busy}
                onChange={(e) =>
                  run(() =>
                    setConduct({
                      data: { id: reservation.id, code: item.code, adhered: e.target.checked },
                    }),
                  )
                }
              />
              {item.label}
            </label>
          );
        })}
      </Block>

      <Block title="Folio" kicker={zar(total)}>
        <div className="flex flex-wrap gap-2">
          <Chip
            on={reservation.folio_account === "room"}
            disabled={busy}
            onClick={() => run(() => setAccount({ data: { id: reservation.id, account: "room" } }))}
          >
            Room
          </Chip>
          <Chip
            on={reservation.folio_account === "corporate"}
            disabled={busy}
            onClick={() => run(() => setAccount({ data: { id: reservation.id, account: "corporate" } }))}
          >
            Corporate
          </Chip>
        </div>
        <ul className="flex flex-col gap-2">
          {bundle.folio.map((line) => (
            <li key={line.id} className={`${rise} flex items-baseline justify-between gap-3 text-sm`}>
              <span>
                {line.description}
                <span className="text-muted"> · {line.settled_via}{line.paystack_ref ? ` · ${line.paystack_ref}` : ""}</span>
              </span>
              <span className="text-gold">{zar(Number(line.cents))}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">Posted by the desk. Not discussed in the suite.</p>
        <div className="flex flex-wrap gap-2">
          <GhostButton
            disabled={busy || locked}
            onClick={() =>
              run(async () => {
                const paystackRef = await charge(EXTENSION_CENTS, "Extended hour");
                return postExtension({ data: { id: reservation.id, paystackRef } });
              })
            }
          >
            Add an hour
          </GhostButton>
          {GRATUITY.map((cents) => (
            <GhostButton
              key={cents}
              disabled={busy || reservation.status === "cancelled"}
              onClick={() =>
                run(async () => {
                  const paystackRef = await charge(cents, "House gratuity");
                  return postGratuity({ data: { id: reservation.id, cents, paystackRef } });
                })
              }
            >
              Gratuity {zar(cents)}
            </GhostButton>
          ))}
        </div>
      </Block>

      <Block title="Desk notes">
        <ul className="flex flex-col gap-3">
          {bundle.notes.map((item) => (
            <li key={item.id}>
              <p className="text-xs text-gold uppercase">
                {item.author} · {clock(item.created_at)}
              </p>
              <p className="text-sm leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ul>
        <textarea
          rows={3}
          value={note}
          placeholder="Operational note"
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Chip on={author === "desk"} onClick={() => setAuthor("desk")}>
            Desk
          </Chip>
          <Chip on={author === "hostess"} onClick={() => setAuthor("hostess")}>
            Hostess
          </Chip>
          <GoldButton
            disabled={busy || !note.trim()}
            onClick={() =>
              run(async () => {
                const next = await addNote({ data: { id: reservation.id, author, body: note.trim() } });
                setNote("");
                return next;
              })
            }
          >
            Add note
          </GoldButton>
        </div>
        {reservation.status !== "cancelled" ? (
          <GhostButton disabled={busy} onClick={() => run(() => cancelReservation({ data: { id: reservation.id } }))}>
            Cancel block
          </GhostButton>
        ) : null}
      </Block>
    </div>
  );
}
