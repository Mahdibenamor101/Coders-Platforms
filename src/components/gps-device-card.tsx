import { RefreshCw } from "lucide-react";
import { formatDateTime } from "@/lib/format";

export function GpsDeviceCard({
  token,
  lastPosition,
  regenerateAction,
}: {
  token: string | null;
  lastPosition: { recordedAt: Date } | null;
  regenerateAction: () => Promise<void>;
}) {
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const webhookUrl = token ? `${baseUrl}/api/gps/${token}/position` : null;

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Position GPS (boitier materiel)</h2>
        <form action={regenerateAction}>
          <button type="submit" className="btn-secondary inline-flex items-center gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            {token ? "Regenerer le token" : "Generer un token"}
          </button>
        </form>
      </div>

      <p className="text-sm text-slate-500">
        Connectez un traceur GPS physique (Teltonika, Geotab, ou tout boitier capable d&apos;envoyer
        des requetes HTTP) en le configurant pour appeler l&apos;URL ci-dessous a chaque relevé de
        position.
      </p>

      {webhookUrl && (
        <div className="mt-4 space-y-2">
          <div>
            <p className="label">URL du webhook</p>
            <code className="block break-all rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700">
              POST {webhookUrl}
            </code>
          </div>
          <div>
            <p className="label">Exemple (curl)</p>
            <code className="block whitespace-pre-wrap break-all rounded-lg bg-slate-900 px-3 py-2 text-xs text-emerald-300">
              {`curl -X POST ${webhookUrl} \\\n  -H "Content-Type: application/json" \\\n  -d '{"lat":33.5731,"lng":-7.5898,"speedKmh":72}'`}
            </code>
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-500">
        Dernier signal recu :{" "}
        {lastPosition ? (
          <span className="font-medium text-slate-700">{formatDateTime(lastPosition.recordedAt)}</span>
        ) : (
          <span className="text-amber-600">jamais connecte</span>
        )}
      </p>
    </div>
  );
}
