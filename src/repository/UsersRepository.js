import models from '../model/models.js';
import BaseRepositoryImpl from './BaseRepositoryImpl.js';

export default class UsersRepository extends BaseRepositoryImpl {
  constructor() {
    super(models.User);
    this.user = models.User;
  }

  /**
   * Get All Users By Cursor Pagination
   *
   * @async
   * @param {Object} options - Pagination options
   * @param {number} [options.size=10] - Number of items per page
   * @param {string} [options.before] - Cursor for pagination backward
   * @param {string} [options.after] - Cursor for pagination forward
   * @param {string} [options.orderBy='createdAt'] - Field to order by
   * @param {'asc'|'desc'} [options.orderDirection='desc'] - Order direction
   * @returns {Promise<{items: Array, pageInfo: Object}>} Paginated results with items and page info
   */
  async getAll(options) {
    // Default values
    const size = options.size ?? 10;
    const orderBy = options.orderBy ?? 'createdAt';
    const orderDirection = options.orderDirection ?? 'desc';

    // Prepare take parameter (positive for forward, negative for backward pagination)
    let take = size;
    if (options.before) {
      take = -size; // Negative take for backward pagination
    }

    // Base query
    const query = {
      take,
      orderBy: {
        [orderBy]: orderDirection
      },
      // Include one more item to check if there's a next/previous page
      skip: 0,
      omit: {
        password: true,
        deletedAt: true
      }
    };

    // Add cursor for forward pagination
    if (options.after) {
      query.cursor = {
        id: options.after
      };
      query.skip = 1; // Skip the cursor item
    }

    // Add cursor for backward pagination
    if (options.before) {
      query.cursor = {
        id: options.before
      };
      query.skip = 1; // Skip the cursor item
    }

    // Execute query
    const items = await this.user.findMany(query);

    // Check if there are more items (next/previous page)
    const hasMore = items.length > size;

    // Remove the extra item we used to check for more pages
    const nodes = hasMore ? items.slice(0, size) : items;

    // If we're paginating backward, we need to reverse the items
    const resultItems = options.before ? nodes.reverse() : nodes;

    // Get cursors for the first and last items
    const startCursor = resultItems.length > 0 ? resultItems[0].id : null;
    const endCursor =
      resultItems.length > 0 ? resultItems[resultItems.length - 1].id : null;

    return {
      items: resultItems,
      pageInfo: {
        hasNextPage: options.before ? true : hasMore,
        hasPreviousPage: options.after ? true : hasMore,
        startCursor,
        endCursor,
        totalCount: resultItems.length
      }
    };
  }

  /**
   * Get User By Email
   *
   * @async
   * @param {string} email
   * @returns {Promise<Object>}
   */
  async getByEmail(email) {
    return this.user.findFirst({
      where: {
        email
      },
      omit: {
        deletedAt: true
      }
    });
  }

  /**
   * Update Users By Email
   * @param email {string}
   * @param data {Object}
   * @returns {Promise<void>}
   */
  async updateByEmail(email, data) {
    await this.user.update({
      where: {
        email
      },
      omit: {
        deletedAt: true,
        password: true
      },
      data
    });
  }

  /**
   * Delete Users By Email
   * @param email {string}
   * @returns {Promise<void>}
   */
  async deleteByEmail(email) {
    await this.user.delete({
      where: {
        email
      }
    });
  }

  /**
   * Get User with The All Relation
   * @param email {string}
   * @returns {Promise<Prisma.Prisma__UserClient<GetResult<Prisma.$UserPayload<DefaultArgs>, {where: {email}, include: {profile: boolean, diagnoses: boolean}}, "findFirstOrThrow", Prisma.PrismaClientOptions>, never, DefaultArgs, Prisma.PrismaClientOptions>>}
   */
  async getUserWithRelationByEmail(email) {
    return this.user.findFirstOrThrow({
      where: {
        email
      },
      omit: {
        deletedAt: true,
        password: true,
        role: true
      },
      include: {
        profile: {
          select: {
            id: true,
            image: true,
            gender: true
          }
        },
        diagnoses: true
      }
    });
  }
}
