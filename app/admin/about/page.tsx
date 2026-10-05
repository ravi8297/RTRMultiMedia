import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminAboutClient from "./about-client";

export default async function AdminAboutPage() {
  // Check authentication on the server to prevent flash of unauthorized content
  const session = await auth();

  if (!session || session.user?.role !== "admin") {
    redirect("/unauthorized");
  }

  // For admin users, render the client component with interactive features
  return <AdminAboutClient />;
}