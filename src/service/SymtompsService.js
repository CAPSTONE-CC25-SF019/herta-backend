import Logger from '../config/log/winston.js';
import ErrorService from '../error/ErrorService.js';
import SymptomsRepository from '../repository/SymptomsRepository.js';
import BaseService from './BaseService.js';

/**
 * Service layer for handling symptom-related operations.
 * Extends the BaseService with specific methods for symptoms.
 */
export default class SymptomsService extends BaseService {
  constructor() {
    super(new SymptomsRepository(), 'symptoms');

    /**
     * @type {SymptomsRepository}
     */
    this.symptomsRepository = this.repository;

    /**
     * @type {winston.Logger}
     */
    this.log = Logger.app;
  }

  /**
   * Retrieves a symptom by its name.
   *
   * @param {string} symptom - The name of the symptom to retrieve.
   * @returns {Promise<{data: Object}>} The retrieved symptom data.
   */
  async getByName(symptom) {
    try {
      this.log.info(`Attempting to retrieve symptom by name: ${symptom}`);

      const data = await this.symptomsRepository.getByName(symptom);
      if (!data) {
        this.log.warn(`Symptom not found with name: ${symptom}`);
        throw ErrorService.notFound({
          entityName: this.entityName,
          fieldName: 'name',
          fieldValue: symptom
        });
      }

      this.log.info(`Successfully retrieved symptom with name: ${symptom}`);
      return { data };
    } catch (error) {
      this.log.error(
        `Failed to retrieve symptom with name: ${symptom}. ${error?.message}`
      );
      return this.handleError(error);
    }
  }

  /**
   * Retrieves all symptoms associated with specific diseases.
   *
   * @param {string[]} diseases - The names of diseases to retrieve symptoms for.
   * @returns {Promise<{data: Array}>} The retrieved symptoms data.
   */
  async getByDiseases(diseases) {
    try {
      this.log.info(`Fetching symptoms related to diseases: ${diseases}`);

      const data = await this.symptomsRepository.getAllByDiseases(diseases);

      this.log.info(
        `Successfully retrieved ${data.length} symptoms for diseases: ${diseases}`
      );
      return { data };
    } catch (error) {
      this.log.error(
        `Failed to retrieve symptoms for diseases: ${diseases}. ${error?.message}`
      );
      return this.handleError(error);
    }
  }

  /**
   * Retrieves all symptoms linked to a specific diagnosis ID.
   *
   * @param {string} diagnosisId - The ID of the diagnosis to retrieve symptoms for.
   * @returns {Promise<{data: Array}>} The list of symptoms associated with the diagnosis ID.
   */
  async getByDiagnosisId(diagnosisId) {
    try {
      this.log.info(`Fetching symptoms for diagnosis ID: ${diagnosisId}`);

      const symptoms =
        await this.symptomsRepository.getAllByDiagnosisId(diagnosisId);

      this.log.info(
        `Successfully retrieved ${symptoms.length} symptoms for diagnosis ID: ${diagnosisId}`
      );
      return { data: symptoms };
    } catch (error) {
      this.log.error(
        `Failed to retrieve symptoms for diagnosis ID: ${diagnosisId}. ${error?.message}`
      );
      return this.handleError(error);
    }
  }

  /**
   * Retrieves all symptoms with pagination.
   *
   * @param {Object} options - Pagination options.
   * @param {number} options.size - Number of items per page.
   * @param {number} options.page - Page number to retrieve.
   * @returns {Promise<{data: Array, pagination: {page: number, limit: number}}>} Paginated symptoms data.
   * @throws {Error} Throws BadRequest error if pagination parameters are invalid.
   */
  async getAll(options) {
    try {
      const { page, size } = options || {};

      this.log.info(
        `Received request to retrieve symptoms with pagination - page: ${page}, size: ${size}`
      );

      if (!page || !size || page < 1 || size < 1) {
        this.log.warn(
          `Invalid pagination parameters provided - page: ${page}, size: ${size}`
        );
        throw ErrorService.validation({
          message:
            'Valid pagination parameters are required (page and size must be positive numbers)',
          fieldName: 'pagination'
        });
      }

      const { symptoms, pagination } =
        await this.symptomsRepository.getAllByPagination({
          pagination: { page, limit: size }
        });

      this.log.info(
        `Successfully retrieved ${symptoms.length} symptoms with pagination: ${JSON.stringify(pagination)}`
      );
      return {
        data: symptoms,
        pagination
      };
    } catch (error) {
      this.log.error(
        `Failed to retrieve paginated symptoms for page: ${options.page}, size: ${options.size}. ${error?.message}`
      );
      return this.handleError(error);
    }
  }
}
