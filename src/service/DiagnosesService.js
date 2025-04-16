// eslint-disable-next-line
import MachineLearningAPI from '../config/api/MachineLearningAPI.js';
import Logger from '../config/log/winston.js';
import ErrorService from '../error/ErrorService.js';
import DiagnosesRepository from '../repository/DiagnosesRepository.js';
import SymptomsRepository from '../repository/SymptomsRepository.js';
import UsersRepository from '../repository/UsersRepository.js';
import BaseService from './BaseService.js';

export default class DiagnosesService extends BaseService {
  constructor(MachineLearningAPI) {
    super(new DiagnosesRepository(), 'diagnoses');
    /**
     *
     * @type {DiagnosesRepository}
     */
    this.diagnosesRepository = this.repository;
    this.symptomsRepository = new SymptomsRepository();
    this.usersRepository = new UsersRepository();
    /**
     * @type {MachineLearningAPI}
     */
    this.mlAPIClient = MachineLearningAPI;

    /**
     * @type {winston.Logger}
     */
    this.log = Logger.app;
  }

  /**
   *
   * @param data {{credential: Object, symptomNames: Array<string>}}
   * @returns {Promise<Object>}
   */
  async create(data) {
    try {
      const { credential, symptomNames } = data;
      this.log.info('Retrieve request new diagnose for user');
      // Validate the users if registered or not
      const user = await this.usersRepository.getByEmail(credential.email);
      if (!user) {
        this.log.info(
          'Failed to create diagnose for user because user does not exist'
        );
        throw ErrorService.notFound({
          entityName: 'users',
          fieldName: 'email',
          fieldValue: credential.email
        });
      }

      const diagnoses = await this.mlAPIClient.predictions({
        symptoms: symptomNames
      });

      this.log.info('Successfully validation users');
      this.log.info('Creating diagnose for user');


      this.log.info('Successfully create diagnoses for user');

      const result = await this.diagnosesRepository.create({
        predictions: diagnoses,
        user: credential
      });
      return {
        data: result
      };
    } catch (error) {
      this.log.error('Error creating diagnose for user', error?.message);
      return this.handleError(error);
    }
  }

  /**
   * Update an existing diagnosis
   * @param {{userId: string, id: string}} data - Update data
   * @param {Array<string>} symptoms - New symptom IDs to associate
   * @returns {Promise<{data: Object}>} Updated diagnosis
   */
  async update(data, symptoms) {
    try {
      this.log.info(
        `Request received to update diagnosis with ID: ${data?.id}`
      );

      // Validate parameters
      if (!data) {
        this.log.error('Diagnosis ID is missing from the request');
        throw ErrorService.validation({
          entityName: this.entityName,
          message: 'Diagnosis ID and User ID is required'
        });
      }

      // Validate users is existing or not
      await this.#validateUserId(data?.userId);

      // Validate symptom IDs if provided
      await this.#validateSymptoms(symptoms);

      // Check if diagnosis exists
      const existingDiagnosis = await this.diagnosesRepository.get(data?.id);
      if (!existingDiagnosis) {
        this.log.error(`No diagnosis found with ID: ${data?.id}`);
        throw ErrorService.notFound({
          entityName: 'diagnosis',
          fieldName: 'id',
          fieldValue: data?.id
        });
      }
      const updatedDiagnosis = await this.diagnosesRepository.update(
        data,
        symptoms || []
      );
      this.log.info(`Diagnosis with ID ${data.id} updated successfully`);

      return {
        data: updatedDiagnosis
      };
    } catch (error) {
      this.log.error(
        `Failed to update diagnosis with ID ${data.id}: ${error.message}`
      );
      return this.handleError(error);
    }
  }

