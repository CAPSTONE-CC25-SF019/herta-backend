import { CompactEncrypt, SignJWT, compactDecrypt, importJWK, jwtVerify } from 'jose';
import { readFile } from 'node:fs/promises';
import { cwd } from 'node:process';
import { TextEncoder , TextDecoder } from 'node:util';




// eslint-disable-next-line
it('should generate & verify JWE + JWS', async () => {
  try {
    // Load JWE Keys (ECDH-ES)
    const rawJwePkey = await readFile(`${cwd()}/cert/jwe-key-private.json`);
    const jwePrivateKey = await importJWK(
      JSON.parse(rawJwePkey.toString()),
      'ECDH-ES' // ✅ Fix Algoritma
    );

    const rawJwePubKey = await readFile(`${cwd()}/cert/jwe-key-public.json`);
    const jwePublicKey = await importJWK(
      JSON.parse(rawJwePubKey.toString()),
      'ECDH-ES' // ✅ Fix Algoritma
    );

    // Load JWS Keys (EdDSA)
    const privateKey = await readFile(
      `${cwd()}/cert/jws-access-token-key-private.json`
    );
    const jwkPrivateKey = await importJWK(
      JSON.parse(privateKey.toString()),
      'EdDSA'
    );

    const publicKey = await readFile(
      `${cwd()}/cert/jws-access-token-key-public.json`
    );
    const jwkPublicKey = await importJWK(
      JSON.parse(publicKey.toString()),
      'EdDSA'
    );

    // Enkripsi dengan JWE
    const encoder = new TextEncoder();
    const sensitiveData = await new CompactEncrypt(
      encoder.encode(
        JSON.stringify({
          id: Date.now(),
          username: 'Fahri',
          password: '123456'
        })
      )
    )
      .setProtectedHeader({ alg: 'ECDH-ES+A256KW', enc: 'A256GCM' })
      .encrypt(jwePublicKey);

    // Buat JWS (JWT dengan Signature)
    const token = await new SignJWT({ data: sensitiveData })
      .setProtectedHeader({ alg: 'EdDSA' })
      .setIssuedAt()
      .setIssuer('admin')
      .setAudience('192.168.1.10')
      .setExpirationTime('5m')
      .sign(jwkPrivateKey);

    // eslint-disable-next-line no-undef
    console.log('JWT Token:', token);

    // Verifikasi JWS
    const { payload } = await jwtVerify(token, jwkPublicKey, {
      algorithms: ['EdDSA'],
      issuer: 'admin',
      audience: '192.168.1.10'
    });

    // eslint-disable-next-line no-undef
    console.log('Verified Payload:', payload);

    // Dekripsi JWE
    const decrypted = new TextDecoder().decode(
      (await compactDecrypt(payload.data, jwePrivateKey)).plaintext
    );

    // eslint-disable-next-line no-undef
    console.log('Decrypted Data:', decrypted);
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error(error);
  }
});
