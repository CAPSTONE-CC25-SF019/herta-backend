import { PrismaClient } from '@prisma/client';
import csvParser from 'csv-parser';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const csvFilePath = path.join(process.cwd(), 'dataset', 'data.csv');
  const diseases = new Map();
  const symptoms = new Map();
  const diseaseSymptoms = [];

  const rows = await new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });

  const headers = Object.keys(rows[0]);
  headers.shift(); // Remove 'diseases' column

  // Create or find symptoms
  for (const symptomName of headers) {
    const symptom = await prisma.symptom.upsert({
      where: { name: symptomName },
      update: {},
      create: { name: symptomName }
    });
    symptoms.set(symptomName, symptom.id);
  }

  // Process diseases and relations
  for (const row of rows) {
    const diseaseName = row.diseases;

    if (!diseases.has(diseaseName)) {
      const disease = await prisma.disease.upsert({
        where: { name: diseaseName },
        update: {},
        create: { name: diseaseName }
      });
      diseases.set(diseaseName, disease.id);
    }

    const diseaseId = diseases.get(diseaseName);

    for (const [symptomName, value] of Object.entries(row)) {
      if (symptomName !== 'diseases' && value === '1') {
        diseaseSymptoms.push({
          diseaseId,
          symptomId: symptoms.get(symptomName)
        });
      }
    }
  }

  // Insert relations
  await prisma.symptomsOnDiseases.createMany({
    data: diseaseSymptoms,
    skipDuplicates: true
  });

  console.log('Seeding complete!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
