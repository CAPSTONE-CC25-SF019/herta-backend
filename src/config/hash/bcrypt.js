import bcrypt from 'bcrypt';

export default class Hash {
  constructor() {
    try {
      this.salt = bcrypt.genSaltSync(process.env.HASH_SALT | 10);
      this.secret =
        process.env.HASH_SECRET_KEY |
        new Error(
          `required the secret key cannot be empty. please fill with env variable HASH_SECRET_KEY.`
        );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Hash Password
   * @param password {string}
   * @returns {string}
   */
  hashPassword(password) {
    return bcrypt.hashSync(password, process.env.HASH_SECRET_KEY);
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
