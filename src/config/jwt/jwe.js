import { CompactEncrypt, compactDecrypt } from 'jose';

/**
 * @define {Jwe} - JSON Web Encryption
 */
export default class Jwe {
  /**
   * Create New Instance Jwe
   * @param {{privateKey: CryptoKey, publicKey: CryptoKey, algorithm: string}} options - Configuration options for Json Web Encrypt.
   */
  constructor(options = {}) {
    try {
      if (!options.privateKey || !options.publicKey)
        throw new Error('Private Key and Public Key is required');
      this.privateKey = options.privateKey;
      this.publicKey = options.publicKey;
      this.algorithm = options.algorithm;
      this.decoder = new TextDecoder();
      this.encoder = new TextEncoder();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Encrypt the payload include sensitive data
   *
   * @async
   * @param {Object} payload
   * @returns {Promise<string>}
   */
  async encryptPayload(payload) {
    return await new CompactEncrypt(
      this.encoder.encode(JSON.stringify(payload))
    )
      .setProtectedHeader({ alg: this.algorithm, enc: 'A256GCM' })
      .encrypt(this.publicKey);
  }

  /**
   * Decrypt the Payload
   *
   * @async
   * @param {string} encryptedPayload
   * @returns {Promise<Object>}
   * @throws {Error} - Error if the encryptedPayload invalid format
   */
  async decryptPayload(encryptedPayload) {
    return JSON.parse(
      this.decoder.decode(
        (await compactDecrypt(encryptedPayload, this.privateKey)).plaintext
      )
    );
  }
}
