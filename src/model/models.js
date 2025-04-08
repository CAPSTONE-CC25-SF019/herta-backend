import { PrismaClient } from '@prisma/client';
import { createSoftDeleteMiddleware } from 'prisma-soft-delete-middleware';

/**
 * Singleton PrismaClient instance
 * @type {PrismaClient}
 */
let prismaInstance = null;

/**
 * Get the PrismaClient singleton instance
 * @returns {PrismaClient}
 */
const getPrismaInstance = () => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
};

getPrismaInstance().$use(
  createSoftDeleteMiddleware({
    models: {
      User: {
        field: 'deletedAt',
        createValue: (deleted) => {
          if (deleted) return new Date();
          return null;
        }
      }
    }
  })
);

const models = {
  /**
   * User model
   */
  User: getPrismaInstance().user,

  /**
   * Profile model
   */
  Profile: getPrismaInstance().profile,

  /**
   * Diagnosis Model
   */
  Diagnosis: getPrismaInstance().diagnosis,

  /**
   * Symptom Model
   */
  Symptom: getPrismaInstance().symptom,

  /**
   * Symptoms On Diagnoses Model
   */
  SymptomsOnDiagnoses: getPrismaInstance().symptomsOnDiagnoses,

  /**
   * Symptoms On Diseases Model
   */
  SymptomsOnDiseases: getPrismaInstance().symptomsOnDiseases
};

export default models;
