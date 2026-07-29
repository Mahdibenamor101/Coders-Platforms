import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/lib/actions/auth-actions";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Tableau de bord", icon: "▦" },
  { href: "/tractors", label: "Tracteurs", icon: "\u{1F69B}" },
  { href: "/trailers", label: "Remorques", icon: "\u{1F69A}" },
  { href: "/drivers", label: "Chauffeurs", icon: "\u{1F464}" },
  { href: "/trips", label: "Missions", icon: "\u{1F5FA}" },
  { href: "/maintenance", label: "Entretien", icon: "\u{1F527}" },
  { href: "/recommendations", label: "Recommandations", icon: "\u{1F4A1}" },
  { href: "/settings", label: "Parametres", icon: "⚙" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [company, openRecommendations] = await Promise.all([
    prisma.company.findUnique({ where: { id: session.companyId } }),
    prisma.recommendation.count({
      where: { companyId: session.companyId, resolved: false },
    }),
  ]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-5">
          <div className="text-lg font-bold text-emerald-700">FleetLink</div>
          <div className="truncate text-xs text-slate-500">{company?.name}</div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <span className="flex items-center gap-2">
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </span>
              {item.href === "/recommendations" && openRecommendations > 0 && (
                <span className="badge bg-red-100 text-red-700">{openRecommendations}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 px-4 py-4">
          <div className="mb-2 text-sm">
            <div className="font-medium text-slate-800">{session.name}</div>
            <div className="text-xs text-slate-500">{session.email}</div>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="btn-secondary w-full">
              Se deconnecter
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
    </div>
  );
}
