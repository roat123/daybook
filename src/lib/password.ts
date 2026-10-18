import * as Crypto from 'expo-crypto';

/** Demo-grade hashing (salted SHA-256). A real backend does this on the server with a slow hash. */
export async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

export function newSalt(): string {
  return Crypto.randomUUID();
}
