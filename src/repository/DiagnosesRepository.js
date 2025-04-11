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
   * @param {{ predictions: { symptomsId: string[], diseaseId: string }[], user: Object }} options
   */
  async create(options) {
    const { predictions, user } = options;
    return models.Client.$transaction(async (tx) => {
      const createdDiagnoses = await Promise.all(
        predictions.map(async (prediction) => {
          // Create a single diagnosis for each prediction
          const diagnosis = await tx.diagnosis.create({
            data: {
              diseaseId: prediction.diseaseId,
              userId: user.id,
              symptoms: {
                connect: prediction.symptomsId.map((symptomId) => ({
                  symptomId
                }))
              }
            },
            include: {
              symptoms: true
            }
          });

          return diagnosis;
        })
      );

      return createdDiagnoses;
    });
  }

  /**
   * Find Diagnoses by User ID
   * @param {string} userId
   * @param {Object} [options] - Optional pagination and filtering options
   * @returns {Promise<Array>} List of diagnoses
   */
  async findByUser(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      includeSymptoms = true,
      orderBy = 'createdAt'
    } = options;

    return this.diagnoses.findMany({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [orderBy]: 'desc' },
      include: {
        symptoms: includeSymptoms
      }
    });
  }

  /**
   * Find Diagnosis by ID with optional symptoms inclusion
   * @param {string} id
   * @param {boolean} [include=true]
   * @returns {Promise<Object>} Diagnosis details
   */
  async findById(id, include = true) {
    return this.diagnoses.findUnique({
      where: { id },
      include: {
        symptoms: include,
        user: include,
        disease: true
      }
    });
  }

  /**
   * Update Diagnosis
   * @param {string} id
   * @param {Object} data - Update data
   * @param {string[]} [newSymptomIds] - Optional new symptoms to associate
   * @returns {Promise<Object>} Updated diagnosis
   */
  async update(id, data, newSymptomIds = []) {
    return models.Client.$transaction(async (tx) => {
      // Remove existing symptoms
      await tx.symptomsOnDiagnoses.deleteMany({
        where: { diagnosisId: id }
      });

      // Update diagnosis
      const updatedDiagnosis = await tx.diagnosis.update({
        where: { id },
        data: {
          ...data,
          symptoms: {
            connect: newSymptomIds.map((symptomId) => ({
              symptomId
            }))
          }
        },
        include: {
          symptoms: true,
          disease: true
        }
      });

      return updatedDiagnosis;
    });
  }

  /**
   * Delete Diagnosis by ID
   * @param {string} id
   * @returns {Promise<Object>} Deleted diagnosis
   */
  async delete(id) {
    return this.diagnoses.delete({
      where: { id }
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
   * @param {Array<string>} symptoms - Array of symptom identifiers to match
   * @returns {Promise<Array>} Array of diagnosis objects that include all specified symptoms
   */
  async getDiagnosesBySymptoms(symptoms) {
    return this.diagnoses.findMany({
      where: {
        symptoms: {
          every: {
            symptom: {
              in: symptoms
            }
          }
        },
      },
      include: {
        symptoms: true,
        disease: true
      }
    });
  }

  /**
   * Retrieves all diagnoses for a specific disease
   * @param {string} diseaseId - The unique identifier of the disease
   * @returns {Promise<Array>} Array of diagnosis objects associated with the disease
   */
  async getDiagnosesByDiseaseId(diseaseId) {
    return this.diagnoses.findMany({
      where: {
        diseaseId
      },
      include: {
        symptoms: true,
        disease: true
      }
    });
  }

  /**
   * Retrieves all diagnoses for a specific user
   * @param {string} userId - The unique identifier of the user
   * @returns {Promise<Array>} Array of diagnosis objects associated with the user
   */
  async getDiagnosesByUserId(userId) {
    return this.diagnoses.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: true,
        disease: true
      }
    });
  }

}
