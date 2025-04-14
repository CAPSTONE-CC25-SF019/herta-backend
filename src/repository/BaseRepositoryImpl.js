// eslint-disable-next-line no-unused-vars
import models from '../model/models.js';
import BaseRepository from './BaseRepository.js';

/**
 * Implementation BaseRepository With include CRUD Operations
 * Supports configurable primary key fields
 *
 * @export
 * @class BaseRepositoryImpl
 * @typedef {BaseRepositoryImpl<T>}
 * @template {keyof typeof models} T
 * @extends {BaseRepository}
 */
export default class BaseRepositoryImpl extends BaseRepository {
  /**
   * @type {typeof models[T]} Prisma model (e.g., prisma.user, prisma.post)
   */
  entity;

  /**
   * @type {string} Primary key field name to use for operations
   */
  primaryKeyField;

  /**
   * @param {typeof models[T]} entity - Prisma model (e.g., prisma.user, prisma.post)
   * @param {string} [primaryKeyField='id'] - Primary key field name (defaults to 'id')
   */
  constructor(entity, primaryKeyField = 'id') {
    super();
    this.entity = entity;
    this.primaryKeyField = primaryKeyField;
  }

  /**
   * Get by primary key value
   *
   * @param {number|string} value - Value of the primary key field
   * @returns {Promise<object>} - Returns one row of data from the database table
   * @throws {Error} - Can return error if the retrieved data does not exist
   */
  async get(value) {
    const where = {};
    where[this.primaryKeyField] = value;

    const result = await this.entity.findUnique({
      where
    });

    return result;
  }

  /**
   * Create Method for Create a new entity
   *
   * @param {object} entity - Represents the data to be created represented as an object
   * @returns {Promise<object>} - Returns one row of data from the database table that has been created
   * @throws {Error} - Can return error if the data creation fails or conflicts
   */
  async create(entity) {
    const result = await this.entity.create({
      data: entity
    });

    return result;
  }

  /**
   * Update by primary key value
   *
   * @param {number|string} value - Value of the primary key field
   * @param {object} entity - Represents the data to be updated represented as an object
   * @returns {Promise<object>} - Returns one row of data from the database table that has been updated
   * @throws {Error} - Can return error if the retrieved data does not exist
   */
  async update(value, entity) {
    const where = {};
    where[this.primaryKeyField] = value;

    const result = await this.entity.update({
      where,
      data: entity
    });

    return result;
  }

  /**
   * Delete by primary key value
   *
   * @param {number|string} value - Value of the primary key field
   * @returns {Promise<object>} - Returns the deleted entity
   * @throws {Error} - Can return error if the deletion fails
   */
  async delete(value) {
    const where = {};
    where[this.primaryKeyField] = value;

    const result = await this.entity.delete({
      where
    });

    return result;
  }
}
