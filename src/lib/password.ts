import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 32;

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("base64")}$${derivedKey.toString("base64")}`;
}

function safelyCompare(actual: Buffer, expected: Buffer) {
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function passwordMatches(password: string, passwordHash: string) {
  if (passwordHash.startsWith("scrypt$")) {
    const [, saltValue, keyValue] = passwordHash.split("$");
    if (!saltValue || !keyValue) return false;
    try {
      const expected = Buffer.from(keyValue, "base64");
      const actual = scryptSync(password, Buffer.from(saltValue, "base64"), KEY_LENGTH);
      return safelyCompare(actual, expected);
    } catch {
      return false;
    }
  }

  // Legacy compatibility: existing SHA-256 hashes are upgraded after successful sign-in.
  const expected = Buffer.from(passwordHash, "hex");
  const actual = Buffer.from(createHash("sha256").update(password).digest("hex"), "hex");
  return safelyCompare(actual, expected);
}

export function isModernPasswordHash(value: string) {
  return value.startsWith("scrypt$");
}
