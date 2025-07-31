import { createHash } from 'crypto';

import * as bcrypt from 'bcrypt';

/**
 * Get hashed password
 * @param plainPassword
 * @returns
 */
const getHashPassword = async (plainPassword: string) => {
  // Salt round of hash
  const SALT_ROUNDS = 10;
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
};

/**
 * Hash signature of refresh token service.
 * @param {string} plainRefreshToken - refresh token
 * @returns
 */
const getHashedSignature = (plainRefreshToken: string) => {
  const plainHasSignature = plainRefreshToken.split('.')[2];
  return createHash('sha256').update(plainHasSignature).digest('hex');
};

export { getHashPassword, getHashedSignature };
