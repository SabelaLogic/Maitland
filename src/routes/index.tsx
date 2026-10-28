import { createFileRoute } from "@tanstack/react-router";
import { GuestHome } from "@/components/hotel/guest";

export const Route = createFileRoute("/")({ component: GuestHome });
