import type { ReactNode } from "react";

export function errText(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "The desk could not complete that.";
}

export function clock(raw: string) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
}

export function Chip({
  on,
  children,
  onClick,
  disabled,
}: {
  on?: boolean;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
      className={
        "min-h-11 rounded-full border px-3 text-sm disabled:opacity-50 " +
        (on ? "border-gold bg-gold text-bg" : "border-line bg-raised text-fg")
      }
    >
      {children}
    </button>
  );
}

export function Block({ title, kicker, children }: { title: string; kicker?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      {kicker ? <p className="text-xs tracking-widest text-gold uppercase">{kicker}</p> : null}
      <h2 className="font-display text-2xl italic leading-tight">{title}</h2>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </section>
  );
}

export function GoldButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="min-h-11 rounded-full bg-gold px-5 text-sm font-medium text-bg disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-11 rounded-full border border-line px-4 text-sm text-fg disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <span className="text-xs tracking-wide text-muted uppercase">{children}</span>;
}
