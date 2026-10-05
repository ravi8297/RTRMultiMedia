import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Course from "@/models/Course";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ObjectId format
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: "Invalid course ID" },
        { status: 400 }
      );
    }

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
    // Validate ObjectId format
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: "Invalid course ID" },
        { status: 400 }
      );
    }

    const session = await auth();

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    await dbConnect();

    // Wrap JSON parsing in try/catch for proper 400 response
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
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

    // Validate numeric fields
    const priceNum = Number(price);
    const lessonsNum = Number(lessons);
    const originalPriceNum = originalPrice ? Number(originalPrice) : undefined;

    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json(
        { error: "Price must be a valid number greater than or equal to 0" },
        { status: 400 }
      );
    }

    if (isNaN(lessonsNum) || lessonsNum < 1) {
      return NextResponse.json(
        { error: "Lessons must be a valid number greater than or equal to 1" },
        { status: 400 }
      );
    }

    if (originalPriceNum !== undefined && originalPriceNum < 0) {
      return NextResponse.json(
        { error: "Original price must be a valid number greater than or equal to 0" },
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
        price: priceNum,
        originalPrice: originalPriceNum,
        category,
        level: level || "beginner",
        duration,
        lessons: lessonsNum,
        instructor,
        whatYouWillLearn: whatYouWillLearn || [],
        requirements: requirements || [],
        tags: tags || [],
        isPublished: isPublished || false,
      },
      { new: true, runValidators: true }
    );

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ course });
  } catch (error: any) {
    // Handle Mongoose validation errors gracefully
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: error.message || "Validation failed" },
        { status: 400 }
      );
    }
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
    // Validate ObjectId format
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: "Invalid course ID" },
        { status: 400 }
      );
    }

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
