import { PageHeader } from "@/components/ui";
import { TractorForm } from "@/components/forms/tractor-form";
import { createTractorAction } from "@/lib/actions/tractor-actions";

export default function NewTractorPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Nouveau tracteur" />
      <TractorForm action={createTractorAction} />
    </div>
  );
}
