import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();

    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ blogs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const session = await auth();

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, excerpt, content, author, image, tags } = body;

    if (!title || !content || !author) {
      return NextResponse.json(
        { error: "Title, content, and author are required." },
        { status: 400 }
      );
    }

    const blog = await Blog.create({
      title,
      excerpt: excerpt || title.slice(0, 300),
      content,
      author,
      image,
      tags: tags || [],
    });

    return NextResponse.json({ blog }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create blog post" },
      { status: 500 }
    );
  }
}
