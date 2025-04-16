import models from '../model/models.js';
import BaseRepositoryImpl from './BaseRepositoryImpl.js';

export default class DiagnosesRepository extends BaseRepositoryImpl {
  /**
   * Create New Instance Diagnoses
   */
  constructor() {
    super(models.Diagnosis);

    this.diagnoses = models.Diagnosis;
  }

  /**
   * Create Diagnosis with Prediction From ML
   * @param {{ predictions: { symptomNames: string[], diseaseId: string, confidence: number }[], user: Object }} options
   */
  async create(options) {
    const { predictions, user } = options;
    return models.Client.$transaction(async (tx) => {
      const createdDiagnoses = await Promise.all(
        predictions.map(async (prediction) => {
          // Create a single diagnosis for each prediction
          const diagnosis = await tx.diagnosis.create({
            data: {
              confidence: prediction.confidence,
              diseaseId: prediction.diseaseId,
              userId: user.id,
              symptoms: {
                create: prediction.symptomNames.map((name) => ({
                  symptom: {
                    connect: { name }
                  }
                }))
              }
            },
            include: {
              symptoms: {
                include: {
                  symptom: true
                }
              }
            }
          });

          return diagnosis;
        })
      );

      return createdDiagnoses;
    });
  }

  /**
   * Update Diagnosis
   * @param {{userId: string, id: string}} data
   * @param {string[]} [newSymptoms] - Optional new symptoms to associate
   * @returns {Promise<Object>} Updated diagnosis
   */
  async update(data, newSymptoms = []) {
    const { id, userId } = data;
    return models.Client.$transaction(async (tx) => {
      // Remove existing symptoms from junction table
      await tx.symptomsOnDiagnoses.deleteMany({
        where: { diagnosisId: id }
      });

      // Reconnect symptoms using create (through junction)
      const updatedDiagnosis = await tx.diagnosis.update({
        where: {
          id,
          AND: {
            userId
          }
        },
        data: {
          symptoms: {
            create: newSymptoms.map((name) => ({
              symptom: {
                connect: { name }
              }
            }))
          }
        },
        include: {
          symptoms: {
            include: {
              symptom: true
            }
          },
          disease: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return updatedDiagnosis;
    });
  }

  /**
   * Delete Diagnosis by ID
   * @param {{ userId: string, id: string }} data
   * @returns {Promise<Object>} Deleted diagnosis
   */
  async delete(data) {
    return this.diagnoses.delete({
      where: {
        id: data.id,
        AND: {
          userId: data.userId
        }
      }
    });
  }

  /**
   * Count Diagnoses for a User
   * @param {string} userId
   * @returns {Promise<number>} Total number of diagnoses
   */
  async countByUser(userId) {
    return this.diagnoses.count({
      where: { userId }
    });
  }

  /**
   * Get Diagnosis Statistics
   * @param {string} userId
   * @returns {Promise<Object>} Diagnosis statistics
   */
  async getStatistics(userId) {
    const totalDiagnoses = await this.countByUser(userId);

    const diseaseGrouping = await this.diagnoses.groupBy({
      by: ['diseaseId'],
      where: { userId },
      _count: {
        diseaseId: true
      },
      orderBy: {
        _count: {
          diseaseId: 'desc'
        }
      }
    });

    return {
      totalDiagnoses,
      diseaseFrequency: diseaseGrouping.map((group) => ({
        diseaseId: group.diseaseId,
        count: group._count.diseaseId
      }))
    };
  }

  /**
   * Retrieves diagnoses that contain all of the specified symptoms
   * @param {Array<string>} symptoms - Array of symptom names to match
   * @returns {Promise<Array>} Array of diagnosis objects that include all specified symptoms
   */
  async getBySymptoms(symptoms) {
    return this.diagnoses.findMany({
      where: {
        symptoms: {
          every: {
            symptom: {
              name: {
                in: symptoms
              }
            }
          }
        }
      },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        symptoms: {
          select: {
            symptom: true
          }
        }
      }
    });
  }

  /**
   * Retrieves all diagnoses for a specific disease
   * @param {string} diseaseId - The unique identifier of the disease
   * @returns {Promise<Array>} Array of diagnosis objects associated with the disease
   */
  async getByDiseaseId(diseaseId) {
    return this.diagnoses.findMany({
      where: {
        diseaseId
      },
      include: {
        user: {
          include: {
            profile: true
          },
          omit: {
            deletedAt: true,
            password: true
          }
        },
        disease: {
          include: {
            symptoms: {
              select: {
                symptom: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Retrieves diagnoses that contain all of the specified symptoms
   * @param {{ userId: string, symptoms: Array<string> }} data - include  Array of symptom names to match and userId
   * @returns {Promise<Array>} Array of diagnosis objects that include all specified symptoms
   */
  async getBySymptomsAndUserId(data) {
    const { symptoms, userId } = data;
    return this.diagnoses.findMany({
      where: {
        symptoms: {
          every: {
            symptom: {
              name: {
                in: symptoms
              }
            }
          }
        },
        AND: {
          userId
        }
      },
      include: {
        user: {
          include: {
            profile: true
          },
          omit: {
            deletedAt: true,
            password: true
          }
        },
        symptoms: {
          select: {
            symptom: true
          }
        }
      }
    });
  }

  /**
   * Retrieves all diagnoses for a specific disease
   * @param {{ diseaseId: string, userId: string }} data - include of disease identifiers to match and userId
   * @returns {Promise<Array>} Array of diagnosis objects associated with the disease
   */
  async getByDiseaseIdAndUserId(data) {
    const { diseaseId, userId } = data;
    return this.diagnoses.findMany({
      where: {
        userId,
        AND: {
          diseaseId
        }
      },
      include: {
        user: {
          include: {
            profile: true
          },
          omit: {
            deletedAt: true,
            password: true
          }
        },
        disease: {
          include: {
            symptoms: {
              select: {
                symptom: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Retrieves all diagnoses for a specific user
   * @param {string} userId - The unique identifier of the user
   * @returns {Promise<Array>} Array of diagnosis objects associated with the user
   */
  async getByUserId(userId) {
    return this.diagnoses.findMany({
      where: {
        userId: userId
      },
      include: {
        user: {
          include: {
            profile: true
          },
          omit: {
            deletedAt: true,
            password: true
          }
        },
        symptoms: {
          select: {
            symptom: true
          }
        },
        disease: {
          include: {
            symptoms: {
              select: {
                symptom: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Get diagnoses with pagination
   * @param {Object} options - The options object
   * @param {Object} options.pagination - Pagination settings
   * @param {number} [options.pagination.page=1] - Current page number
   * @param {number} [options.pagination.limit=10] - Number of items per page
   * @returns {Promise<{diseases: Array, pagination: Object}>} Object containing diagnoses and pagination info
   */
  async getAllByPagination(options) {
    const page = options.pagination.page ?? 1;
    const limit = options.pagination.limit ?? 10;
    const offset = (page - 1) * limit;

    const [diagnoses, totalCount] = await Promise.all([
      this.diagnoses.findMany({
        skip: offset,
        take: limit
      }),
      this.diagnoses.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      diagnoses,
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
