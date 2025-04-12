import { PrismaClient } from '@prisma/client';

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
   * Health Record Model
   */
  HealthRecord: getPrismaInstance().healthRecord
};

export default models;
