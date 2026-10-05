import mongoose from "mongoose";
import VerificationCode from "@/models/VerificationCode";
import { auth } from "./auth";
import { getServerSession } from "next-auth";

/**
 * Rate-limiting configuration for verification code requests.
 *
 * Per-user limit (MongoDB-backed, reliable):
 *   maxCodesPerUserPerHour — codes a single user can request per hour.
 *
 * Per-IP limit (in-memory, best-effort):
 *   maxRequestsPerIPPerHour — IP can trigger at most this many.
 *
 * In-memory maps never survive server restarts — that's acceptable
 * because IP limits are a soft guard against spam, not a hard security
 * boundary. The DB-backed per-user limit is the real throttle.
 */
const MAX_CODES_PER_USER_PER_HOUR = 5;
const MAX_REQUESTS_PER_IP_PER_HOUR = 5; // Reduced from 20 for unauthenticated users
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

// IP → count tracker (in-memory, resets on restart)
const ipTracker = new Map<string, { count: number; resetAt: number }>();

/** Extract the client IP from standard request headers. */
export function extractIP(request: Request): string {
  // X-Forwarded-For: "client, proxy1, proxy2" — first is original client.
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip")?.trim() ?? "unknown";
}

/** Trim expired entries from the in-memory IP tracker. */
function cleanIPTracker(now: number): void {
  ipTracker.forEach((entry, ip) => {
    if (now > entry.resetAt) {
      ipTracker.delete(ip);
    }
  });
}

/**
 * Check whether the IP has exceeded its hourly request quota.
 * @returns `true` if the request should be rejected (rate limited).
 */
export async function isIPRateLimited(ip: string): Promise<boolean> {
  const now = Date.now();
  let entry = ipTracker.get(ip);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    ipTracker.set(ip, entry);
  }

  if (entry.count >= MAX_REQUESTS_PER_IP_PER_HOUR) return true;

  entry.count++;

  // Opportunistic cleanup so the Map doesn't grow forever.
  if (Math.random() < 0.01) cleanIPTracker(now);

  return false;
}

/**
 * Check whether the user has exceeded their hourly code quota.
 * Backed by MongoDB, so it works across serverless invocations.
 * @returns `true` if rate limited.
 */
export async function isUserRateLimited(userId: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - WINDOW_MS);
  const recent = await VerificationCode.countDocuments({
    user: new mongoose.Types.ObjectId(userId),
    createdAt: { $gte: windowStart },
  });
  return recent >= MAX_CODES_PER_USER_PER_HOUR;
}
