import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Course from "@/models/Course";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 100); // Cap at 100
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (category && category !== "All") {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Fetch courses with pagination
    const [courses, total] = await Promise.all([
      Course.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(filter),
    ]);

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    // Get user info from session
    const session = await auth();

    // Check if user is admin
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

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

    const course = await Course.create({
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
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
}