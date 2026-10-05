import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Trainer from "@/models/Trainer";
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const skip = (page - 1) * limit;

    const [trainers, total] = await Promise.all([
      Trainer.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Trainer.countDocuments(),
    ]);

    return NextResponse.json({
      trainers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch trainers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    await dbConnect();

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
      name,
      email,
      phone,
      bio,
      expertise,
      image,
      yearsOfExperience,
      certifications,
      socialLinks,
      isActive,
    } = body;

    if (!name || !email || !bio) {
      return NextResponse.json(
        { error: "Name, email, and bio are required" },
        { status: 400 }
      );
    }

    if (typeof yearsOfExperience !== "number" || yearsOfExperience < 0) {
      return NextResponse.json(
        { error: "Years of experience must be a non-negative number" },
        { status: 400 }
      );
    }

    const trainer = await Trainer.create({
      name,
      email,
      phone,
      bio,
      expertise: expertise || [],
      image,
      yearsOfExperience,
      certifications: certifications || [],
      socialLinks,
      isActive: isActive !== false,
    });

    return NextResponse.json({ trainer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create trainer" },
      { status: 500 }
    );
  }
}