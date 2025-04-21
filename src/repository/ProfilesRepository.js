import models from '../model/models.js';
import BaseRepositoryImpl from './BaseRepositoryImpl.js';

export default class ProfilesRepository extends BaseRepositoryImpl {
  /**
   * Create New Instance Profiles
   * @constructor
   */
  constructor() {
    super(models.Profile);
    this.profiles = models.Profile;
  }

  /**
   * Get Profile By Email
   * @param email {string}
   * @returns {Prisma.Prisma__ProfileClient<GetResult<Prisma.$ProfilePayload<DefaultArgs>, {where: {userEmail}, omit: {password: boolean}}, "findFirstOrThrow", Prisma.PrismaClientOptions>, never, DefaultArgs, Prisma.PrismaClientOptions>}
   */
  async getByUserEmail(email) {
    return this.profiles.findFirst({
      where: {
        userEmail: email
      }
    });
  }

  /**
   *
   * @param email {string}
   * @param data {{
   *   age: number,
   *   image: string,
   *   gender: string
   * }}
   *
   */
  async updateByUserEmail(email, data) {
    await this.profiles.update({
      where: {
        userEmail: email
      },
      data
    });
  }

  /**
   * Delete Profile By User Email
   * @param email {string}
   * @return
   */
  async deleteByUserEmail(email) {
    await this.profiles?.delete({
      where: {
        userEmail: email
      }
    });
  }
}
