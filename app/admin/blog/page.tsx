import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminBlogClient from "./blog-client";

export default async function AdminBlogPage({ searchParams }: { searchParams: { edit?: string } }) {
  // Check authentication on the server to prevent flash of unauthorized content
  const session = await auth();

  if (!session || session.user?.role !== "admin") {
    redirect("/unauthorized");
  }

  // For admin users, render the client component with interactive features
  return <AdminBlogClient initialEditingId={searchParams.edit ?? null} />;
}