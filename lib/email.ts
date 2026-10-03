import type { VerificationPurpose } from "@/models/VerificationCode";
import { Resend } from "resend";

/**
 * Resend configuration.
 *
 * Resend was chosen because it is built for Next.js: a tiny, typed API
 * (`resend.emails.send`), a free tier (100 emails/day, 3 domains in dev),
 * and no forced API-key verification on signup (unlike SendGrid).
 *
 * Set RESEND_API_KEY in .env.local to enable real delivery. Without it, the
 * function logs the code to the console so flows can be tested locally.
 *
 * If you prefer another provider, only this file needs to change:
 * - Twilio (SMS): `npm install twilio`, replace sendVerificationCodeBody.
 */
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || "noreply@rtr-media.com";
const APP_NAME = process.env.APP_NAME || "RTR Media Solutions";

let resend: Resend | null = null;
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
}

export interface SendVerificationCodeArgs {
  to: string;
  code: string;
  purpose?: VerificationPurpose;
  appName?: string;
  validMinutes?: number;
}

/**
 * Send a verification code to the user.
 *
 * If Resend is configured, the email is delivered via the provider.
 * Otherwise the code is logged to the console (no failure) so the app can be
 * tested end-to-end locally without API credentials.
 *
 * @returns { sent } true if the code was delivered, false if in dev mode
 */
export async function sendVerificationCode({
  to,
  code,
  purpose = "activate-account",
  appName = APP_NAME,
  validMinutes = 10,
}: SendVerificationCodeArgs): Promise<{ sent: boolean }> {
  if (!resend) {
    // DEV MODE: log instead of failing, so flows can be tested with no config.
    console.log(
      `\n[${appName}] Verification code delivered to ${to}:\n` +
      `  Code: ${code}\n` +
      `  Valid for ${validMinutes} min (${purpose})\n`
    );
    return { sent: false };
  }

  const purposeTitle: Record<VerificationPurpose, string> = {
    "activate-account": "Activate your account",
    "verify-email": "Verify your email address",
    "reset-password": "Reset your password",
  };

  const subject = `${purposeTitle[purpose]} — ${appName}`;
  const text = `${purposeTitle[purpose]}. Your code is ${code}. It expires in ${validMinutes} minutes.`;
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; line-height: 1.6; color: #1f2937;">
      <h2 style="color: #0f766e;">${purposeTitle[purpose]}</h2>
      <p>Hi,</p>
      <p>Someone (we hope it's you) requested a verification code for <strong>${appName}</strong>.</p>
      <p style="text-align: center;">
        <span style="display: inline-block; background: #f0fdfa; border: 2px solid #14b8a6; color: #0f766e; font-size: 28px; font-weight: 800; padding: 12px 28px; border-radius: 8px; letter-spacing: 0.15em;">${code}</span>
      </p>
      <p style="font-size: 14px; color: #6b7280;">This code expires in <strong>${validMinutes} minutes</strong>. Don't share it with anyone.</p>
      <p style="font-size: 14px; color: #9ca3af;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `RTR Media Solutions <${RESEND_FROM}>`,
      to,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[RTR Media] Failed to send verification email to ${to}:`, message);
    throw new Error(`Verification email could not be sent: ${message}`);
  }
}
