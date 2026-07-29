import { PageHeader } from "@/components/ui";
import { DriverForm } from "@/components/forms/driver-form";
import { createDriverAction } from "@/lib/actions/driver-actions";

export default function NewDriverPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Nouveau chauffeur" />
      <DriverForm action={createDriverAction} />
    </div>
  );
}
