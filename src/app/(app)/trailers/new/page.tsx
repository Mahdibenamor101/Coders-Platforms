import { PageHeader } from "@/components/ui";
import { TrailerForm } from "@/components/forms/trailer-form";
import { createTrailerAction } from "@/lib/actions/trailer-actions";

export default function NewTrailerPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Nouvelle remorque" />
      <TrailerForm action={createTrailerAction} />
    </div>
  );
}
