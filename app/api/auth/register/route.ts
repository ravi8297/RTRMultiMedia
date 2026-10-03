import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { createVerificationCode } from "@/lib/verification";
import { sendVerificationCode } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { name, email, password } = await req.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create the user. `isVerified` defaults to false → the account starts in
    // "pending verification" state and cannot log in until the code is entered.
    const user = await User.create({
      name,
      email,
      password,
    });

    // Auto-trigger the activation code (Part 2). A failure here (e.g. email
    // provider down) should NOT block registration — the user can always
    // "resend" from the verify page.
    let codeSent = false;
    try {
      const code = await createVerificationCode(user._id, "activate-account");
      await sendVerificationCode({
        to: email,
        code,
        purpose: "activate-account",
      });
      codeSent = true;
    } catch (sendError: any) {
      console.error(
        `[register] Failed to send activation code for ${email}:`,
        sendError.message
      );
      // Non-fatal: the user can resend from /verify.
    }

    return NextResponse.json(
      {
        message: "User created successfully. A verification code was sent to your email.",
        userId: user._id,
        codeSent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}