  /**
   * Delete a diagnosis by ID
   * @param {{userId: string, id: string }} data - Diagnosis ID and User ID to delete
   * @returns {Promise<{data: Object}>} Deleted diagnosis info
   */
  async delete(data) {
    try {
      const { id, userId } = data;
      this.log.info(`Request received to delete diagnosis with ID: ${id}`);

      if (!id) {
        this.log.error('Diagnosis ID is missing from the request');
        throw ErrorService.validation({
          entityName: this.entityName,
          message: 'Diagnosis ID is required'
        });
      }

      // Check if diagnosis exists
      const existingDiagnosis = await this.diagnosesRepository.get(id);
      if (!existingDiagnosis) {
        this.log.error(`No diagnosis found with ID: ${id}`);
        throw ErrorService.notFound({
          entityName: 'diagnosis',
          fieldName: 'id',
          fieldValue: id
        });
      }

      // Validate users is existing or not
      await this.#validateUserId(userId);

      const deletedDiagnosis = await this.diagnosesRepository.delete(data);
      this.log.info(`Diagnosis with ID ${id} deleted successfully`);

      return {
        data: deletedDiagnosis
      };
    } catch (error) {
      this.log.error(
        `Failed to delete diagnosis with ID ${data?.id}: ${error.message}`
      );
      return this.handleError(error);
    }
  }

  /**
   * Get diagnosis statistics for a user
   * @param {string} userId - User ID
   * @returns {Promise<{data: Object}>} Diagnosis statistics
   */
  async getStatistics(userId) {
    try {
      this.log.info(
        `Request received to fetch diagnosis statistics for user ID: ${userId}`
      );

      // Check users exists
      await this.#validateUserId(userId);

      const statistics = await this.diagnosesRepository.getStatistics(userId);
      this.log.info(
        `Successfully retrieved diagnosis statistics for user ID ${userId}`
      );

      return {
        data: statistics
      };
    } catch (error) {
      this.log.error(
        `Failed to get diagnosis statistics for user ${userId}: ${error.message}`
      );
      return this.handleError(error);
    }
  }
  /**
   * Get diagnoses by symptoms
   * @param {Array<string>} symptoms - Array of symptom names
   * @returns {Promise<{data: Array}>} Matching diagnoses
   */
  async getBySymptoms(symptoms) {
    try {
      this.log.info(
        `Request received to fetch diagnoses by symptoms: ${JSON.stringify(symptoms)}`
      );

      // Validate symptoms
      await this.#validateSymptoms(symptoms);

      const diagnoses = await this.diagnosesRepository.getBySymptoms(symptoms);
      this.log.info(
        `Successfully fetched ${diagnoses.length} diagnoses matching the provided symptoms`
      );

      return {
        data: diagnoses
      };
    } catch (error) {
      this.log.error(`Failed to fetch diagnoses by symptoms: ${error.message}`);
      return this.handleError(error);
    }
  }

  /**
   * Get diagnoses by disease ID
   * @param {string} diseaseId - Disease ID
   * @returns {Promise<{data: Array}>} Diagnoses for the disease
   */
  async getByDiseaseId(diseaseId) {
    try {
      this.log.info(
        `Request received to fetch diagnoses for disease ID: ${diseaseId}`
      );

      // Validate diseaseId
      await this.#validateDiseaseId(diseaseId);

      const diagnoses =
        await this.diagnosesRepository.getByDiseaseId(diseaseId);
      this.log.info(
        `Successfully fetched ${diagnoses.length} diagnoses for disease ID ${diseaseId}`
      );

      return {
        data: diagnoses
      };
    } catch (error) {
      this.log.error(
        `Failed to fetch diagnoses for disease ${diseaseId}: ${error.message}`
      );
      return this.handleError(error);
    }
  }

  /**
   * Get diagnoses by symptoms
   * @param {{ userId: string, symptoms: Array<string> }} data - include  Array of symptom identifiers to match and userId
   * @returns {Promise<{data: Array}>} Matching diagnoses
   */
  async getBySymptomsAndUserId(data) {
    try {
      const { symptoms, userId } = data;

      this.log.info(
        `Request received to fetch diagnoses by symptoms: ${JSON.stringify(symptoms)}`
      );

      // Validate symptoms
      await this.#validateSymptoms(symptoms);

      // Check if user exists
      await this.#validateUserId(userId);

      const diagnoses =
        await this.diagnosesRepository.getBySymptomsAndUserId(data);
      this.log.info(
        `Successfully fetched ${diagnoses.length} diagnoses matching the provided symptoms`
      );

      return {
        data: diagnoses
      };
    } catch (error) {
      this.log.error(`Failed to fetch diagnoses by symptoms: ${error.message}`);
      return this.handleError(error);
    }
  }

