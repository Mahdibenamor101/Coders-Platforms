import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusBadge } from "@/components/ui";
import { SettingsForm } from "@/components/forms/settings-form";
import { sendTestWhatsAppAction } from "@/lib/actions/settings-actions";
import { formatDateTime } from "@/lib/format";

export default async function SettingsPage() {
  const session = await requireSession();
  const company = await prisma.company.findUniqueOrThrow({ where: { id: session.companyId } });
  const messages = await prisma.whatsAppMessage.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title="Parametres" description="Entreprise et integration WhatsApp." />

      <SettingsForm
        defaults={{
          companyName: company.name,
          whatsappPhoneNumberId: company.whatsappPhoneNumberId ?? "",
          whatsappAccessToken: company.whatsappAccessToken ?? "",
          whatsappTestRecipient: company.whatsappTestRecipient ?? "",
          depotAddress: company.depotAddress ?? "",
        }}
      />
      {!company.depotLat && company.depotAddress && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          L&apos;adresse du depot n&apos;a pas pu etre localisee automatiquement. Verifiez son orthographe
          et enregistrez a nouveau.
        </div>
      )}

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Test d&apos;envoi WhatsApp</h2>
          <form action={sendTestWhatsAppAction}>
            <button className="btn-secondary" type="submit" disabled={!company.whatsappTestRecipient}>
              Envoyer un message de test
            </button>
          </form>
        </div>
        <p className="text-sm text-slate-500">
          Renseignez un numero de test ci-dessus puis cliquez sur le bouton pour verifier votre
          configuration WhatsApp Business.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Journal des messages WhatsApp</h2>
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun message envoye pour le moment.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Destinataire</th>
                <th className="py-2">Type</th>
                <th className="py-2">Statut</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {messages.map((m) => (
                <tr key={m.id}>
                  <td className="py-2">{m.toPhone}</td>
                  <td className="py-2">{m.type}</td>
                  <td className="py-2"><StatusBadge status={m.status} /></td>
                  <td className="py-2 text-slate-500">{formatDateTime(m.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
