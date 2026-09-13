import { createFileRoute } from "@tanstack/react-router";
import { StudioShell } from "@/components/nexora/studio-shell";

export const Route = createFileRoute("/_studio")({
  component: StudioShell,
});
