import { Prisma } from '@prisma/client';

// eslint-disable-next-line no-unused-vars
// import Hash from '../config/hash/bcrypt.js';
// eslint-disable-next-line no-unused-vars
// import Jwe from '../config/jwt/jwe.js';
// eslint-disable-next-line no-unused-vars
import Jws from '../config/jwt/jws.js';
import Logger from '../config/log/winston.js';
import ErrorService from '../error/ErrorService.js';
import ProfilesRepository from '../repository/ProfilesRepository.js';
import UsersRepository from '../repository/UsersRepository.js';
import UsersValidation from '../validation/users.validation.js';
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
    /**
     *
     * @type {winston.Logger}
     */
    this.log = Logger.app;
  }

  /**
   * Get All Users by Cursor Pagination
   * @param options {{pagination: {size: number, before: string?, after: string?}}}
   * @return {Promise<Object>} - Return object with required information
   * @throws {ErrorService}
   */
  async getAll(options) {
    this.log.info(
      `Getting users with cursor pagination, size: ${options.pagination.size}, after: ${options.pagination.after}, before: ${options.pagination.before}`
    );
    try {
      const data = await this.usersRepository.getAll({
        size: options.pagination.size ?? 10,
        after: options.pagination.after ?? '',
        before: options.pagination.before ?? ''
      });
      this.log.info(`Successfully retrieved ${data.data.length} users`);
      return data;
    } catch (error) {
      this.log.error(`Error retrieving users: ${error.message}`);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const id = options.pagination?.after ?? options.pagination?.before;
        return error?.code === 'P2025'
          ? ErrorService.notFound({
              entityName: this.entityName,
              fieldName: 'id',
              fieldValue: id
            })
          : this.handleError(error);
      }
    }
  }

  /**
   * Get All Users with Standard Pagination
   * @param options {{pagination: {page: number, limit: number}}}
   * @return {Promise<Object>} - Return object with users and pagination info
   * @throws {ErrorService}
   */
  async getAllWithPagination(options) {
    const page = options.pagination.page ?? 1;
    const limit = options.pagination.limit ?? 10;

    this.log.info(
      `Getting users with standard pagination, page: ${page}, limit: ${limit}`
    );

    try {
      const offset = (page - 1) * limit;

      const [users, totalCount] = await Promise.all([
        this.usersRepository.getAllWithPagination({
          skip: offset,
          take: limit
        }),
        this.usersRepository.count()
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      this.log.info(
        `Successfully retrieved ${users.length} users. Page ${page} of ${totalPages}`
      );

      return {
        data: users,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      this.log.error(
        `Error retrieving users with pagination: ${error.message}`
      );
      return this.handleError(error);
    }
  }

  /**
   * @param options {{payload: {email: string, password: string}}}
   * @returns {Promise<Object>}
   */
  async login(options) {
    this.log.info(`Login attempt for email: ${options?.payload?.email}`);
    try {
      const data = await this.usersRepository.getByEmail(
        options?.payload?.email
      );
      if (
        !this.hash.verifyPassword(options?.payload.password, data?.password)
      ) {
        this.log.error(
          `Login failed for email: ${options?.payload?.email} - Invalid credentials`
        );
        throw ErrorService.unauthorized({
          entityName: this.entityName,
          message: 'email or password wrong'
        });
      }

      this.log.info(`Login successful for user: ${data.email}`);

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

      this.log.info(`Tokens generated for user: ${data.email}`);

      return {
        accessToken,
        refreshToken
      };
    } catch (error) {
      this.log.error(`Login error: ${error.message}`);
      return this.handleError(error);
    }
  }

  /**
   *
   * @param options {{refreshToken: string}}
   * @returns {Promise<{accessToken: string}|ErrorService>}
   */
  async refreshToken(options) {
    try {
      // Get the token
      const { refreshToken } = options;
      this.log.info('Successfully retrieved refresh token');
      // Verify and decrypt the token to payload
      const payloadEncrypted =
        await this.jwt.jws.refreshToken.verifyToken(refreshToken);
      const payload = await this.jwt.jwe.decryptPayload(
        payloadEncrypted.payload?.data
      );
      this.log.info('Successfully verify refresh token');
      // Validate the payload
      const { error } = UsersValidation.payloadToken.validate(payload);
      if (error)
        throw ErrorService.validation({
          entityName: this.entityName,
          message: error.details[0].message
        });
      // Find the owner the token and get the data
      const data = await this.usersRepository.getByEmail(payload?.email);
      if (!data) {
        this.log.error(`The users with email ${payload.email} not found`);
        throw ErrorService.notFound({
          entityName: this.entityName,
          fieldName: 'email',
          fieldValue: payload?.email
        });
      }
      // convert the data to access token
      this.log.info(`Successfully get users by email: ${data.email}`);
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
      return {
        accessToken
      };
    } catch (error) {
      // handle if the token has been expired
      if (error?.code === 'ERR_JWT_EXPIRED') {
        return ErrorService.forbidden({
          entityName: this.entityName,
          message: 'Refresh token has been expired'
        });
      }
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
   * @returns {Promise<{user: Object, profile: Object}>}
   */
  async register(options) {
    this.log.info(`Registering new user with email: ${options.email}`);
    try {
      const { image, age, gender, ...data } = options;
      data.password = this.hash.hashPassword(data.password);

      const createdUser = await this.usersRepository.create(data);
      this.log.info(`User created successfully with ID: ${createdUser.id}`);

      const createdProfile = await this.profilesRepository.create({
        image,
        gender,
        age,
        userEmail: data.email
      });
      this.log.info(`Profile created successfully for user: ${data.email}`);

      return { user: createdUser, profile: createdProfile };
    } catch (error) {
      this.log.error(`Registration error: ${error.message}`);
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
    this.log.info(`Updating user with email: ${options.email}`);
    try {
      const { image, gender, age, ...data } = options.data;
      const user = await this.usersRepository.getByEmail(options.email);

      if (!user) {
        this.log.error(
          `Update failed: User with email ${options.email} not found`
        );
        throw new ErrorService({
          title: 'USERS_NOT_FOUND',
          message: `users with email ${options?.email} not exists`,
          status: 404,
          code: 'NOT_FOUND'
        });
      }

      data.password = this.hash.hashPassword(data.password);
      const updatedUser = await this.usersRepository.update(user.id, data);
      this.log.info(`User data updated successfully for ID: ${user.id}`);

      const updatedProfile = await this.profilesRepository.updateByUserEmail(
        user.email,
        {
          image,
          age,
          gender
        }
      );
      this.log.info(`Profile updated successfully for user: ${data.email}`);

      return { user: updatedUser, profile: updatedProfile };
    } catch (error) {
      this.log.error(`Update error: ${error.message}`);
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
    this.log.info(`Deleting user with email: ${options.email}`);
    try {
      const user = await this.usersRepository.getByEmail(options.email);
      if (!user) {
        this.log.error(
          `Delete failed: User with email ${options.email} not found`
        );
        throw new ErrorService({
          title: 'USERS_NOT_FOUND',
          message: `users with email ${options?.email} not exists`,
          status: 404,
          code: 'NOT_FOUND'
        });
      }

      await this.profilesRepository.deleteByUserEmail(options.email);
      this.log.info(`Profile deleted successfully for user: ${options.email}`);

      await this.usersRepository.deleteByEmail(options.email);
      this.log.info(`User deleted successfully with email: ${options.email}`);

      return { message: `User ${options.email} successfully deleted` };
    } catch (error) {
      this.log.error(`Delete error: ${error.message}`);
      return this.handleError(error);
    }
  }
}
