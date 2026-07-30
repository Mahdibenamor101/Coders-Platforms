import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FeedbackForm } from "@/components/forms/feedback-form";
import { submitFeedbackAction } from "@/lib/actions/feedback-actions";

export default async function FeedbackPage({ params }: { params: { token: string } }) {
  const order = await prisma.order.findUnique({ where: { feedbackToken: params.token } });
  if (!order) notFound();

  const boundAction = submitFeedbackAction.bind(null, params.token);

  return (
    <div className="mx-auto min-h-screen max-w-md bg-slate-50 px-4 py-10">
      <header className="mb-6 text-center">
        <div className="mb-2 text-2xl font-bold text-emerald-700">FleetLink</div>
        <p className="text-sm text-slate-500">
          Comment s&apos;est passee la livraison de votre commande {order.reference} ?
        </p>
      </header>

      {order.customerRating ? (
        <div className="card p-6 text-center">
          <p className="text-lg font-semibold text-slate-900">
            Merci ! Vous avez deja donne votre avis ({"★".repeat(order.customerRating)}
            {"☆".repeat(5 - order.customerRating)}).
          </p>
        </div>
      ) : (
        <FeedbackForm action={boundAction} />
      )}
    </div>
  );
}
