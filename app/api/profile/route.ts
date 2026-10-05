import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const { name, currentPassword, newPassword } = body;

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    // Update password if provided
    // Note: We set the plain password and let the pre("save") hook handle hashing.
    // The pre("save") hook in models/User.ts already hashes with bcrypt cost 12.
    if (newPassword && currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }
      // Set plain password — the pre("save") hook will hash it automatically
      user.password = newPassword;
    }

    await user.save();

    return NextResponse.json({
      message: "Profile updated successfully",
      user: { name: user.name, email: user.email },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}