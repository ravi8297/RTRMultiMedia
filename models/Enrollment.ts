import mongoose, { Document, Schema } from "mongoose";

export interface IEnrollment extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  amount: number;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  enrolledAt: Date;
  completedAt?: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    razorpayOrderId: {
      type: String,
      required: [true, "Razorpay order ID is required"],
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for faster lookups
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
EnrollmentSchema.index({ razorpayOrderId: 1 });
EnrollmentSchema.index({ razorpayPaymentId: 1 });

export default mongoose.models.Enrollment || mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);