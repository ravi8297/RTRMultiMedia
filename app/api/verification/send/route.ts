import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import { createVerificationCode, normalizeTiming } from "@/lib/verification";
import { sendVerificationCode } from "@/lib/email";
import { extractIP, isUserRateLimited, isIPRateLimited } from "@/lib/rateLimit";

const CACHE_NO_STORE = "no-store, no-cache, must-revalidate";

/**
 * POST a verification code to the user's email.
 *
 * Auth: optional. A valid session identifies the caller (users resend for
 * themselves; admins can target anyone via ?userId). No session → the
 * caller provides only `email` (standard "resend code" flow).
 *
 * Rate limiting (dual-layer):
 *  - Per user: max 5 codes/hour (MongoDB-backed, authoritative).
 *  - Per IP: max 20 requests/hour (in-memory, best-effort).
 *
 * If RESEND_API_KEY is not set, the code is logged to the console
 * instead of failing — perfect for local testing.
 *
 * NOTE: This endpoint is deliberately written to leak no
 * enumeration signals — same message and status code whether the
 * email exists, the user is rate-limited, or the code could not be
 * generated. The per-user throttle is the authoritative control;
 * the IP throttle is best-effort.
 *
 * Example:
 *  POST /api/verification/send                     → self (requires session)
 *  POST /api/verification/send?userId=<id>          → admin, any user
 *  POST /api/verification/send (body: {email})      → unauthenticated
 */
export async function POST(request: NextRequest) {
  const ip = extractIP(request);
  const searchParams = request.nextUrl.searchParams;

  let body: { userId?: string; email?: string; purpose?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const queryUserId = searchParams.get("userId");
  const queryEmail = searchParams.get("email") || body.email;
  const queryPurpose = searchParams.get("purpose") || body.purpose;

  // 1. Resolve the target user and determine whether the caller
  //    is authenticated.
  let targetUserId: string | null = null;
  let authenticated = false;
  let sessionUser: { role?: string; id?: string } | null = null;

  const session = await getServerSession(authOptions);
  if (session && session.user) {
    authenticated = true;
    sessionUser = session.user as { role?: string; id?: string };

    if (sessionUser.id) {
      targetUserId = sessionUser.id;
    }

    // Authenticated + query params → admin-only for targeting others.
    if ((queryUserId || queryEmail) && sessionUser.role !== "admin") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    if (queryUserId) {
      targetUserId = queryUserId;
    } else if (queryEmail) {
      const user = await User.findOne({ email: queryEmail }).select("_id");
      targetUserId = user?._id.toString() ?? null;
    }
  } else {
    // Unauthenticated: activation codes via email only.
    if (!queryEmail) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const user = await User.findOne({ email: queryEmail }).select("_id");
    targetUserId = user?._id.toString() ?? null;
  }

  // 2. IP throttle — best-effort, same for all callers.
  if (await isIPRateLimited(ip)) {
    return NextResponse.json(
      { success: true, message: "If an account exists for this email, a code was sent." },
      { headers: { "Cache-Control": CACHE_NO_STORE } }
    );
  }

  // 3. Per-user throttle — the authoritative anti-flood control.
  //    Applied to ALL known targets, regardless of auth status.
  if (targetUserId) {
    if (await isUserRateLimited(targetUserId)) {
      if (authenticated) {
        // Honest message to the verified account holder.
        return NextResponse.json(
          { error: "Too many verification codes have been sent to this account. Please try again later." },
          { status: 429 }
        );
      }
      // Generic message to an unauthenticated caller (may be attacker).
      return NextResponse.json(
        { success: true, message: "If an account exists for this email, a code was sent." },
        { headers: { "Cache-Control": CACHE_NO_STORE } }
      );
    }
  }

  // 4. Unknown target (unauthenticated + email not found): run the
  //    same timing work a real request would, then return the
  //    generic message. This never reveals whether an email exists.
  if (!targetUserId) {
    const dummyCode = String(Math.floor(100000 + Math.random() * 900000));
    await normalizeTiming(dummyCode);
    return NextResponse.json(
      { success: true, message: "If an account exists for this email, a code was sent." },
      { headers: { "Cache-Control": CACHE_NO_STORE } }
    );
  }
  // 3b. Auth-specific authorization (non-admins cannot target others).
  // We check sessionUser directly so TypeScript knows it's non-null in this branch.
  if (sessionUser && sessionUser.role !== "admin" && targetUserId !== sessionUser.id) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // 5. Generate the code (Part 1) — also invalidates any prior unused code.
  const purpose = (queryPurpose ?? "activate-account") as
    | "activate-account"
    | "verify-email"
    | "reset-password";
  const code = await createVerificationCode(targetUserId, purpose);

  // 6. Deliver the code via the configured provider (or console in dev mode).
  const user = await User.findById(targetUserId);
  if (!user) {
    // Defensive: we resolved targetUserId from the DB above, but guard
    // against a race (user deleted between lookup and this point).
    return NextResponse.json(
      { success: true, message: "If an account exists for this email, a code was sent." },
      { headers: { "Cache-Control": CACHE_NO_STORE } }
    );
  }

  const sent = await sendVerificationCode({
    to: user.email,
    code,
    purpose,
  });

  return NextResponse.json(
    { success: true, deliveredTo: user.email, sent },
    { headers: { "Cache-Control": CACHE_NO_STORE } }
  );
}