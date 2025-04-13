/**
 * Abstract Class for BaseRepository include CRUD Operations
 *
 * @export
 * @class BaseRepository
 * @typedef {BaseRepository}
 */
export default class BaseRepository {
  /**
   * Abstract Method for Get by ID
   *
   * @param {number|string} id  Most id are located in the primary key in the table that has been defined
   * @abstract
   * @returns {Promise<object>}  Returns one row of data from the database table that the object represents
   * @throws {Error}  Can return error if the retrieved data does not exist
   */
  // eslint-disable-next-line no-unused-vars
  async get(id) {
    throw new 'Must be implement'();
  }

  /**
   * Create Method for Create by ID
   *
   * @param {object} entity  Represents the data to be created represented as an object
   * @abstract
   * @returns {Promise<object>}  Returns one row of data from the database table that the object represents has created
   * @throws {Error}  Can return error if the retrieved data does has created or conflict
   */
  // eslint-disable-next-line no-unused-vars
  async create(entity) {
    throw new 'Must be implement'();
  }

  /**
   * Abstract Method for Update by ID
   *
   * @param {number|string} id  Most id are located in the primary key in the table that has been defined
   * @param {object} entity  Represents the data to be updated represented as an object
   * @abstract
   * @returns {Promise<object>}  Returns one row of data from the database table that the object represents has updated
   * @throws {Error}  Can return error if the retrieved data does not exist
   */
  // eslint-disable-next-line no-unused-vars
  async update(id, entity) {
    throw new 'Must be implement'();
  }

  /**
   * Abstract Method for Delete by ID
   *
   * @param {number|string} id
   * @abstract
   * @throws {Error}
   */
  // eslint-disable-next-line no-unused-vars
  async delete(id) {
    throw new 'Must be implement'();
  }
}
