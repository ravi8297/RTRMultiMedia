import { randomInt } from "crypto";
import dbConnect from "./mongodb";
import VerificationCode from "@/models/VerificationCode";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import type { VerificationPurpose } from "@/models/VerificationCode";

const CODE_DIGITS = 6;
const CODE_MIN = 10 ** (CODE_DIGITS - 1); // 100000
const CODE_MAX = 10 ** CODE_DIGITS;       // 1000000 (exclusive)
const BCRYPT_COST = 12;

// Precomputed hash used ONLY to equalize response timing on the "no valid
// code" paths. It makes those responses take ~the same time as a real
// bcrypt comparison, so an attacker cannot distinguish "no code for this
// user" from "code exists but wrong" by measuring latency.
const DUMMY_CODE_HASH = bcrypt.hashSync(
  String(randomInt(CODE_MIN, CODE_MAX)),
  BCRYPT_COST
);

/**
 * Perform a throwaway bcrypt comparison to normalize response latency.
 * Call this on the "no record / no match" paths to hide timing differences.
 * @param candidate - the user-supplied code (used to mirror real work).
 */
export async function normalizeTiming(candidate: string): Promise<void> {
  await bcrypt.compare(candidate, DUMMY_CODE_HASH);
}

/**
 * Generate a new verification code for a user, hash it, and persist it.
 *
 * Any previous *unused* and *unexpired* code for the same (user, purpose) is
 * deleted first, so only the latest code is ever valid.
 *
 * @param userId   The user's ObjectId (string or ObjectId)
 * @param purpose  One of "activate-account", "verify-email", "reset-password"
 * @param expiresInMinutes  TTL in minutes (default 5)
 * @returns The plain 6-digit code — ONLY returned here, never stored.
 *          The caller is responsible for delivering it (email, SMS, etc.).
 */
export async function createVerificationCode(
  userId: string | mongoose.Types.ObjectId,
  purpose: VerificationPurpose,
  expiresInMinutes: number = 5
): Promise<string> {
  await dbConnect();

  // 1. Generate a cryptographically secure 6-digit code.
  const code = String(randomInt(CODE_MIN, CODE_MAX));

  // 2. Hash before storing — plain text is NEVER persisted.
  const codeHash = await bcrypt.hash(code, BCRYPT_COST);

  // 3. Invalidate any prior unused, unexpired code for this user + purpose.
  await VerificationCode.deleteMany({
    user: new mongoose.Types.ObjectId(userId),
    purpose,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  // 4. Persist the new hashed code.
  await VerificationCode.create({
    codeHash,
    user: new mongoose.Types.ObjectId(userId),
    purpose,
    expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
  });

  // 5. Return the plain code so the caller can deliver it to the user.
  return code;
}

/** Max failed attempts before a code is locked out. */
const MAX_VERIFICATION_ATTEMPTS = 3;

/** Reasons for a verification failure — logged SERVER-SIDE only. */
export type VerificationFailReason =
  | "no_code"
  | "already_used"
  | "expired"
  | "locked"
  | "invalid";

/**
 * Verify a submitted code against the stored hash and, on success,
 * activate the user's account.
 *
 * Returns `{ valid, reason }` where `reason` is the real failure cause
 * for server logs ONLY. The caller must return a generic message to
 * the client so the same response is shown regardless of whether the
 * code was wrong, expired, or locked out.
 */
export async function verifyActivationCode(
  userId: string | mongoose.Types.ObjectId,
  code: string
): Promise<{ valid: boolean; reason: VerificationFailReason | null }> {
  await dbConnect();
  const now = new Date();

  // 1. Find the latest unused, unexpired, non-locked code for this user + purpose.
  const record = await VerificationCode.findOne({
    user: new mongoose.Types.ObjectId(userId),
    purpose: "activate-account",
    used: false,
    expiresAt: { $gt: now },
    attempts: { $lt: MAX_VERIFICATION_ATTEMPTS },
  }).sort({ createdAt: -1 });

  if (!record) {
    // Find ANY record so we can log the real reason for debugging.
    const anyRecord = await VerificationCode.findOne({
      user: new mongoose.Types.ObjectId(userId),
      purpose: "activate-account",
    }).sort({ createdAt: -1 });

    let reason: VerificationFailReason = "no_code";
    if (anyRecord) {
      if (anyRecord.used) reason = "already_used";
      else if (anyRecord.expiresAt <= now) reason = "expired";
      else if (anyRecord.attempts >= MAX_VERIFICATION_ATTEMPTS) reason = "locked";
    }
    // Normalize timing to prevent attackers from distinguishing "no code" from
    // "code exists but wrong" via response latency. Also log the real reason
    // for debugging.
    await normalizeTiming(code);
    return { valid: false, reason };
  }

  // 2. Compare hashes.
  const matches = await bcrypt.compare(code, record.codeHash);
  if (!matches) {
    // Wrong code — increment attempts, lock out if threshold reached.
    await VerificationCode.updateOne(
      { _id: record._id },
      { $inc: { attempts: 1 } }
    );
    // Normalize timing: a wrong code takes the same wall-clock time as a
    // "no code" response, so latency cannot distinguish the two.
    await normalizeTiming(code);
    return { valid: false, reason: "invalid" };
  }

  // 3. Success — mark one-time-use.
  await VerificationCode.updateOne(
    { _id: record._id },
    { used: true }
  );

  // 4. Activate the user account.
  const User = mongoose.model("User");
  await User.updateOne(
    { _id: new mongoose.Types.ObjectId(userId) },
    { isVerified: true }
  );

  return { valid: true, reason: null };
}