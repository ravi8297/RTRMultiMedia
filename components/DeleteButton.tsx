"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  blogId: string;
}

export default function DeleteButton({ blogId }: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/${blogId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/blog");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      type="button"
      disabled={loading}
      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete Post"}
    </button>
  );
}