import { createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { arrive, rise } from "@/lib/hotel/motion";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-5 py-16">
      <div className={arrive}>
        <p className="text-xs tracking-widest text-gold uppercase">Maitland Hotel</p>
        <h1 className="mt-2 font-display text-4xl italic">House desk</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Sign in to open reservations, the suite, and the folio.
        </p>
      </div>
      {authEnabled ? (
        <div className={`${rise} flex flex-col gap-3`}>
          {GROK_PROVIDERS.map((p) => (
            <button
              key={p.providerId}
              type="button"
              onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              className="min-h-11 rounded-full bg-gold px-4 text-sm font-medium text-bg"
            >
              Continue with {p.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">Sign-in is disabled.</p>
      )}
    </main>
  );
}