  /**
   * Get diagnoses by disease ID
   * @param {{ diseaseId: string, userId: string }} data - include of disease identifiers to match and userId
   * @returns {Promise<{data: Array}>} Diagnoses for the disease
   */
  async getByDiseaseIdAndUserId(data) {
    try {
      const { diseaseId, userId } = data;

      this.log.info(
        `Request received to fetch diagnoses for disease ID: ${diseaseId}`
      );

      // Validate diseaseId
      await this.#validateDiseaseId(diseaseId);

      // Check the userId
      await this.#validateUserId(userId);

      const diagnoses =
        await this.diagnosesRepository.getByDiseaseId(diseaseId);
      this.log.info(
        `Successfully fetched ${diagnoses.length} diagnoses for disease ID ${diseaseId}`
      );

      return {
        data: diagnoses
      };
    } catch (error) {
      this.log.error(
        `Failed to fetch diagnoses for disease ${data?.diseaseId}: ${error.message}`
      );
      return this.handleError(error);
    }
  }

  /**
   * Get all diagnoses for a specific user
   * @param {string} userId - User ID
   * @returns {Promise<{data: Array}>} User's diagnoses
   */
  async getByUserId(userId) {
    try {
      this.log.info(
        `Request received to fetch diagnoses for user ID: ${userId}`
      );

      // Check if user exists
      await this.#validateUserId(userId);

      const diagnoses = await this.diagnosesRepository.getByUserId(userId);
      this.log.info(
        `Successfully fetched ${diagnoses.length} diagnoses for user ID ${userId}`
      );

      return {
        data: diagnoses
      };
    } catch (error) {
      this.log.error(
        `Failed to fetch diagnoses for user ${userId}: ${error.message}`
      );
      return this.handleError(error);
    }
  }

  /**
   * Get all diagnoses with pagination
   * @param {Object} options - Pagination options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.size - Items per page (default: 10)
   * @returns {Promise<{data: Array, pagination: Object}>} Paginated diagnoses
   */
  async getAllWithPagination(options) {
    try {
      const { page = 1, size = 10 } = options || {};
      this.log.info(
        `Request received to fetch all diagnoses with pagination: page=${page}, size=${size}`
      );

      // Validate pagination parameters
      if (page < 1 || size < 1) {
        this.log.error(
          `Invalid pagination parameters provided: page=${page}, size=${size}`
        );
        throw ErrorService.validation({
          message: 'Pagination parameters must be positive numbers',
          fieldName: 'pagination'
        });
      }

      const result = await this.diagnosesRepository.getAllByPagination({
        pagination: { page, limit: size }
      });

      this.log.info(
        `Successfully fetched ${result.diagnoses.length} diagnoses (page ${result.pagination.currentPage})`
      );

      return {
        data: result.diagnoses,
        pagination: result.pagination
      };
    } catch (error) {
      this.log.error(
        `Failed to fetch diagnoses with pagination: ${error.message}`
      );
      return this.handleError(error);
    }
  }

  async #validateUserId(userId) {
    if (!userId) {
      this.log.error('User ID is missing from the request');
      throw ErrorService.validation({
        message: 'User ID is required',
        fieldName: 'userId'
      });
    }

    const user = await this.usersRepository.get(userId);
    if (!user) {
      this.log.error(`No user found with ID: ${userId}`);
      throw ErrorService.notFound({
        entityName: 'users',
        fieldName: 'id',
        fieldValue: userId
      });
    }
  }

  async #validateSymptoms(symptoms) {
    // Validate symptoms
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      this.log.error('Invalid or missing symptoms array in request');
      throw ErrorService.validation({
        message: 'A valid, non-empty symptoms array is required',
        fieldName: 'symptoms'
      });
    }
  }

  async #validateDiseaseId(diseaseId) {
    if (!diseaseId) {
      this.log.error('Disease ID is missing from the request');
      throw ErrorService.validation({
        message: 'Disease ID is required',
        fieldName: 'diseaseId'
      });
    }
  }
}
