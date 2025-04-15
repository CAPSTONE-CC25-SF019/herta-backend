import BaseRepositoryImpl from './BaseRepositoryImpl.js';
import models from '../model/models.js';

/**
 * Repository class for symptom-related database operations
 * @extends BaseRepositoryImpl
 */
export default class SymptomRepository extends BaseRepositoryImpl {
  /**
   * Creates a new instance of SymptomRepository
   */
  constructor() {
    super(models.Symptom);
    this.symptom = models.Symptom;
    this.diagnosis = models.SymptomsOnDiagnoses;
    this.disease = models.SymptomsOnDiseases;
  }

  /**
   * Get a symptom by its name
   * @param {string} name - The name of the symptom to find
   * @param {Object} options - Include options
   * @param {boolean} [options.diagnoses] - Whether to include related diagnoses
   * @param {boolean} [options.diseases] - Whether to include related diseases
   * @returns {Promise<Object>} The symptom object or throws if not found
   */
  async getSymptomsByName(name, options) {
    const args = {
      where: {
        name
      }
    }
    if ( options ) args.include = options;
    return this.symptom.findFirst(args);
  }

  /**
   * Get all symptoms associated with a specific diagnosis
   * @param {string} diagnosisId - The unique identifier of the diagnosis
   * @returns {Promise<Array>} Array of symptom objects associated with the diagnosis
   */
  async getAllSymptomsByDiagnosisId(diagnosisId) {
    return this.symptom.findMany({
      where: {
        diagnoses: {
          some: {
            diagnosisId: diagnosisId
          }
        }
      },
      include: {
        diagnoses: true
      }
    });
  }

  /**
   * Get all symptoms associated with a specific disease
   * @param {string} diseaseId - The unique identifier of the disease
   * @returns {Promise<Array>} Array of symptom objects associated with the disease
   */
  async getAllSymptomsByDiseaseId(diseaseId) {
    return this.symptom.findMany({
      where: {
        diseases: {
          some: {
            diseaseId: diseaseId
          }
        }
      },
      include: {
        diseases: true
      }
    });
  }

  /**
   * Get a symptom by its ID with related diagnoses and diseases
   * @param {string} symptomId - The unique identifier of the symptom
   * @returns {Promise<Object|null>} The symptom object with relations if found, null otherwise
   */
  async getSymptomsById(symptomId) {
    return this.symptom.findFirst({
      where: {
        id: symptomId
      },
      include: {
        diseases: true,
        diagnoses: true
      }
    });
  }
};