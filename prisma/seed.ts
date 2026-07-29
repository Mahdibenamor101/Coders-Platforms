import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateRecommendationsForCompany } from "../src/lib/recommendations";

const prisma = new PrismaClient();

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const company = await prisma.company.create({
    data: {
      name: "Transports Demo SARL",
      users: {
        create: {
          name: "Amine Benamor",
          email: "demo@fleetlink.app",
          passwordHash,
          role: "ADMIN",
        },
      },
    },
  });

  const [driverKarim, driverSofia, driverYoussef] = await Promise.all([
    prisma.driver.create({
      data: {
        companyId: company.id,
        firstName: "Karim",
        lastName: "Haddad",
        phone: "+212600000001",
        licenseNumber: "PL-2023-001",
        licenseExpiry: daysFromNow(15),
        status: "ACTIVE",
        hireDate: daysFromNow(-400),
      },
    }),
    prisma.driver.create({
      data: {
        companyId: company.id,
        firstName: "Sofia",
        lastName: "El Amrani",
        phone: "+212600000002",
        licenseNumber: "PL-2022-045",
        licenseExpiry: daysFromNow(200),
        status: "ACTIVE",
        hireDate: daysFromNow(-900),
      },
    }),
    prisma.driver.create({
      data: {
        companyId: company.id,
        firstName: "Youssef",
        lastName: "Tazi",
        phone: "+212600000003",
        licenseNumber: "PL-2021-090",
        licenseExpiry: daysFromNow(-5),
        status: "ACTIVE",
        hireDate: daysFromNow(-1200),
      },
    }),
  ]);

  const [tractor1, tractor2, tractor3] = await Promise.all([
    prisma.tractor.create({
      data: {
        companyId: company.id,
        plateNumber: "12345-A-6",
        brand: "Volvo",
        model: "FH16",
        year: 2019,
        mileage: 245000,
        status: "AVAILABLE",
        lastMaintenanceMileage: 240000,
        nextMaintenanceMileage: 245500,
        insuranceExpiry: daysFromNow(10),
        technicalControlExpiry: daysFromNow(90),
      },
    }),
    prisma.tractor.create({
      data: {
        companyId: company.id,
        plateNumber: "67890-B-6",
        brand: "Mercedes-Benz",
        model: "Actros",
        year: 2021,
        mileage: 120000,
        status: "AVAILABLE",
        lastMaintenanceMileage: 110000,
        nextMaintenanceMileage: 130000,
        insuranceExpiry: daysFromNow(180),
        technicalControlExpiry: daysFromNow(-3),
      },
    }),
    prisma.tractor.create({
      data: {
        companyId: company.id,
        plateNumber: "24680-C-6",
        brand: "Scania",
        model: "R500",
        year: 2020,
        mileage: 300000,
        status: "MAINTENANCE",
        lastMaintenanceMileage: 295000,
        nextMaintenanceMileage: 300000,
        insuranceExpiry: daysFromNow(300),
        technicalControlExpiry: daysFromNow(150),
      },
    }),
  ]);

  const [trailer1, trailer2] = await Promise.all([
    prisma.trailer.create({
      data: {
        companyId: company.id,
        plateNumber: "R-1111-A",
        type: "CURTAIN",
        capacityTons: 24,
        status: "AVAILABLE",
        nextInspectionDate: daysFromNow(20),
        insuranceExpiry: daysFromNow(240),
      },
    }),
    prisma.trailer.create({
      data: {
        companyId: company.id,
        plateNumber: "R-2222-B",
        type: "REEFER",
        capacityTons: 22,
        status: "AVAILABLE",
        nextInspectionDate: daysFromNow(-2),
        insuranceExpiry: daysFromNow(60),
      },
    }),
  ]);

  await prisma.maintenanceRecord.create({
    data: {
      companyId: company.id,
      tractorId: tractor1.id,
      type: "OIL_CHANGE",
      performedAt: daysFromNow(-30),
      mileage: 240000,
      cost: 450,
      notes: "Vidange complete + filtres.",
      nextDueMileage: 245500,
    },
  });

  await prisma.trip.create({
    data: {
      companyId: company.id,
      tractorId: tractor2.id,
      trailerId: trailer1.id,
      driverId: driverKarim.id,
      origin: "Casablanca",
      destination: "Marrakech",
      departureAt: daysFromNow(0.3),
      estimatedArrivalAt: daysFromNow(0.7),
      status: "PLANNED",
      cargoDescription: "Materiaux de construction",
      distanceKm: 240,
    },
  });

  await prisma.trip.create({
    data: {
      companyId: company.id,
      tractorId: tractor1.id,
      trailerId: trailer2.id,
      driverId: driverSofia.id,
      origin: "Tanger",
      destination: "Agadir",
      departureAt: daysFromNow(1),
      estimatedArrivalAt: daysFromNow(1.5),
      status: "PLANNED",
      cargoDescription: "Produits refrigeres",
      distanceKm: 780,
    },
  });

  await prisma.trip.create({
    data: {
      companyId: company.id,
      tractorId: tractor3.id,
      driverId: driverYoussef.id,
      origin: "Rabat",
      destination: "Fes",
      departureAt: daysFromNow(-2),
      estimatedArrivalAt: daysFromNow(-1.8),
      actualArrivalAt: daysFromNow(-1.8),
      status: "COMPLETED",
      cargoDescription: "Textile",
      distanceKm: 200,
      driverNotifiedAt: daysFromNow(-3),
    },
  });

  await generateRecommendationsForCompany(company.id);

  console.log("Seed termine.");
  console.log("Connexion : demo@fleetlink.app / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
