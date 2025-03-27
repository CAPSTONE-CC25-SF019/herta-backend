// eslint-disable-next-line no-unused-vars
import { Prisma } from '@prisma/client';

// eslint-disable-next-line no-unused-vars
import Hash from '../config/hash/bcrypt.js';
// eslint-disable-next-line no-unused-vars
import Jwe from '../config/jwt/jwe.js';
// eslint-disable-next-line no-unused-vars
import Jws from '../config/jwt/jws.js';
import ErrorService from '../error/ErrorService.js';
import ProfilesRepository from '../repository/ProfilesRepository.js';
import UsersRepository from '../repository/UsersRepository.js';
import BaseService from './BaseService.js';

export default class UsersService extends BaseService {
  /**
   * Create Instance UsersService
   * @constructor
   * @param hash {Hash}
   * @param jwt {{jwe: Jwe, jws: {accessToken: Jws, refreshToken: Jws}}}
   */
  constructor(hash, jwt) {
    super(new UsersRepository(), 'users');
    /**
     * @type {UsersRepository}
     */
    this.usersRepository = this.repository;
    this.profilesRepository = new ProfilesRepository();

    this.hash = hash;
    this.jwt = jwt;
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
      if (!this.hash.verifyPassword(options?.payload.password, data?.password))
        throw ErrorService.unauthorized('email or password wrong');
      const accessToken = await this.jwt.jws.accessToken.generateToken(
        {
          data: await this.jwt.jwe.encryptPayload({
            id: data.id,
            email: data.email,
            role: data.role
          })
        },
        { expiresIn: process.env?.ACCESS_TOKEN_EXPIRE }
      );
      const refreshToken = await this.jwt.jws.refreshToken.generateToken(
        {
          data: await this.jwt.jwe.encryptPayload({
            id: data.id,
            email: data.email,
            role: data.role
          })
        },
        { expiresIn: process.env?.REFRESH_TOKEN_EXPIRE }
      );
      return {
        accessToken,
        refreshToken
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create Users
   * @param options {{
   *   username: string
   *   email: string
   *   password: string
   *   role: string
   *   image: string|null
   *   age: number
   *   gender: string
   * }}
   * @returns {Promise<void>}
   */
  async register(options) {
    try {
      const { image, age, gender, ...data } = options;
      await this.usersRepository.create(data);
      await this.profilesRepository.create({
        image,
        gender,
        age,
        userEmail: data.email
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update Users
   * @override
   * @param options {{email : string, data: {
   *   username: string
   *   email: string
   *   password: string
   *   role: string
   *   image: string|null
   *   age: number
   *   gender: string
   * }}}
   * @returns {Promise<void>}
   */
  async update(options) {
    try {
      const { image, gender, age, ...data } = options.data;
      const user = await this.usersRepository.getByEmail(options.email);
      if (!user)
        throw new ErrorService(
          `users with email ${options?.email} not exists`,
          404,
          'NOT_FOUND'
        );
      if (!this.hash.verifyPassword(data.password, user.password)) {
        data.password = this.hash.hashPassword(data.password);
      }
      await this.usersRepository.update(user.id, data);
      await this.profilesRepository.updateByUserEmail(data.email, {
        image,
        age,
        gender
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete Users By Email
   * @override
   * @param options {{email: string}}
   * @returns {Promise<void>}
   */
  async delete(options) {
    try {
      const user = await this.usersRepository.getByEmail(options.email);
      if (!user)
        throw new ErrorService(
          `users with email ${options?.email} not exists`,
          404,
          'NOT_FOUND'
        );
      await this.profilesRepository.deleteByUserEmail(options.email);
      await this.usersRepository.deleteByEmail(options.email);
    } catch (error) {
      return this.handleError(error);
    }
  }
}
