import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Course from "@/models/Course";
import { auth } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const course = await Course.findById(params.id).lean();

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ course });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch course" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const {
      title,
      description,
      shortDescription,
      thumbnail,
      price,
      originalPrice,
      category,
      level,
      duration,
      lessons,
      instructor,
      whatYouWillLearn,
      requirements,
      tags,
      isPublished,
    } = body;

    // Validate required fields
    if (!title || !description || !shortDescription || !thumbnail || !price || !category || !duration || !lessons || !instructor) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const course = await Course.findByIdAndUpdate(
      params.id,
      {
        title,
        description,
        shortDescription,
        thumbnail,
        price,
        originalPrice,
        category,
        level: level || "beginner",
        duration,
        lessons,
        instructor,
        whatYouWillLearn: whatYouWillLearn || [],
        requirements: requirements || [],
        tags: tags || [],
        isPublished: isPublished || false,
      },
      { new: true }
    );

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ course });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    await dbConnect();

    const course = await Course.findByIdAndDelete(params.id);

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete course" },
      { status: 500 }
    );
  }
}