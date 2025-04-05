import bcrypt from 'bcrypt';

export default class Hash {
  constructor() {
    try {
      this.salt = bcrypt.genSaltSync(parseInt(process.env.HASH_SALT) || 10);
      this.secret = process.env.HASH_SECRET_KEY;
      if (!this.secret) {
        throw new Error(
          'Required: The secret key cannot be empty. Please set HASH_SECRET_KEY in the environment variables.'
        );
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Hash Password
   * @param password {string}
   * @returns {string}
   */
  hashPassword(password) {
    return bcrypt.hashSync(password, this.salt);
  }

  /**
   * Verify Password
   * @param password {string}
   * @param hashPassword {string}
   * @returns {boolean}
   */
  verifyPassword(password, hashPassword) {
    return bcrypt.compareSync(password, hashPassword);
  }
}
