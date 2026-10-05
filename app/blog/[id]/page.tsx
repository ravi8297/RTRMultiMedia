"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface BlogType {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  image?: string;
  tags: string[];
  createdAt: Date;
}

export default function BlogDetailPage({ params }: { params: { id: string } }) {
  const [blog, setBlog] = useState<BlogType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    async function fetchBlog() {
      try {
        const res = await fetch(`/api/blog/${params.id}`);
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 404) {
            router.push("/blog");
            return;
          }
          throw new Error(data.error || "Failed to fetch blog");
        }
        setBlog(data.blog);
      } catch (err) {
        console.error(err);
        router.push("/blog");
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [params.id, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="h-8 bg-gray-200 rounded mb-4 w-48 mx-auto" />
            <div className="h-64 bg-gray-200 rounded-xl w-full max-w-md mx-auto" />
          </div>
        </div>
      </main>
    );
  }

  if (!blog) {
    return null;
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/blog/${blog._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/blog");
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/blog" className="hover:text-teal-600 transition-colors">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-navy-700">{blog.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-teal-100 text-teal-700 text-sm font-semibold rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-4xl font-bold text-navy-700 mb-4">{blog.title}</h1>
          <p className="text-xl text-gray-600 mb-4">{blog.excerpt}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="font-medium">{blog.author}</span>
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Featured Image */}
        {blog.image && (
          <div className="mb-8 rounded-xl overflow-hidden shadow-md">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-72 object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8 prose prose-lg max-w-none">
          {blog.content.split("\n").map((paragraph, index) => (
            <p key={index} className="text-gray-700 mb-4 leading-relaxed">
              {paragraph || " "}
            </p>
          ))}
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="flex gap-4 mb-8">
            <Link
              href={`/admin/blog?edit=${blog._id}`}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Edit Post
            </Link>
            <button
              onClick={handleDelete}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Delete Post
            </button>
          </div>
        )}

        {/* Back to Blog */}
        <Link
          href="/blog"
          className="inline-block text-teal-600 hover:text-teal-800 font-medium"
        >
          &larr; Back to Blog
        </Link>
      </div>
    </main>
  );
}