"use client";

import { useSession } from "next-auth/react";
import DeleteButton from "./DeleteButton";

interface AdminActionsProps {
  blogId: string;
}

export default function AdminActions({ blogId }: AdminActionsProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  if (!isAdmin) return null;

  return (
    <div className="flex gap-4 mb-8">
      <a
        href={`/admin/blog?edit=${blogId}`}
        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
      >
        Edit Post
      </a>
      <DeleteButton blogId={blogId} />
    </div>
  );
}