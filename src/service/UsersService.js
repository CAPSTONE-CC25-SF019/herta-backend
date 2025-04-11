// eslint-disable-next-line no-unused-vars
import { Prisma } from '@prisma/client';

import ErrorService from '../error/ErrorService.js';
import UsersRepository from '../repository/UsersRepository.js';
import BaseService from './BaseService.js';

export default class UsersService extends BaseService {
  constructor() {
    super(new UsersRepository(), 'users');
    /**
     *
     * @type {UsersRepository}
     */
    this.usersRepository = this.repository;
  }

  /**
   * Get All Users by Cursor Pagination
   * @param options {{pagination: {size: number, before: string?, after: string?}}}
   * @return {Promise<Object>} - Return object with required information
   * @throws {ErrorService}
   */
  async getAll(options) {
    try {
      const data = await this.usersRepository.getAll({
        size: options.pagination.size ?? 10,
        after: options.pagination.after ?? '',
        before: options.pagination.before ?? ''
      });
      return data;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const id = options.pagination?.after ?? options.pagination?.before;
        return error?.code === 'P2025'
          ? ErrorService.notFound(this.entityName, id)
          : this.handleError(error);
      }
    }
  }

  /**
   * @param options {{payload: {email: string, password: string}}}
   * @returns {Promise<Object>}
   */
  async login(options) {
    try {
      const data = await this.usersRepository.getByEmail(
        options?.payload?.email
      );
    } catch (error) {
      return this.handleError(error);
    }
  }
}
