import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { DriverForm } from "@/components/forms/driver-form";
import { DeleteButton } from "@/components/delete-button";
import {
  updateDriverAction,
  deleteDriverAction,
  sendDriverPortalLinkAction,
} from "@/lib/actions/driver-actions";
import { toDateInputValue, formatDateTime } from "@/lib/format";

export default async function EditDriverPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const driver = await prisma.driver.findFirst({
    where: { id: params.id, companyId: session.companyId },
  });
  if (!driver) notFound();

  const whatsappMessages = await prisma.whatsAppMessage.findMany({
    where: { driverId: driver.id, companyId: session.companyId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const boundUpdate = updateDriverAction.bind(null, driver.id);
  const boundDelete = deleteDriverAction.bind(null, driver.id);
  const boundSendLink = sendDriverPortalLinkAction.bind(null, driver.id);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title={`${driver.firstName} ${driver.lastName}`}
        action={<DeleteButton action={boundDelete} confirmMessage="Supprimer ce chauffeur ?" />}
      />
      <DriverForm
        action={boundUpdate}
        defaults={{
          firstName: driver.firstName,
          lastName: driver.lastName,
          phone: driver.phone,
          licenseNumber: driver.licenseNumber,
          licenseExpiry: toDateInputValue(driver.licenseExpiry),
          status: driver.status,
          hireDate: toDateInputValue(driver.hireDate),
          notes: driver.notes,
          skills: driver.skills,
          costPerKm: driver.costPerKm,
        }}
      />

      <div className="card p-6">
        <h2 className="mb-2 text-base font-semibold text-slate-900">Portail conducteur (PWA)</h2>
        <p className="mb-3 text-sm text-slate-500">
          Lien mobile personnel du chauffeur : missions du jour, statut, preuve de livraison, scan
          code-barres et position GPS. A envoyer sur son telephone.
        </p>
        <code className="mb-3 block break-all rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
          /driver/{driver.accessToken}
        </code>
        <form action={boundSendLink}>
          <button type="submit" className="btn-secondary">Envoyer le lien par WhatsApp</button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Messages WhatsApp recents</h2>
        {whatsappMessages.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun message envoye a ce chauffeur.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {whatsappMessages.map((m) => (
              <li key={m.id} className="py-3">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-800">{m.type}</span>
                  <span className="text-slate-500">{formatDateTime(m.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-line text-slate-500">{m.body}</p>
                <p className="mt-1 text-xs uppercase text-slate-400">{m.status}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
