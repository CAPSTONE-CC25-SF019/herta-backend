import { Prisma } from '@prisma/client';

import ErrorService from '../error/ErrorService.js';
// eslint-disable-next-line no-unused-vars
import BaseRepository from '../repository/BaseRepository.js';

/**
 * Base Service class providing CRUD operations with error handling
 */
export default class BaseService {
  /**
   * Repository instance
   * @type {BaseRepository}
   */
  repository;

  /**
   * Entity name for error messages
   * @type {string}
   */
  entityName;

  /**
   * @param {BaseRepository} repository - Repository instance
   * @param {string} entityName - Entity name for error messages
   */
  constructor(repository, entityName) {
    this.repository = repository;
    this.entityName = entityName;
  }

  /**
   * Get entity by ID
   * @param {string|number} id - Entity ID
   * @returns {Promise<object>} - Entity data
   * @throws {ErrorService} - Not found error
   */
  async getById(id) {
    try {
      const entity = await this.repository.get(id);

      if (!entity) {
        throw ErrorService.notFound(this.entityName, id);
      }

      return entity;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Create new entity
   * @param {object} data - Entity data
   * @returns {Promise<object>} - Created entity
   * @throws {ErrorService} - Validation or conflict error
   */
  async create(data) {
    try {
      return await this.repository.create(data);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Update entity by ID
   * @param {string|number} id - Entity ID
   * @param {object} data - Entity data to update
   * @returns {Promise<object>} - Updated entity
   * @throws {ErrorService} - Not found or validation error
   */
  async update(id, data) {
    try {
      // Check if entity exists
      const exists = await this.repository.get(id);

      if (!exists) {
        throw ErrorService.notFound(this.entityName, id);
      }

      return await this.repository.update(id, data);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Delete entity by ID
   * @param {string|number} id - Entity ID
   * @returns {Promise<object>} - Deleted entity
   * @throws {ErrorService} - Not found error
   */
  async delete(id) {
    try {
      // Check if entity exists
      const exists = await this.repository.get(id);

      if (!exists) {
        throw ErrorService.notFound(this.entityName, id);
      }

      return await this.repository.delete(id);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handle Prisma and other errors
   * @param {Error} error - Error to handle
   * @throws {ErrorService} - Transformed error
   *
   */
  handleError(error) {
    // If it's already an ErrorService, just rethrow it
    if (error instanceof ErrorService) {
      throw error;
    }

    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint violation
      if (error.code === 'P2002') {
        const field = error.meta?.target || 'field';
        throw ErrorService.conflict({
          entityName: this.entityName,
          fieldName: field
        });
      }

      // Foreign key constraint failed
      if (error.code === 'P2003') {
        throw ErrorService.validation({
          entityName: this.entityName,
          message: `${error.message}\n related ${error.meta?.field_name || this.entityName} does not exists`
        });
      }

      // Record not found
      if (error.code === 'P2025') {
        const errService = ErrorService.notFound({
          entityName: this.entityName,
          fieldName: null,
          fieldValue: null
        });
        errService.message = `the ${error.meta.modelName.toLowerCase()} ${error.meta.cause.toString().includes('found none') ? 'not found' : error.meta.cause}`;
        throw errService;
      }
    }

    // Handle Prisma validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
      throw ErrorService.validation({
        entityName: this.entityName,
        message: error.message
      });
    }

    // Generic error handling
    throw ErrorService.server(error.message);
  }
}
