import Logger from '../config/log/winston.js';
import ErrorService from '../error/ErrorService.js';
import DiseasesRepository from '../repository/DiseasesRepository.js';
import BaseService from './BaseService.js';

/**
 * Service class for handling disease-related business logic.
 * Inherits common functionality from BaseService.
 */
export default class DiseasesService extends BaseService {
  /**
   * Constructs the DiseasesService.
   * Initializes repository and logger.
   */
  constructor() {
    super(new DiseasesRepository(), 'disease');

    /**
     * @type {DiseasesRepository}
     */
    this.diseaseRepository = this.repository;

    /**
     * @type {winston.Logger}
     */
    this.log = Logger.app;
  }

  /**
   * Retrieves all diseases with pagination
   *
   * @param {Object} options - Pagination options
   * @param {number} options.size - Number of items per page
   * @param {number} options.page - Page number to retrieve
   * @returns {Promise<{data: Array, pagination: {page: number, limit: number}}>} Paginated diseases data
   * @throws {Error} Throws BadRequest error if pagination parameters are invalid
   */
  async getAll(options) {
    try {
      const { page, size } = options || {};

      this.log.info(
        `Request received to fetch all diseases with pagination: page=${page}, size=${size}`
      );

      // Validate pagination parameters
      if (!page || !size || page < 1 || size < 1) {
        this.log.error(
          `Invalid pagination parameters provided: page=${page}, size=${size}`
        );
        throw ErrorService.validation({
          message:
            'Valid pagination parameters are required (both page and size must be positive numbers)',
          fieldName: 'pagination'
        });
      }

      const { diseases, pagination } =
        await this.diseaseRepository.getAllPagination({
          pagination: { page, limit: size }
        });

      this.log.info(
        `Fetched ${diseases.length} diseases (page ${pagination.page} of ${Math.ceil(pagination.total / pagination.limit)})`
      );

      return {
        data: diseases,
        pagination
      };
    } catch (error) {
      this.log.error(
        `Failed to fetch diseases with pagination: ${error.message}`
      );
      return this.handleError(error);
    }
  }

  /**
   * Retrieves a disease by its ID
   *
   * @param {string|number} id - The unique identifier of the disease to retrieve
   * @returns {Promise<{data: Object}>} Object containing the disease data
   * @throws {Error} Throws NotFound error if disease doesn't exist
   * @throws {Error} Throws BadRequest error if id is missing
   */
  async getById(id) {
    try {
      this.log.info(`Request received to fetch disease by ID: ${id}`);

      // Validate id
      if (!id) {
        this.log.error('Disease ID is missing from the request');
        throw ErrorService.validation({
          entityName: this.entityName,
          message: 'Disease ID is required'
        });
      }

      const disease = await this.diseaseRepository.getById(id);
      if (!disease) {
        this.log.error(`No disease found with ID: ${id}`);
        throw ErrorService.notFound({
          entityName: 'disease',
          fieldName: 'id',
          fieldValue: id
        });
      }

      this.log.info(`Disease with ID ${id} retrieved successfully`);
      return {
        data: disease
      };
    } catch (error) {
      this.log.error(`Failed to fetch disease by ID ${id}: ${error.message}`);
      return this.handleError(error);
    }
  }

  /**
   * Retrieves diseases that match the given symptoms
   *
   * @param {Array<string>} symptoms - Array of symptom identifiers to search for
   * @returns {Promise<{data: Array<Object>}>} Object containing an array of matching diseases
   * @throws {Error} Throws BadRequest error if symptoms array is invalid or empty
   */
  async getBySymptoms(symptoms) {
    try {
      this.log.info(
        `Request received to fetch diseases by symptoms: ${JSON.stringify(symptoms)}`
      );

      // Validate symptoms
      if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
        this.log.error('Invalid or missing symptoms array in request');
        throw ErrorService.validation({
          message: 'A valid, non-empty symptoms array is required',
          fieldName: 'symptoms'
        });
      }

      const diseases = await this.diseaseRepository.getAllBySymptoms(symptoms);

      this.log.info(
        `Successfully fetched ${diseases.length} diseases matching the provided symptoms`
      );
      return {
        data: diseases
      };
    } catch (error) {
      this.log.error(`Failed to fetch diseases by symptoms: ${error.message}`);
      return this.handleError(error);
    }
  }
}
