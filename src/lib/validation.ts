import { z } from "zod";

export const signupSchema = z.object({
  companyName: z.string().min(2, "Le nom de l'entreprise est requis"),
  name: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "8 caracteres minimum"),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const driverSchema = z.object({
  firstName: z.string().min(1, "Prenom requis"),
  lastName: z.string().min(1, "Nom requis"),
  phone: z.string().min(6, "Numero de telephone invalide"),
  licenseNumber: z.string().min(1, "Numero de permis requis"),
  licenseExpiry: z.string().min(1, "Date d'expiration requise"),
  status: z.enum(["ACTIVE", "ON_LEAVE", "SUSPENDED"]).default("ACTIVE"),
  hireDate: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  skills: z.string().optional().or(z.literal("")),
  costPerKm: z.coerce.number().optional(),
});

export const tractorSchema = z.object({
  plateNumber: z.string().min(1, "Immatriculation requise"),
  brand: z.string().min(1, "Marque requise"),
  model: z.string().min(1, "Modele requis"),
  year: z.coerce.number().int().optional(),
  mileage: z.coerce.number().int().min(0).default(0),
  status: z.enum(["AVAILABLE", "IN_USE", "MAINTENANCE", "OUT_OF_SERVICE"]).default("AVAILABLE"),
  nextMaintenanceMileage: z.coerce.number().int().optional(),
  insuranceExpiry: z.string().optional().or(z.literal("")),
  technicalControlExpiry: z.string().optional().or(z.literal("")),
  costPerKm: z.coerce.number().optional(),
  hazmatCertified: z.coerce.boolean().default(false),
  notes: z.string().optional().or(z.literal("")),
});

export const trailerSchema = z.object({
  plateNumber: z.string().min(1, "Immatriculation requise"),
  type: z.enum(["CURTAIN", "REEFER", "FLATBED", "TANK", "CONTAINER", "TIPPER"]).default("CURTAIN"),
  capacityTons: z.coerce.number().optional(),
  status: z.enum(["AVAILABLE", "IN_USE", "MAINTENANCE", "OUT_OF_SERVICE"]).default("AVAILABLE"),
  nextInspectionDate: z.string().optional().or(z.literal("")),
  insuranceExpiry: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const tripSchema = z.object({
  tractorId: z.string().min(1, "Tracteur requis"),
  trailerId: z.string().optional().or(z.literal("")),
  driverId: z.string().min(1, "Chauffeur requis"),
  origin: z.string().min(1, "Origine requise"),
  destination: z.string().min(1, "Destination requise"),
  departureAt: z.string().min(1, "Date de depart requise"),
  estimatedArrivalAt: z.string().optional().or(z.literal("")),
  cargoDescription: z.string().optional().or(z.literal("")),
  distanceKm: z.coerce.number().optional(),
});

export const maintenanceSchema = z
  .object({
    tractorId: z.string().optional().or(z.literal("")),
    trailerId: z.string().optional().or(z.literal("")),
    type: z
      .enum(["OIL_CHANGE", "TIRES", "BRAKES", "INSPECTION", "REPAIR", "OTHER"])
      .default("OTHER"),
    performedAt: z.string().min(1, "Date requise"),
    mileage: z.coerce.number().int().optional(),
    cost: z.coerce.number().optional(),
    notes: z.string().optional().or(z.literal("")),
    nextDueAt: z.string().optional().or(z.literal("")),
    nextDueMileage: z.coerce.number().int().optional(),
  })
  .refine((data) => data.tractorId || data.trailerId, {
    message: "Selectionnez un tracteur ou une remorque",
    path: ["tractorId"],
  });

export const settingsSchema = z.object({
  companyName: z.string().min(2, "Nom requis"),
  whatsappPhoneNumberId: z.string().optional().or(z.literal("")),
  whatsappAccessToken: z.string().optional().or(z.literal("")),
  whatsappTestRecipient: z.string().optional().or(z.literal("")),
  depotAddress: z.string().optional().or(z.literal("")),
});

export const orderSchema = z.object({
  reference: z.string().optional().or(z.literal("")),
  customerName: z.string().min(1, "Nom du client requis"),
  customerPhone: z.string().optional().or(z.literal("")),
  pickupAddress: z.string().min(1, "Adresse d'enlevement requise"),
  deliveryAddress: z.string().min(1, "Adresse de livraison requise"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  requiredSkills: z.string().optional().or(z.literal("")),
  serviceDurationMin: z.coerce.number().int().min(0).default(15),
  timeWindowStart: z.string().optional().or(z.literal("")),
  timeWindowEnd: z.string().optional().or(z.literal("")),
  weightKg: z.coerce.number().optional(),
  hazmat: z.coerce.boolean().default(false),
});

export const podSchema = z.object({
  podSignature: z.string().optional().or(z.literal("")),
  podNotes: z.string().optional().or(z.literal("")),
  podBarcode: z.string().optional().or(z.literal("")),
});

export const feedbackSchema = z.object({
  customerRating: z.coerce.number().int().min(1).max(5),
  customerFeedback: z.string().optional().or(z.literal("")),
});
