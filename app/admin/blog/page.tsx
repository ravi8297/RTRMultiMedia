"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminNavBar } from "@/components/AdminNavBar";

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

export default function AdminBlogPage({ searchParams }: { searchParams: { edit?: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(searchParams.edit ?? null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    image: "",
    tags: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteError, setDeleteError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Redirect if not admin - using type assertion since next-auth doesn't expose role in session.user type
  useEffect(() => {
    if (status === "loading") return;
    // Type-safe check for admin role with proper type assertion
    const isAdmin = session?.user && (session.user as any).role === "admin";
    if (!isAdmin) {
      router.push("/unauthorized");
    }
  }, [session, status, router]);

  // Fetch blogs
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blog");
      if (!res.ok) throw new Error("Failed to fetch blogs");
      const data = await res.json();
      setBlogs(data.blogs || []);

      // If editing a specific blog, populate form
      if (searchParams.edit) {
        const blogToEdit = data.blogs.find((b: BlogType) => b._id === searchParams.edit);
        if (blogToEdit) {
          setFormData({
            title: blogToEdit.title,
            excerpt: blogToEdit.excerpt || "",
            content: blogToEdit.content,
            author: blogToEdit.author,
            image: blogToEdit.image || "",
            tags: blogToEdit.tags.join(", "),
          });
        }
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Loading/error state while redirecting non-admin users
  const isAdmin = status === "authenticated" && session?.user && (session.user as any).role === "admin";
  if (status === "loading" || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validate required fields
    if (!formData.title.trim()) {
      setFormErrors((prev) => ({ ...prev, title: "Title is required" }));
      return;
    }
    if (!formData.author.trim()) {
      setFormErrors((prev) => ({ ...prev, author: "Author is required" }));
      return;
    }
    if (!formData.content.trim()) {
      setFormErrors((prev) => ({ ...prev, content: "Content is required" }));
      return;
    }

    setFormLoading(true);
    try {
      const body = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        author: formData.author.trim(),
        image: formData.image.trim() || undefined,
        tags:
          formData.tags
            ?.split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0) || [],
      };

      const url = editingId ? `/api/blog/${editingId}` : "/api/blog";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save blog post");

      // Reset form and refresh list
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        author: "",
        image: "",
        tags: "",
      });
      setEditingId(null);
      // Redirect to remove the edit param
      router.push("/admin/blog");
      // Refresh list
      setTimeout(fetchBlogs, 300);
    } catch (err: any) {
      setFormErrors({ submit: err.message });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteError("");
    try {
      const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete blog post");
      // Remove from state
      setBlogs((prev) => prev.filter((blog) => blog._id !== id));
      // If we were editing the deleted blog, cancel editing
      if (editingId === id) {
        setEditingId(null);
        setFormData({
          title: "",
          excerpt: "",
          content: "",
          author: "",
          image: "",
          tags: "",
        });
      }
    } catch (err: any) {
      setDeleteError(err.message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy-700">Blog Management</h1>
            <p className="text-gray-600 mt-1">Create, edit, and delete blog posts</p>
          </div>
          <Link
            href="/admin/blog?edit=new"
            className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            + New Post
          </Link>
        </div>

        <AdminNavBar />

        {/* Blog Form */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-navy-700 mb-4">
            {editingId ? "Edit Post" : "Create New Post"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formErrors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {formErrors.submit}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none ${
                  formErrors.title ? "border-red-500" : ""
                }`}
                placeholder="Post title"
              />
              {formErrors.title && (
                <p className="mt-1 text-xs text-red-600">{formErrors.title}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <input
                type="text"
                name="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                placeholder="Short summary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                required
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none ${
                  formErrors.author ? "border-red-500" : ""
                }`}
                placeholder="Author name"
              />
              {formErrors.author && (
                <p className="mt-1 text-xs text-red-600">{formErrors.author}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                placeholder="javascript, web development"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                required
                rows={6}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none ${
                  formErrors.content ? "border-red-500" : ""
                }`}
                placeholder="Write your blog content here..."
              />
              {formErrors.content && (
                <p className="mt-1 text-xs text-red-600">{formErrors.content}</p>
              )}
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={formLoading}
                className={`px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium ${
                  formLoading ? "opacity-70" : ""
                }`}
              >
                {formLoading ? "Saving..." : editingId ? "Update Post" : "Create Post"}
              </button>
              {editingId && (
                <Link
                  href="/admin/blog"
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      title: "",
                      excerpt: "",
                      content: "",
                      author: "",
                      image: "",
                      tags: "",
                    });
                  }}
                >
                  Cancel
                </Link>
              )}
              {deleteError && (
                <p className="text-red-600 text-sm">{deleteError}</p>
              )}
            </div>
          </form>
        </div>

        {/* Blog List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-navy-700">All Posts ({blogs.length})</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-32 mx-auto" />
                  </td>
                </tr>
              ) : (
                blogs.map((blog: BlogType) => (
                  <tr key={blog._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-navy-700">{blog.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{blog.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex gap-1">
                        {blog.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">{tag}</span>
                        ))}
                        {blog.tags.length > 2 && <span className="text-xs text-gray-500">+{blog.tags.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(blog.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/blog?edit=${blog._id}`}
                        className="text-teal-600 hover:text-teal-900 mr-4"
                        onClick={() => {
                          const blogToEdit = blogs.find((b) => b._id === blog._id);
                          if (blogToEdit) {
                            setEditingId(blog._id);
                            setFormData({
                              title: blogToEdit.title,
                              excerpt: blogToEdit.excerpt || "",
                              content: blogToEdit.content,
                              author: blogToEdit.author,
                              image: blogToEdit.image || "",
                              tags: blogToEdit.tags.join(", "),
                            });
                          }
                        }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {blogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No blog posts yet</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
