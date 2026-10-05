import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { auth } from "@/lib/auth";

interface AboutContent {
  title: string;
  subtitle: string;
  description: string;
  mission: string;
  vision: string;
  values: Array<{
    title: string;
    description: string;
  }>;
  milestones: Array<{
    year: number;
    title: string;
    description: string;
  }>;
}

const DEFAULT_ABOUT: AboutContent = {
  title: "About RTR Media Solutions",
  subtitle: "Empowering careers through quality education and professional training.",
  description: "RTR Media Solutions is a leading training institute dedicated to bridging the gap between academia and industry. We provide hands-on, practical training that prepares students for real-world challenges.",
  mission: "To make quality tech education accessible and practical, equipping learners with in-demand skills that employers actually need. We focus on hands-on learning, real-world projects, and career outcomes — not just certificates.",
  vision: "To become India's most trusted tech training institute, bridging the gap between education and employment by producing job-ready professionals who thrive in the modern workplace.",
  values: [
    { title: "Expert-Led Training", description: "Learn from industry professionals with real-world experience in their domains." },
    { title: "Hands-On Projects", description: "Build a strong portfolio through practical projects that mirror real work scenarios." },
    { title: "Career Support", description: "Resume guidance, interview prep, and placement assistance to kickstart your career." },
    { title: "Flexible Learning", description: "Choose from classroom, online, or hybrid formats that fit your schedule." },
  ],
  milestones: [
    { year: 2018, title: "Founded", description: "RTR Media Solutions started with a vision to bridge the gap between academia and industry-ready tech skills." },
    { year: 2019, title: "500+ Students Trained", description: "Crossed 500 trained professionals across Excel, Python, and SAP modules." },
    { year: 2020, title: "Online Platform Launch", description: "Extended our reach with live online courses, serving students across India and beyond." },
    { year: 2022, title: "1000+ Alumni", description: "Reached 1000+ successful placements with hands-on project-based learning." },
    { year: 2024, title: "Expanded Courses", description: "Added Java, Web Development, and Data Science tracks to our catalog." },
    { year: 2026, title: "Continuing Growth", description: "Ongoing — empowering the next generation of tech professionals with expert-led training." },
  ],
};

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

    // For now, return default content - in production you might store this in DB
    return NextResponse.json({ about: DEFAULT_ABOUT });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch about content" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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

    const { title, subtitle, description, mission, vision, values, milestones } = body;

    if (!title || !subtitle || !description) {
      return NextResponse.json(
        { error: "Title, subtitle, and description are required" },
        { status: 400 }
      );
    }

    // In production, you would save to DB here
    // For now, just return the updated content
    return NextResponse.json({
      about: {
        title,
        subtitle,
        description,
        mission,
        vision,
        values,
        milestones,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update about content" },
      { status: 500 }
    );
  }
}