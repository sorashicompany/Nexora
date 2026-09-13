import { createFileRoute } from "@tanstack/react-router";
import { ItemDetail } from "@/components/nexora/item-detail";

export const Route = createFileRoute("/_studio/beat/$id")({
  component: BeatPage,
});

function BeatPage() {
  const { id } = Route.useParams();
  return <ItemDetail kind="beat" id={id} />;
}
