import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  return await NextAuth(req, { params: { nextauth: [] } }, authOptions);
}

export async function POST(req: NextRequest) {
  return await NextAuth(req, { params: { nextauth: [] } }, authOptions);
}