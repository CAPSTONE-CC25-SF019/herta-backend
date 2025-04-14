// eslint-disable-next-line no-unused-vars
import models from '../model/models.js';
import BaseRepository from './BaseRepository.js';

/**
 * Implementation BaseRepository With include CRUD Operations
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
   * @param {typeof models[T]} entityName - Prisma model (e.g., prisma.user, prisma.post)
   */
  constructor(entity) {
    super();
    this.entity = entity;
  }

  /**
   * Get by ID
   *
   * @param {number|string} id - Most id are located in the primary key in the table that has been defined
   * @returns {Promise<object>} - Returns one row of data from the database table that the object represents
   * @throws {Error} - Can return error if the retrieved data does not exist
   */
  async get(id) {
    const result = await this.entity.findUnique({
      where: { id }
    });

    return result;
  }

  /**
   * Create Method for Create by ID
   *
   * @param {object} entity - Represents the data to be created represented as an object
   * @returns {Promise<object>} - Returns one row of data from the database table that the object represents has created
   * @throws {Error} - Can return error if the retrieved data does has created or conflict
   */
  async create(entity) {
    const result = await this.entity.create({
      data: entity
    });

    return result;
  }

  /**
   * Update by ID
   *
   * @param {number|string} id - Most id are located in the primary key in the table that has been defined
   * @param {object} entity - Represents the data to be updated represented as an object
   * @returns {Promise<object>} - Returns one row of data from the database table that the object represents has updated
   * @throws {Error} - Can return error if the retrieved data does not exist
   */
  async update(id, entity) {
    const result = await this.entity.update({
      where: { id },
      data: entity
    });

    return result;
  }

  /**
   * Delete by ID
   *
   * @param {number|string} id - The ID of the entity to delete
   * @returns {Promise<object>} - Returns the deleted entity
   * @throws {Error} - Can return error if the deletion fails
   */
  async delete(id) {
    const result = await this.entity.delete({
      where: { id }
    });

    return result;
  }
}
