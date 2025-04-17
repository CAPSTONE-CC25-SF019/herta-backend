import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
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
  if (!extname(filename) == 'json')
    throw new Error('filename must be format json');
  return JSON.parse(readFileSync(`${cwd()}/cert/${filename}`).toString());
}
