import { createFileRoute } from "@tanstack/react-router";
import { ItemDetail } from "@/components/nexora/item-detail";

export const Route = createFileRoute("/_studio/track/$id")({
  component: TrackPage,
});

function TrackPage() {
  const { id } = Route.useParams();
  return <ItemDetail kind="track" id={id} />;
}
