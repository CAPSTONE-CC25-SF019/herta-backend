import { exportJWK, generateKeyPair } from 'jose';
import fs from 'node:fs/promises';
import path from 'node:path';
import { argv, cwd, exit } from 'node:process';

// Get arguments from the CLI
const args = argv.slice(2);

// Get arguments with starts --alg=, --curve=, and --name=
const argAlg = args.find((arg) => arg.startsWith('--alg='));
const argCurv = args.find((arg) => arg.startsWith('--curve='));
const argName = args.find((arg) => arg.startsWith('--name='));

try {
  if (argAlg && argCurv && argName) {
    // Get the value from args
    const algValue = argAlg.split('=')[1] || null;
    const curvValue = argCurv.split('=')[1] || null;
    const nameValue = argName.split('=')[1] || null;

    // Exit if any argument is missing or empty
    if (!algValue || !curvValue || !nameValue) {
      throw new Error('Arguments --alg, --curve, and --name must be provided.');
    }

    // Generate key pair
    const { publicKey, privateKey } = await generateKeyPair(algValue, {
      crv: curvValue,
      extractable: true
    });

    // Convert keys to JWK format
    const publicJwk = await exportJWK(publicKey);
    const privateJwk = await exportJWK(privateKey);

    // Define directory and file paths
    const certDir = path.join(cwd(), 'cert');
    const publicFile = path.join(certDir, `${nameValue}-public.json`);
    const privateFile = path.join(certDir, `${nameValue}-private.json`);

    // Ensure the 'cert' directory exists
    await fs.mkdir(certDir, { recursive: true });

    // Save keys to files
    await fs.writeFile(publicFile, JSON.stringify(publicJwk, null, 2));
    await fs.writeFile(privateFile, JSON.stringify(privateJwk, null, 2));

    console.log(`✅ Public key saved at: ${publicFile}`);
    console.log(`✅ Private key saved at: ${privateFile}`);
  } else {
    throw new Error('Missing required arguments: --alg, --curve, and --name');
  }
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  exit(1);
}
