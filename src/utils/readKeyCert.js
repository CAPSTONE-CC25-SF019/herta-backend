import { readFileSync } from 'node:fs';
import { cwd } from 'node:process';

/**
 * Read File Key format Jwk on the Cert folder
 *
 * @export
 * @param {string} filename - the filename to read
 * @returns {Object} - result to read and format object
 * @throws {Error} - error if the file not extension json
 */
export default function (filename) {
  const path = `${cwd()}/cert/${filename}`;
  console.log(`Reading key from: ${path}`);
  const fileContent = readFileSync(path).toString();

  try {
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error parsing JSON file ${filename}:`, error);
    throw error;
  }
}
