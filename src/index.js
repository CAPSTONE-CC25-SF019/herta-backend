// import {
//   CompactEncrypt,
//   SignJWT,
//   compactDecrypt,
//   createLocalJWKSet,
//   exportJWK,
//   importJWK,
//   jwtVerify
// } from 'jose';
// import {
//   createPrivateKey,
//   createPublicKey,
//   createSecretKey,
//   generateKeyPairSync
// } from 'node:crypto';

// async function fullJoseFlow() {
//   console.log(
//     '========== JWT, JWK, JWKS, dan JWE Flow dengan jose v6 =========='
//   );

//   // 1. Membuat kunci-kunci yang dibutuhkan
//   console.log('\n1. Membuat JWK (JSON Web Key)');

//   // Kunci simetris untuk JWT (signing)
//   const secretKey = createSecretKey(
//     Buffer.from('rahasia-super-aman-dan-panjang-minimal-32-karakter', 'utf8')
//   );

//   // Key pair asimetris untuk JWE (enkripsi)
//   const { publicKey, privateKey } = generateKeyPair();
//   const publicKeyObject = createPublicKey(publicKey);
//   const privateKeyObject = createPrivateKey(privateKey);

//   // 2. Export kunci ke format JWK
//   const secretJwk = await exportJWK(secretKey);
//   secretJwk.alg = 'HS256';
//   secretJwk.use = 'sig';
//   secretJwk.kid = 'secret-key-2025-03-02';
//   secretJwk.kty = 'oct'; // Tambahkan key type untuk symmetric key

//   const publicJwk = await exportJWK(publicKeyObject);
//   publicJwk.alg = 'RSA-OAEP-256';
//   publicJwk.use = 'enc';
//   publicJwk.kid = 'public-key-2025-03-02';

//   console.log('Secret JWK:', secretJwk);
//   console.log('Public JWK:', publicJwk);

//   // 3. Membuat JWT (JSON Web Token) dan menandatanganinya
//   console.log('\n2. Membuat dan Menandatangani JWT');
//   const jwt = await new SignJWT({ role: 'admin', user_id: '12345' })
//     .setProtectedHeader({ alg: 'HS256', kid: secretJwk.kid })
//     .setIssuedAt()
//     .setIssuer('https://example.com')
//     .setAudience('https://api.example.com')
//     .setExpirationTime('2h')
//     .sign(secretKey);

//   console.log('JWT yang Dihasilkan:', jwt);

//   // 4. Memverifikasi JWT dengan kunci langsung
//   console.log('\n3. Memverifikasi JWT dengan kunci langsung');
//   const { payload, protectedHeader } = await jwtVerify(jwt, secretKey, {
//     issuer: 'https://example.com',
//     audience: 'https://api.example.com'
//   });

//   console.log('Payload yang Diverifikasi:', payload);
//   console.log('Header yang Protected:', protectedHeader);

//   // 5. Membuat JWKS (JSON Web Key Set) untuk key management
//   console.log('\n4. Membuat JWKS (JSON Web Key Set)');

//   // Buat JWKS yang hanya berisi kunci-kunci untuk verifikasi
//   const jwks = {
//     keys: [
//       secretJwk // Untuk verifikasi JWT, kita perlu kunci lengkap
//     ]
//   };

//   console.log('JWKS yang Dihasilkan:', JSON.stringify(jwks, null, 2));

//   // 6. Simulasi client yang menggunakan JWKS untuk verifikasi
//   console.log('\n5. Verifikasi JWT dengan JWKS');
//   try {
//     // Di jose v6, createLocalJWKSet akan memilih kunci dengan alg dan kid yang cocok
//     const jwkSet = createLocalJWKSet(jwks);
//     const result = await jwtVerify(jwt, jwkSet, {
//       issuer: 'https://example.com',
//       audience: 'https://api.example.com'
//     });
//     console.log('Verifikasi dengan JWKS berhasil:', result.payload);
//   } catch (error) {
//     console.error('Verifikasi dengan JWKS gagal:', error);
//     // Jika masih gagal, coba pendekatan lain
//     console.log('Mencoba pendekatan alternatif dengan importJWK...');

