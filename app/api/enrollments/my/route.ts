import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const enrollments = await Enrollment.find({ student: session.user.id })
      .populate("course")
      .lean();

    return NextResponse.json({ enrollments });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}