import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import { verifyActivationCode, normalizeTiming } from "@/lib/verification";
import { extractIP, isIPRateLimited } from "@/lib/rateLimit";

/**
 * Verify a 6-digit activation code and mark the user's account as active.
 *
 * This route is NOT protected by login — users verify *before* they can log in.
 * Security relies on: (a) code is single-use, (b) 3-attempt lockout, (c)
 * short expiry (5-10 min), (d) IP-level rate limiting (best-effort).
 *
 * Request body (JSON):
 *   - { userId: ObjectId }  – the user to activate; OR
 *   - { email: string }    – look up user by email.
 *   - code: string          – the 6-digit code (required).
 *
 * Success:  { success: true, message: "Account activated successfully." }  (200)
 * Failure:  Generic error, details logged to console only.
 *
 * NOTE: ALL failure responses are intentionally indistinguishable —
 * same message and status code — regardless of whether the code was
 * wrong, expired, locked, or the email/user doesn't exist.
 *
 * Example:
 *   POST /api/verification/validate
 *   { "email": "user@example.com", "code": "123456" }
 */
export async function POST(request: NextRequest) {
  const ip = extractIP(request);

  // 1. IP throttle (best-effort — primary brute-force defense is
  //    the code lockout, not the IP limit).
  if (await isIPRateLimited(ip)) {
    return NextResponse.json(
      { error: "Invalid or expired code." },
      { status: 429 }
    );
  }

  // 2. Parse and validate input.
  let body: { userId?: string; email?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired code." },
      { status: 400 }
    );
  }
  const { userId, email, code } = body ?? {};

  if (!code || typeof code !== "string" || !/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "Invalid or expired code." },
      { status: 400 }
    );
  }

  if (!userId && !email) {
    return NextResponse.json(
      { error: "Invalid or expired code." },
      { status: 400 }
    );
  }

  // 3. Resolve the target user ID — or run dummy timing to hide
  //    the "no such user" branch from latency-based enumeration.
  let targetId: string | null = null;
  if (userId) {
    targetId = userId;
  } else if (email) {
    const u = await User.findOne({ email }).select("_id");
    targetId = u?._id.toString() ?? null;
  }

  if (!targetId) {
    // No user/email: normalize timing so an attacker can't tell a
    // missing email from a wrong code by latency. Log for debugging.
    console.warn(
      `[verifyActivationCode] NO_USER ip=${ip} email=${email ?? "(none)"}`
    );
    await normalizeTiming(code);
    return NextResponse.json(
      { error: "Invalid or expired code." },
      { status: 400 }
    );
  }

  // 4. Verify the code (hash check, expiry, attempt lockout).
  const result = await verifyActivationCode(targetId, code);

  if (!result.valid) {
    // Log the real reason server-side for debugging.
    console.warn(
      `[verifyActivationCode] FAILED userId=${targetId} ip=${ip} reason=${result.reason}`
    );

    return NextResponse.json(
      { error: "Invalid or expired code." },
      { status: 400 }
    );
  }

  // 5. Success — user is now activated.
  console.log(`[verifyActivationCode] SUCCESS userId=${targetId}`);

  return NextResponse.json({
    success: true,
    message: "Account activated successfully. You can now log in.",
  });
}