import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Enrollment from "@/models/Enrollment";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    await dbConnect();

    // Get all users with role student
    const students = await User.find({ role: "student" }).select("-password").lean();

    // For each student, get their enrollments
    const studentsWithEnrollments = await Promise.all(
      students.map(async (student) => {
        const enrollments = await Enrollment.find({ student: student._id })
          .populate("course")
          .lean();

        return {
          ...student,
          enrollments,
          totalEnrolled: enrollments.length,
          paidEnrollments: enrollments.filter((e: any) => e.paymentStatus === "paid").length,
          pendingEnrollments: enrollments.filter((e: any) => e.paymentStatus === "pending").length,
        };
      })
    );

    return NextResponse.json({ students: studentsWithEnrollments });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch students" },
      { status: 500 }
    );
  }
}