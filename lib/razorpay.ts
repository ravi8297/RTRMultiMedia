import RazorpayType from "razorpay";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  throw new Error(
    "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables are required"
  );
}

export const razorpay = new RazorpayType({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export async function createOrder(amount: number, currency = "INR", receipt: string) {
  const options = {
    amount: amount * 100, // amount in paise
    currency,
    receipt,
    payment_capture: 1,
  };

  return await razorpay.orders.create(options);
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
) {
  const crypto = require("crypto");
  const generatedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET!)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, "utf-8"),
      Buffer.from(signature, "utf-8")
    );
  } catch {
    // Length mismatch — definitely not a valid signature
    return false;
  }
}