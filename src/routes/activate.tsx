import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { consumeActivation } from "@/lib/hotel/comms";
import { errText } from "@/components/hotel/ui";

export const Route = createFileRoute("/activate")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: Activate,
});

function Activate() {
  const { token } = Route.useSearch();
  const [message, setMessage] = useState("Activating the account…");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage("This activation link is missing its token.");
      return;
    }
    consumeActivation({ data: { token } })
      .then(() => {
        setOk(true);
        setMessage("The account is active. You can open a hostess line.");
      })
      .catch((e) => setMessage(errText(e)));
  }, [token]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 px-5">
      <p className="text-xs tracking-widest text-gold uppercase">Maitland Hotel</p>
      <h1 className="font-display text-4xl italic">Activation</h1>
      <p className={ok ? "text-sm text-fg" : "text-sm text-muted"}>{message}</p>
      <Link to="/" className="min-h-11 text-sm text-gold">
        Back to the floor
      </Link>
    </main>
  );
}
