import RazorpayType from "razorpay";

export const razorpay = new RazorpayType({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
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
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  return generatedSignature === signature;
}