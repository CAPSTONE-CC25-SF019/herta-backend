import models from '../model/models.js';
import BaseRepositoryImpl from './BaseRepositoryImpl.js';

/**
 * Repository class for symptom-related database operations
 * @extends BaseRepositoryImpl
 */
export default class SymptomsRepository extends BaseRepositoryImpl {
  /**
   * Creates a new instance of SymptomsRepository
   */
  constructor() {
    super(models.Symptom);
    this.symptom = models.Symptom;
  }

  /**
   * Get all symptoms associated with a specific diagnosis
   * @param {string} diagnosisId - The unique identifier of the diagnosis
   * @returns {Promise<Array>} Array of symptom objects associated with the diagnosis
   */
  async getAllByDiagnosisId(diagnosisId) {
    return this.symptom.findMany({
      where: {
        diagnoses: {
          some: {
            diagnosisId: diagnosisId
          }
        }
      },
      include: {
        diagnoses: {
          select: {
            diagnosis: {
              omit: {
                userId: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Get all symptoms associated with a specific disease
   * @param {Array<string>} disease - The unique identifier of the disease
   * @returns {Promise<Array>} Array of symptom objects associated with the disease
   */
  async getAllByDiseases(diseases) {
    return this.symptom.findMany({
      where: {
        diseases: {
          some: {
            disease: {
              name: {
                in: diseases
              }
            }
          }
        }
      },
      include: {
        diseases: {
          select: {
            disease: true
          }
        }
      }
    });
  }

  /**
   * Get a symptom by its Name with related diagnoses and diseases
   * @param {string} symptom - The unique identifier of the symptom
   * @returns {Promise<Object|null>} The symptom object with relations if found, null otherwise
   */
  async getByName(symptom) {
    return this.symptom.findFirst({
      where: {
        name: symptom
      },
      include: {
        diseases: {
          select: {
            disease: true
          }
        },
        diagnoses: {
          select: {
            diagnosis: {
              omit: {
                userId: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Get a symptom by its Names with related diagnoses and diseases
   * @param {Array<string>} symptoms - The unique identifier of the symptom
   * @returns {Promise<Array<Object|null>>} The symptom object with relations if found, null otherwise
   */
  async getByNames(symptoms) {
    return this.symptom.findMany({
      where: {
        name: {
          in: symptoms
        }
      }
    });
  }

  /**
   * Get symptoms with pagination
   * @param {Object} options - The options object
   * @param {Object} options.pagination - Pagination settings
   * @param {number} [options.pagination.page=1] - Current page number
   * @param {number} [options.pagination.limit=10] - Number of items per page
   * @returns {Promise<{symptoms: Array, pagination: Object}>} Object containing symptoms and pagination info
   */
  async getAllByPagination(options) {
    const page = options.pagination.page ?? 1;
    const limit = options.pagination.limit ?? 10;
    const offset = (page - 1) * limit;
    const [symptoms, totalCount] = await Promise.all([
      this.symptom.findMany({
        skip: offset,
        take: limit
      }),
      this.symptom.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      symptoms,
      pagination: {
        currentPage: page,
        totalItemsCount: totalPages,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  }
}
