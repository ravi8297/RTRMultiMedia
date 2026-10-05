import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Trainer from "@/models/Trainer";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(
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

    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: "Invalid trainer ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const trainer = await Trainer.findById(params.id).lean();

    if (!trainer) {
      return NextResponse.json(
        { error: "Trainer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ trainer });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch trainer" },
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

    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: "Invalid trainer ID" },
        { status: 400 }
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

    const trainer = await Trainer.findByIdAndUpdate(
      params.id,
      {
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
      },
      { new: true, runValidators: true }
    );

    if (!trainer) {
      return NextResponse.json(
        { error: "Trainer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ trainer });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: error.message || "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to update trainer" },
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

    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: "Invalid trainer ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const trainer = await Trainer.findByIdAndDelete(params.id);

    if (!trainer) {
      return NextResponse.json(
        { error: "Trainer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Trainer deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete trainer" },
      { status: 500 }
    );
  }
}