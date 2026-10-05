import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Enrollment from "@/models/Enrollment";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    await dbConnect();

    // Parse pagination params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100); // Cap at 100
    const skip = (page - 1) * limit;

    // Fetch students with pagination
    const [students, total] = await Promise.all([
      User.find({ role: "student" })
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ role: "student" }),
    ]);

    // Batch fetch all enrollments for these students in a single query (fixes N+1)
    const studentIds = students.map((s) => s._id);
    const enrollments = await Enrollment.find({ student: { $in: studentIds } })
      .populate("course")
      .lean();

    // Group enrollments by student ID
    const enrollmentsByStudent: Record<string, any[]> = {};
    enrollments.forEach((e: any) => {
      const key = e.student._id.toString();
      if (!enrollmentsByStudent[key]) enrollmentsByStudent[key] = [];
      enrollmentsByStudent[key].push(e);
    });

    // Attach enrollments to each student
    const studentsWithEnrollments = students.map((student) => {
      const studentId = student._id?.toString() ?? '';
      const studentEnrollments = enrollmentsByStudent[studentId] || [];
      return {
        ...student,
        enrollments: studentEnrollments,
        totalEnrolled: studentEnrollments.length,
        paidEnrollments: studentEnrollments.filter((e) => e.paymentStatus === "paid").length,
        pendingEnrollments: studentEnrollments.filter((e) => e.paymentStatus === "pending").length,
      };
    });

    return NextResponse.json({
      students: studentsWithEnrollments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch students" },
      { status: 500 }
    );
  }
}