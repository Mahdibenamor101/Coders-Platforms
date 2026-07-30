import { PageHeader } from "@/components/ui";
import { OrderForm } from "@/components/forms/order-form";
import { createOrderAction } from "@/lib/actions/order-actions";

export default function NewOrderPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Nouvelle commande" />
      <OrderForm action={createOrderAction} />
    </div>
  );
}
