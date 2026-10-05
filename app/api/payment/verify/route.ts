import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Course from "@/models/Course";
import User from "@/models/User";
import Order from "@/models/Order";
import Enrollment from "@/models/Enrollment";
import { razorpay, verifyPaymentSignature } from "@/lib/razorpay";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(req: Request) {
  const mongoSession = await mongoose.startSession();

  try {
    await mongoSession.startTransaction();

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

    // CRITICAL FIX: Verify this payment belongs to the current user and matches the course
    const order = await Order.findOne({
      user: session.user.id,
      razorpayOrderId: orderId,
      status: "pending"
    }).session(mongoSession);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or already processed" },
        { status: 400 }
      );
    }

    // Verify the course matches
    if (order.course.toString() !== courseId) {
      return NextResponse.json(
        { error: "Course mismatch for this order" },
        { status: 400 }
      );
    }

    const course = await Course.findById(courseId).session(mongoSession);

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: session.user.id,
      course: courseId
    }).session(mongoSession);

    if (existingEnrollment) {
      // Update existing enrollment record with payment details
      existingEnrollment.paymentStatus = "paid";
      existingEnrollment.razorpayPaymentId = paymentId;
      existingEnrollment.razorpaySignature = signature;
      existingEnrollment.completedAt = new Date();
      await existingEnrollment.save({ session: mongoSession });
    } else {
      // Create new enrollment record
      await Enrollment.create(
        [
          {
            student: session.user.id,
            course: courseId,
            paymentStatus: "paid",
            amount: course.price,
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            razorpaySignature: signature,
            enrolledAt: new Date(),
          },
        ],
        { session: mongoSession }
      );
    }

    // Update order record
    await Order.findOneAndUpdate(
      { user: session.user.id, course: courseId, status: "pending" },
      {
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        status: "completed",
      },
      { session: mongoSession }
    );

    // Update course enrollment count
    await Course.findByIdAndUpdate(
      courseId,
      { $push: { enrolledStudents: session.user.id } },
      { session: mongoSession }
    );

    // Update user enrolled courses
    await User.findByIdAndUpdate(
      session.user.id,
      { $push: { enrolledCourses: courseId } },
      { session: mongoSession }
    );

    // Commit the transaction
    await mongoSession.commitTransaction();

    return NextResponse.json({
      success: true,
      message: "Payment verified and enrollment completed",
      paymentId,
    });
  } catch (error: any) {
    // Abort transaction on any error
    await mongoSession.abortTransaction();
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  } finally {
    // Always end the session to prevent leaks
    await mongoSession.endSession();
  }
}