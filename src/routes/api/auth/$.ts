import { createFileRoute } from "@tanstack/react-router";

async function handle(request: Request): Promise<Response> {
  const { getAuth } = await import("@/lib/auth/server");
  const auth = await getAuth();
  return auth.handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      POST: ({ request }) => handle(request),
    },
  },
});
