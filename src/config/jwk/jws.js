import { importJWK } from 'jose';

import readKeyCert from '../../utils/readKeyCert.js';

export default {
  /**
   * Private Key for Json Web Signing (JWS) Access Token
   * @type {CryptoKey}
   */
  accessTokenPrivateKey: await importJWK(
    readKeyCert('jws-access-token-key-private.json'),
    'EdDSA'
  ),

  /**
   * Public Key for Json Web Signing (JWS) Access Token
   * @type {CryptoKey}
   */
  accessTokenPublicKey: await importJWK(
    readKeyCert('jws-access-token-key-public.json'),
    'EdDSA'
  ),

  /**
   * Private Key for Json Web Signing (JWS) Refresh Token
   * @type {CryptoKey}
   */
  refreshTokenPrivateKey: await importJWK(
    readKeyCert('jws-refresh-token-key-private.json'),
    'EdDSA'
  ),

  /**
   * Public Key for Json Web Signing (JWS) Refresh Token
   * @type {CryptoKey}
   */
  refreshTokenPublicKey: await importJWK(
    readKeyCert('jws-refresh-token-key-public.json'),
    'EdDSA'
  ),

  /**
   * Private Key for Json Web Signing (JWS) Forgot Password
   * @type {CryptoKey}
   */
  fpPrivateKey: await importJWK(
    readKeyCert('jws-fp-key-private.json'),
    'EdDSA'
  ),

  /**
   * Public Key for Json Web Signing (JWS) Forgot Password
   * @type {CryptoKey}
   */
  fpPublicKey: await importJWK(readKeyCert('jws-fp-key-public.json'), 'EdDSA')
};
