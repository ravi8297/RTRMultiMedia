import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Blog from "@/models/Blog";
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
        { error: "Invalid blog post ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const blog = await Blog.findById(params.id).lean();

    if (!blog) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ blog });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch blog post" },
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
        { error: "Invalid blog post ID" },
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
    const { title, excerpt, content, author, image, tags } = body;

    if (!title || !content || !author) {
      return NextResponse.json(
        { error: "Title, content, and author are required." },
        { status: 400 }
      );
    }

    const blog = await Blog.findByIdAndUpdate(
      params.id,
      {
        title,
        excerpt: excerpt || title.slice(0, 300),
        content,
        author,
        image,
        tags: tags || [],
      },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ blog });
  } catch (error: any) {
    // Handle Mongoose validation errors gracefully
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: error.message || "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to update blog post" },
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
        { error: "Invalid blog post ID" },
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

    const blog = await Blog.findByIdAndDelete(params.id);

    if (!blog) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Blog post deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
