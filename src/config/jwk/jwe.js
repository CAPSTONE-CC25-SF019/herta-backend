import { importJWK } from 'jose';

import readKeyCert from '../../utils/readKeyCert.js';

export default {
  /**
   * Private Key for Json Web Encryption (JWE)
   * @type {CryptoKey}
   */
  privateKey: await importJWK(readKeyCert('jwe-key-private.json'), 'ECDH-ES'),

  /**
   * Public Key for Json Web Encryption (JWE)
   * @type {CryptoKey}
   */
  publicKey: await importJWK(readKeyCert('jwe-key-public.json'), 'ECDH-ES')
};
