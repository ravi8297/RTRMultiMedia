import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminTrainersClient from "./trainers-client";

export default async function AdminTrainersPage() {
  // Check authentication on the server to prevent flash of unauthorized content
  const session = await auth();

  if (!session || session.user?.role !== "admin") {
    redirect("/unauthorized");
  }

  // For admin users, render the client component with interactive features
  return <AdminTrainersClient />;
}