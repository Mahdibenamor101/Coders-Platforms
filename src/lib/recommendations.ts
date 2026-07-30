import { prisma } from "./prisma";
import type {
  RecommendationCategory,
  RecommendationEntityType,
  RecommendationSeverity,
} from "./enums";

const DAY_MS = 24 * 60 * 60 * 1000;
const DOCUMENT_WARNING_DAYS = 30;
const MAINTENANCE_WARNING_KM = 1000;
const TRIP_REMINDER_HOURS = 24;
const LONG_HAUL_HOURS = 9;

type DraftRecommendation = {
  entityType: RecommendationEntityType;
  entityId: string;
  entityLabel: string;
  severity: RecommendationSeverity;
  category: RecommendationCategory;
  title: string;
  message: string;
  dueAt?: Date | null;
};

function daysUntil(date: Date, now: Date) {
  return Math.ceil((date.getTime() - now.getTime()) / DAY_MS);
}

/**
 * Runs the rule-based recommendation engine for a single company: scans
 * fleet/driver/trip data for maintenance, document-expiry, inspection and
 * scheduling issues, then reconciles the Recommendation table (creating new
 * ones, refreshing existing ones, and auto-resolving ones that no longer apply).
 */
export async function generateRecommendationsForCompany(companyId: string) {
  const now = new Date();
  const drafts: DraftRecommendation[] = [];

  const [drivers, tractors, trailers, trips] = await Promise.all([
    prisma.driver.findMany({ where: { companyId, status: { not: "SUSPENDED" } } }),
    prisma.tractor.findMany({ where: { companyId } }),
    prisma.trailer.findMany({ where: { companyId } }),
    prisma.trip.findMany({
      where: { companyId, status: { in: ["PLANNED", "IN_PROGRESS"] } },
      include: { driver: true, tractor: true, trailer: true, orders: true },
    }),
  ]);

  for (const driver of drivers) {
    const label = `${driver.firstName} ${driver.lastName}`;
    const days = daysUntil(driver.licenseExpiry, now);
    if (days < 0) {
      drafts.push({
        entityType: "DRIVER",
        entityId: driver.id,
        entityLabel: label,
        severity: "CRITICAL",
        category: "DOCUMENT_EXPIRY",
        title: "Permis de conduire expire",
        message: `Le permis de conduire de ${label} a expire depuis ${Math.abs(days)} jour(s). Retirez ce chauffeur des missions jusqu'a renouvellement.`,
        dueAt: driver.licenseExpiry,
      });
    } else if (days <= DOCUMENT_WARNING_DAYS) {
      drafts.push({
        entityType: "DRIVER",
        entityId: driver.id,
        entityLabel: label,
        severity: "WARNING",
        category: "DOCUMENT_EXPIRY",
        title: "Permis de conduire bientot expire",
        message: `Le permis de conduire de ${label} expire dans ${days} jour(s) (${driver.licenseExpiry.toLocaleDateString("fr-FR")}). Planifiez le renouvellement.`,
        dueAt: driver.licenseExpiry,
      });
    }
  }

  for (const tractor of tractors) {
    const label = `${tractor.brand} ${tractor.model} (${tractor.plateNumber})`;

    if (tractor.nextMaintenanceMileage != null) {
      const remaining = tractor.nextMaintenanceMileage - tractor.mileage;
      if (remaining <= 0) {
        drafts.push({
          entityType: "TRACTOR",
          entityId: tractor.id,
          entityLabel: label,
          severity: "CRITICAL",
          category: "MAINTENANCE",
          title: "Entretien tracteur en retard",
          message: `${label} a depasse le kilometrage d'entretien prevu (${tractor.mileage} km / seuil ${tractor.nextMaintenanceMileage} km). Planifiez l'entretien immediatement.`,
        });
      } else if (remaining <= MAINTENANCE_WARNING_KM) {
        drafts.push({
          entityType: "TRACTOR",
          entityId: tractor.id,
          entityLabel: label,
          severity: "WARNING",
          category: "MAINTENANCE",
          title: "Entretien tracteur a prevoir",
          message: `${label} approche du seuil d'entretien : encore ${remaining} km avant ${tractor.nextMaintenanceMileage} km.`,
        });
      }
    }

    if (tractor.insuranceExpiry) {
      const days = daysUntil(tractor.insuranceExpiry, now);
      if (days < 0) {
        drafts.push({
          entityType: "TRACTOR",
          entityId: tractor.id,
          entityLabel: label,
          severity: "CRITICAL",
          category: "DOCUMENT_EXPIRY",
          title: "Assurance tracteur expiree",
          message: `L'assurance de ${label} a expire depuis ${Math.abs(days)} jour(s).`,
          dueAt: tractor.insuranceExpiry,
        });
      } else if (days <= DOCUMENT_WARNING_DAYS) {
        drafts.push({
          entityType: "TRACTOR",
          entityId: tractor.id,
          entityLabel: label,
          severity: "WARNING",
          category: "DOCUMENT_EXPIRY",
          title: "Assurance tracteur bientot expiree",
          message: `L'assurance de ${label} expire dans ${days} jour(s).`,
          dueAt: tractor.insuranceExpiry,
        });
      }
    }

    if (tractor.technicalControlExpiry) {
      const days = daysUntil(tractor.technicalControlExpiry, now);
      if (days < 0) {
        drafts.push({
          entityType: "TRACTOR",
          entityId: tractor.id,
          entityLabel: label,
          severity: "CRITICAL",
          category: "INSPECTION",
          title: "Controle technique expire",
          message: `Le controle technique de ${label} a expire depuis ${Math.abs(days)} jour(s).`,
          dueAt: tractor.technicalControlExpiry,
        });
      } else if (days <= DOCUMENT_WARNING_DAYS) {
        drafts.push({
          entityType: "TRACTOR",
          entityId: tractor.id,
          entityLabel: label,
          severity: "WARNING",
          category: "INSPECTION",
          title: "Controle technique a renouveler",
          message: `Le controle technique de ${label} expire dans ${days} jour(s).`,
          dueAt: tractor.technicalControlExpiry,
        });
      }
    }
  }

  for (const trailer of trailers) {
    const label = `Remorque ${trailer.plateNumber}`;

    if (trailer.nextInspectionDate) {
      const days = daysUntil(trailer.nextInspectionDate, now);
      if (days < 0) {
        drafts.push({
          entityType: "TRAILER",
          entityId: trailer.id,
          entityLabel: label,
          severity: "CRITICAL",
          category: "INSPECTION",
          title: "Inspection remorque expiree",
          message: `L'inspection de ${label} a expire depuis ${Math.abs(days)} jour(s).`,
          dueAt: trailer.nextInspectionDate,
        });
      } else if (days <= DOCUMENT_WARNING_DAYS) {
        drafts.push({
          entityType: "TRAILER",
          entityId: trailer.id,
          entityLabel: label,
          severity: "WARNING",
          category: "INSPECTION",
          title: "Inspection remorque a prevoir",
          message: `L'inspection de ${label} expire dans ${days} jour(s).`,
          dueAt: trailer.nextInspectionDate,
        });
      }
    }

    if (trailer.insuranceExpiry) {
      const days = daysUntil(trailer.insuranceExpiry, now);
      if (days < 0) {
        drafts.push({
          entityType: "TRAILER",
          entityId: trailer.id,
          entityLabel: label,
          severity: "CRITICAL",
          category: "DOCUMENT_EXPIRY",
          title: "Assurance remorque expiree",
          message: `L'assurance de ${label} a expire depuis ${Math.abs(days)} jour(s).`,
          dueAt: trailer.insuranceExpiry,
        });
      } else if (days <= DOCUMENT_WARNING_DAYS) {
        drafts.push({
          entityType: "TRAILER",
          entityId: trailer.id,
          entityLabel: label,
          severity: "WARNING",
          category: "DOCUMENT_EXPIRY",
          title: "Assurance remorque bientot expiree",
          message: `L'assurance de ${label} expire dans ${days} jour(s).`,
          dueAt: trailer.insuranceExpiry,
        });
      }
    }
  }

  for (const trip of trips) {
    const label = `${trip.origin} -> ${trip.destination}`;
    const hoursUntilDeparture = (trip.departureAt.getTime() - now.getTime()) / (60 * 60 * 1000);

    if (
      trip.status === "PLANNED" &&
      !trip.driverNotifiedAt &&
      hoursUntilDeparture <= TRIP_REMINDER_HOURS &&
      hoursUntilDeparture >= -TRIP_REMINDER_HOURS
    ) {
      drafts.push({
        entityType: "TRIP",
        entityId: trip.id,
        entityLabel: label,
        severity: hoursUntilDeparture < 0 ? "CRITICAL" : "WARNING",
        category: "TRIP_REMINDER",
        title: "Chauffeur non notifie",
        message: `Le depart de la mission ${label} est prevu pour ${trip.departureAt.toLocaleString("fr-FR")} mais ${trip.driver.firstName} ${trip.driver.lastName} n'a pas encore ete notifie par WhatsApp.`,
        dueAt: trip.departureAt,
      });
    }

    if (trip.estimatedArrivalAt) {
      const durationHours =
        (trip.estimatedArrivalAt.getTime() - trip.departureAt.getTime()) / (60 * 60 * 1000);
      if (durationHours > LONG_HAUL_HOURS) {
        drafts.push({
          entityType: "TRIP",
          entityId: trip.id,
          entityLabel: label,
          severity: "WARNING",
          category: "DRIVER_HOURS",
          title: "Trajet long : pause obligatoire",
          message: `La mission ${label} dure environ ${durationHours.toFixed(1)}h. Rappelez a ${trip.driver.firstName} ${trip.driver.lastName} de respecter les temps de pause reglementaires.`,
          dueAt: trip.departureAt,
        });
      }
    }

    const activeOrders = trip.orders.filter((o) => o.status !== "CANCELLED" && o.status !== "FAILED");

    for (const order of activeOrders) {
      if (order.hazmat && !trip.tractor.hazmatCertified) {
        drafts.push({
          entityType: "ORDER",
          entityId: order.id,
          entityLabel: `${order.reference} (${trip.tractor.plateNumber})`,
          severity: "CRITICAL",
          category: "COMPLIANCE",
          title: "Matiere dangereuse sur tracteur non certifie",
          message: `La commande ${order.reference} (matiere dangereuse) est assignee au tracteur ${trip.tractor.plateNumber} qui n'est pas certifie ADR. Reassignez-la a un tracteur certifie.`,
        });
      }
    }

    const totalWeightKg = activeOrders.reduce((sum, o) => sum + (o.weightKg ?? 0), 0);
    const capacityKg = trip.trailer?.capacityTons != null ? trip.trailer.capacityTons * 1000 : null;
    if (capacityKg != null && totalWeightKg > capacityKg) {
      drafts.push({
        entityType: "TRIP",
        entityId: trip.id,
        entityLabel: label,
        severity: "CRITICAL",
        category: "COMPLIANCE",
        title: "Surcharge de la remorque",
        message: `La tournee ${label} totalise ${totalWeightKg.toLocaleString("fr-FR")} kg pour une capacite de ${capacityKg.toLocaleString("fr-FR")} kg (remorque ${trip.trailer?.plateNumber}). Retirez ou reassignez des commandes.`,
      });
    }
  }

  const activeKeys = new Set(
    drafts.map((d) => `${d.entityType}:${d.entityId}:${d.category}:${d.title}`)
  );

  const results = await Promise.all(
    drafts.map((draft) =>
      prisma.recommendation.upsert({
        where: {
          companyId_entityType_entityId_category_title: {
            companyId,
            entityType: draft.entityType,
            entityId: draft.entityId,
            category: draft.category,
            title: draft.title,
          },
        },
        create: { companyId, ...draft },
        update: {
          severity: draft.severity,
          message: draft.message,
          dueAt: draft.dueAt,
          resolved: false,
          resolvedAt: null,
        },
      })
    )
  );

  const existingUnresolved = await prisma.recommendation.findMany({
    where: { companyId, resolved: false },
  });

  const toAutoResolve = existingUnresolved.filter(
    (r) => !activeKeys.has(`${r.entityType}:${r.entityId}:${r.category}:${r.title}`)
  );

  if (toAutoResolve.length > 0) {
    await prisma.recommendation.updateMany({
      where: { id: { in: toAutoResolve.map((r) => r.id) } },
      data: { resolved: true, resolvedAt: now },
    });
  }

  return {
    generated: results.length,
    autoResolved: toAutoResolve.length,
  };
}
