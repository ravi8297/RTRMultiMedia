import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Course from "@/models/Course";
import User from "@/models/User";
import Order from "@/models/Order";
import Enrollment from "@/models/Enrollment";
import { razorpay, verifyPaymentSignature } from "@/lib/razorpay";
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

    const { orderId, paymentId, signature, courseId } = await req.json();

    if (!orderId || !paymentId || !signature || !courseId) {
      return NextResponse.json(
        { error: "Missing required payment fields" },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const isValid = verifyPaymentSignature(orderId, paymentId, signature);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
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

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: session.user.id,
      course: courseId,
    });

    if (existingEnrollment) {
      // Update existing enrollment record with payment details
      existingEnrollment.paymentStatus = "paid";
      existingEnrollment.razorpayPaymentId = paymentId;
      existingEnrollment.razorpaySignature = signature;
      existingEnrollment.completedAt = new Date();
      await existingEnrollment.save();
    } else {
      // Create new enrollment record
      await Enrollment.create({
        student: session.user.id,
        course: courseId,
        paymentStatus: "paid",
        amount: course.price,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        enrolledAt: new Date(),
      });
    }

    // Update order record if exists
    await Order.findOneAndUpdate(
      { user: session.user.id, course: courseId, status: "pending" },
      {
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        status: "completed",
      }
    );

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $push: { enrolledStudents: session.user.id },
    });

    // Update user enrolled courses
    await User.findByIdAndUpdate(session.user.id, {
      $push: { enrolledCourses: courseId },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and enrollment completed",
      paymentId,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}