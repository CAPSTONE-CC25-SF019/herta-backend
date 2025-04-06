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
    try {
      const encodedPayload = this.encoder.encode(JSON.stringify(payload));
      const encrypter = new CompactEncrypt(encodedPayload);
      encrypter.setProtectedHeader({ alg: this.algorithm, enc: 'A256GCM' });

      return await encrypter.encrypt(this.publicKey);
    } catch (error) {
      console.error('Error encrypting payload:', error);
      throw error;
    }
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
    try {
      const decryptResult = await compactDecrypt(
        encryptedPayload,
        this.privateKey
      );
      const decodedResult = this.decoder.decode(decryptResult.plaintext);
      return JSON.parse(decodedResult);
    } catch (error) {
      console.error('Error decrypting payload:', error);
      throw error;
    }
  }
}
