import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import { auth } from "@/lib/auth";
import Order from "@/models/Order";

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

    // Get totals
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();

    // Get total revenue (sum of paid enrollments)
    const revenueResult = await Enrollment.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Get recent payments (last 10)
    const recentPayments = await Enrollment.find({ paymentStatus: "paid" })
      .populate("student", "name email")
      .populate("course", "title")
      .sort({ completedAt: -1 })
      .limit(10)
      .lean();

    // Get monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Enrollment.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          completedAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$completedAt" },
            month: { $month: "$completedAt" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Get course enrollment counts for chart
    const courseEnrollmentCounts = await Enrollment.aggregate([
      {
        $group: {
          _id: "$course",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "courseDetails"
        }
      },
      { $unwind: "$courseDetails" },
      { $project: {
          _id: "$courseDetails._id",
          title: "$courseDetails.title",
          count: 1
        }
      }
    ]);

    return NextResponse.json({
      stats: {
        totalStudents,
        totalCourses,
        totalEnrollments,
        totalRevenue,
        monthlyRevenue: monthlyRevenue.map((m: any) => ({
          month: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
          total: m.total,
        })),
        courseEnrollmentCounts: courseEnrollmentCounts.map((c: any) => ({
          courseId: c._id,
          count: c.count,
        })),
      },
      recentPayments,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}