import { NextResponse } from "next/server";
import { createOrder } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const { amount, currency, receipt } = await req.json();

    if (!amount || !receipt) {
      return NextResponse.json(
        { error: "Amount and receipt are required" },
        { status: 400 }
      );
    }

    const order = await createOrder(amount, currency || "INR", receipt);

    return NextResponse.json(order, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}