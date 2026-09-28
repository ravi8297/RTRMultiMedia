"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Course {
  _id: string;
  title: string;
  shortDescription: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  category: string;
  level: string;
  duration: string;
  instructor?: string;
  rating?: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Programming", "Data", "Web", "ERP"];

  useEffect(() => {
    async function fetchCourses() {
      try {
        const params = selectedCategory !== "All" ? `?category=${selectedCategory}` : "";
        const response = await fetch(`/api/courses${params}`);
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setCourses(data.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [selectedCategory]);

  const getCourseImage = (category: string) => {
    const images: Record<string, string> = {
      Programming: "https://images.unsplash.com/photo-1498050112218-5ee9701f8189?w=400&h=250&fit=crop",
      Data: "https://images.unsplash.com/photo-1461696114087-397271a62f47?w=400&h=250&fit=crop",
      Web: "https://images.unsplash.com/photo-1555066931-32e78a7d0b84?w=400&h=250&fit=crop",
      ERP: "https://images.unsplash.com/photo-1552664730-d06719aaec6e?w=400&h=250&fit=crop",
      default: "https://images.unsplash.com/photo-1515879202570-99db16349c24?w=400&h=250&fit=crop",
    };
    return images[category] || images.default;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-navy-700 mb-8">All Courses</h1>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-navy-700 text-white"
                  : "bg-white text-gray-600 hover:bg-teal-50 hover:text-teal-600 border border-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-white rounded-xl overflow-hidden shadow-md">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-3 w-3/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-full" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-1/2" />
                  <div className="h-10 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && courses.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 mb-4">No courses found</p>
            <p className="text-gray-400">Try selecting a different category or check back later.</p>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Link
                key={course._id}
                href={`/courses/${course._id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={getCourseImage(course.category)}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                      {course.category}
                    </span>
                    <span className="text-sm text-gray-500">{course.level}</span>
                  </div>
                  <h3 className="text-lg font-bold text-navy-700 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.shortDescription}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-teal-600">₹{course.price}</span>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.299 4.004 4.401-.627c.916-.132 1.67.739 1.492 1.527l-3.333 2.583 1.299 4.403c.277.921-.778 1.643-1.515 1.157l-3.728-2.41 3.728 2.41c-.737.486-1.792-.236-1.515-1.157l-1.299-4.403-3.333-2.583c-.188-.788.579-1.657 1.492-1.527l4.401.628c.3-.921 1.603-.921 1.902 0l4.401-.627c.916-.132 1.67.739 1.492 1.527l-3.333 2.583 1.299 4.403c.277.921-.778 1.643-1.515 1.157l-3.728-2.41z" />
                      </svg>
                      {course.rating || 4.5}
                    </div>
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
