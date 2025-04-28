import models from '../model/models.js';
import BaseRepositoryImpl from './BaseRepositoryImpl.js';

/**
 * Repository class for disease-related database operations
 * @extends BaseRepositoryImpl
 */
export default class DiseasesRepository extends BaseRepositoryImpl {
  /**
   * Creates a new instance of DiseasesRepository
   */
  constructor() {
    super(models.Disease);

    this.disease = models.Disease;
  }

  /**
   * Get all diseases with pagination
   * @param {Object} options - The options object
   * @param {Object} options.pagination - Pagination settings
   * @param {number} [options.pagination.page=1] - Current page number
   * @param {number} [options.pagination.limit=10] - Number of items per page
   * @returns {Promise<{diseases: Array, pagination: Object}>} Object containing diseases and pagination info
   */
  async getAllPagination(options) {
    const page = options.pagination.page ?? 1;
    const limit = options.pagination.limit ?? 10;
    const offset = (page - 1) * limit;
    const [diseases, totalCount] = await Promise.all([
      this.disease.findMany({
        skip: offset,
        take: limit
      }),
      this.disease.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      diseases,
      pagination: {
        currentPage: page,
        totalItemsCount: totalPages,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  }

  /**
   * Get diseases that have any of the specified symptoms
   * @param {Array<string>} symptoms - Array of symptom names to search for
   * @returns {Promise<Array>} Array of disease objects that match the symptoms
   */
  async getAllBySymptoms(symptoms) {
    return this.disease.findMany({
      where: {
        symptoms: {
          some: {
            symptom: {
              name: {
                in: symptoms
              }
            }
          }
        }
      },
      include: {
        symptoms: {
          select: {
            symptom: true
          }
        }
      }
    });
  }

  /**
   * Get a specific disease by its ID
   * @param {string|number} diseaseId - The unique identifier of the disease
   * @returns {Promise<Object|null>} The disease object if found, null otherwise
   */
  async getById(diseaseId) {
    return this.disease.findFirst({
      where: {
        id: diseaseId
      },
      include: {
        symptoms: {
          select: {
            symptom: true
          }
        }
      }
    });
  }
}
