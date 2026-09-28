import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Course from "@/models/Course";
import Order from "@/models/Order";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { courseId, userId } = await req.json();

    if (!courseId || !userId) {
      return NextResponse.json(
        { error: "Course ID and User ID are required" },
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
     // receipt: `course_${courseId}_user_${userId}_${Date.now()}`, // Unique receipt
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1, // Auto capture
      notes: {
        courseId: courseId.toString(),
        userId: userId.toString(),
        courseTitle: course.title,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const order = await Order.create({
      user: userId,
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