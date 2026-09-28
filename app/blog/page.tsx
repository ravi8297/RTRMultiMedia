import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Blog from "@/models/Blog";

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

async function getBlogs() {
  await dbConnect();
  const blogs = await Blog.find().sort({ createdAt: -1 }).lean() as unknown as BlogType[];
  return blogs;
}

export default async function BlogPage() {
  const blogs = await getBlogs();
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-navy-700 mb-3">Blog</h1>
          <p className="text-lg text-gray-600">Insights, tips, and updates from our team</p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 mb-4">No blog posts yet</p>
            {isAdmin && (
              <Link
                href="/admin/blog"
                className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                Write Your First Post
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog: BlogType) => (
              <Link
                key={blog._id}
                href={`/blog/${blog._id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
              >
                <div className="h-52 overflow-hidden">
                  <img
                    src={blog.image || "https://images.unsplash.com/photo-1498050112218-5ee9701f8189?w=400&h=250&fit=crop"}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {blog.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold text-navy-700 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{blog.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="font-medium">{blog.author}</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
