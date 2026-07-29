import { PrismaClient } from "@prisma/client";
import { generateRecommendationsForCompany } from "../src/lib/recommendations";

const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany({ select: { id: true, name: true } });
  for (const company of companies) {
    const result = await generateRecommendationsForCompany(company.id);
    console.log(
      `${company.name}: ${result.generated} recommandation(s) actives, ${result.autoResolved} resolue(s) automatiquement.`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