//     try {
//       // Import JWK menjadi kunci yang bisa digunakan untuk verifikasi
//       const importedKey = await importJWK(secretJwk, secretJwk.alg);
//       const altResult = await jwtVerify(jwt, importedKey, {
//         issuer: 'https://example.com',
//         audience: 'https://api.example.com'
//       });
//       console.log('Verifikasi alternatif berhasil:', altResult.payload);
//     } catch (altError) {
//       console.error('Verifikasi alternatif juga gagal:', altError);
//     }
//   }

//   // 7. Menggunakan JWE (JSON Web Encryption) untuk enkripsi data
//   console.log('\n6. Menggunakan JWE untuk Enkripsi Data');

//   // Data sensitif yang akan dienkripsi
//   const sensitiveData = {
//     creditCardNumber: '4111-1111-1111-1111',
//     cvv: '123',
//     expiryDate: '12/25'
//   };

//   // Menggunakan JWE untuk mengenkripsi data
//   const encoder = new TextEncoder();
//   const jwe = await new CompactEncrypt(
//     encoder.encode(JSON.stringify(sensitiveData))
//   )
//     .setProtectedHeader({
//       alg: 'RSA-OAEP-256',
//       enc: 'A256GCM',
//       kid: publicJwk.kid
//     })
//     .encrypt(publicKeyObject);

//   console.log('JWE yang Dihasilkan:', jwe);

//   // 8. Mendekripsi JWE
//   console.log('\n7. Mendekripsi JWE');
//   const { plaintext } = await compactDecrypt(jwe, privateKeyObject);
//   const decodedData = JSON.parse(new TextDecoder().decode(plaintext));

//   console.log('Data yang Didekripsi:', decodedData);

//   // 9. Kombinasi JWT dan JWE dalam flow lengkap
//   console.log('\n8. Demo Lengkap - Menggabungkan Semua Konsep');

//   // 9.1 Pengguna login dan mendapatkan JWT
//   const userJWT = await new SignJWT({
//     sub: 'user123',
//     role: 'premium_user',
//     plan: 'enterprise'
//   })
//     .setProtectedHeader({ alg: 'HS256', typ: 'JWT', kid: secretJwk.kid })
//     .setIssuedAt()
//     .setIssuer('https://auth.example.com')
//     .setExpirationTime('1h')
//     .sign(secretKey);

//   console.log('User JWT:', userJWT);

//   // 9.2 Verifikasi JWT
//   const verifiedUser = await jwtVerify(userJWT, secretKey, {
//     issuer: 'https://auth.example.com'
//   });

//   console.log('Verifikasi User JWT:', verifiedUser.payload);

//   // 9.3 Kirim data terenkripsi ke pengguna terverifikasi
//   if (verifiedUser.payload.role === 'premium_user') {
//     const apiResponse = {
//       publicData: 'Data yang bisa dilihat oleh siapa saja',
//       sensitiveData: await new CompactEncrypt(
//         encoder.encode(
//           JSON.stringify({
//             apiKey: '8a8d7f6e5d4c3b2a1',
//             secretEndpoints: [
//               '/api/v1/premium/data',
//               '/api/v1/premium/analytics'
//             ],
//             userSpecificToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
//           })
//         )
//       )
//         .setProtectedHeader({
//           alg: 'RSA-OAEP-256',
//           enc: 'A256GCM',
//           kid: publicJwk.kid
//         })
//         .encrypt(publicKeyObject)
//     };

//     console.log('API Response dengan Data Terenkripsi:', apiResponse);

//     // 9.4 Client mendekripsi data
//     const decryptedApiData = await compactDecrypt(
//       apiResponse.sensitiveData,
//       privateKeyObject
//     );
//     console.log(
//       'Data API Terdekripsi:',
//       JSON.parse(new TextDecoder().decode(decryptedApiData.plaintext))
//     );
//   }
// }

// // Fungsi bantuan untuk membuat key pair
// function generateKeyPair() {
//   const { publicKey, privateKey } = generateKeyPairSync('rsa', {
//     modulusLength: 2048,
//     publicKeyEncoding: {
//       type: 'spki',
//       format: 'pem'
//     },
//     privateKeyEncoding: {
//       type: 'pkcs8',
//       format: 'pem'
//     }
//   });

//   return { publicKey, privateKey };
// }

// // Jalankan flow lengkap
// fullJoseFlow().catch((error) => {
//   console.error('Error dalam flow:', error);
// });
console.log('hello world');
