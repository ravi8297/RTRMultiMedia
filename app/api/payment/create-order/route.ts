import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Course from "@/models/Course";
import Order from "@/models/Order";
import { razorpay } from "@/lib/razorpay";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    if (!course.price) {
      return NextResponse.json(
        { error: "Course price not set" },
        { status: 400 }
      );
    }

    const amount = Math.round(course.price * 100); // Convert to paise

    const options = {
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1, // Auto capture
      notes: {
        courseId: courseId.toString(),
        userId: session.user.id,
        courseTitle: course.title,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const order = await Order.create({
      user: session.user.id,
      course: courseId,
      amount: course.price,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      status: "pending",
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: course.price,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
      courseTitle: course.title,
    });
  } catch (error: any) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}