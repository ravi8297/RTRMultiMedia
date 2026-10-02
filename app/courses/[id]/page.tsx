"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface CourseType {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: string;
  lessons: number;
  instructor: string;
  rating?: number;
  totalReviews?: number;
  whatYouWillLearn?: string[];
  requirements?: string[];
  tags?: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  enrolledStudents?: string[];
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [course, setCourse] = useState<CourseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/courses/${params.id}`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push("/courses");
            return;
          }
          throw new Error("Failed to fetch course");
        }
        const data = await res.json();
        setCourse(data.course);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [params.id, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded mb-4 w-48 mx-auto" />
          <div className="h-64 bg-gray-200 rounded-xl w-full max-w-4xl mx-auto" />
        </div>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-navy-700 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/courses" className="px-6 py-3 bg-navy-700 text-white rounded-lg hover:bg-navy-800">
            Back to Courses
          </Link>
        </div>
      </main>
    );
  }

  const isLoggedIn = !!session;
  const discount = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;
  const isEnrolled = course.enrolledStudents?.includes(session?.user?.id?.toString() || "") || false;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Course Header */}
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <span>Home</span> / <span>Courses</span> / <span className="text-navy-700">{course.title}</span>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-teal-100 text-teal-700 text-sm font-semibold rounded-full">
              {course.category}
            </span>
            <span className="text-sm text-gray-500">{course.level} level</span>
          </div>
          <h1 className="text-4xl font-bold text-navy-700 mb-4">{course.title}</h1>
          <p className="text-lg text-gray-600 mb-6">{course.shortDescription}</p>

          {/* Rating */}
          {course.rating && (
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.299 4.004 4.401-.627c.916-.132 1.67.739 1.492 1.527l-3.333 2.583 1.299 4.403c.277.921-.778 1.643-1.515 1.157l-3.728-2.41 3.728 2.41c-.737.486-1.792-.236-1.515-1.157l-1.299-4.403-3.333-2.583c-.188-.788.579-1.657 1.492-1.527l4.401.628c.3-.921 1.603-.921 1.902 0l4.401-.627c.916-.132 1.67.739 1.492 1.527l-3.333 2.583 1.299 4.403c.277.921-.778 1.643-1.515 1.157l-3.728-2.41z" />
                  </svg>
                ))}
              </div>
              <span className="font-semibold">{course.rating.toFixed(1)}</span>
              <span className="text-gray-400">({course.totalReviews || 0} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-4 mb-8">
            {discount > 0 && (
              <>
                <span className="text-4xl font-bold text-teal-600">₹{course.price}</span>
                <span className="text-xl text-gray-500 line-through">₹{course.originalPrice}</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 font-semibold rounded-full">
                  Save {discount}%
                </span>
              </>
            )}
            {discount === 0 && (
              <span className="text-4xl font-bold text-teal-600">₹{course.price}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-navy-700 mb-4">Course Description</h2>
              <p className="text-gray-600 mb-4">{course.description}</p>
            </div>

            {/* Syllabus */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-navy-700 mb-4">Syllabus / What You'll Learn</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {course.whatYouWillLearn.map((topic, index) => (
                    <li key={index}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-navy-700 mb-4">Requirements</h2>
                <ul className="list-decimal list-inset space-y-2 text-gray-600">
                  {course.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructor Info */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-navy-700 mb-4">Instructor</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-bold">{course.instructor?.[0] || "T"}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-navy-700">{course.instructor}</h3>
                  <p className="text-gray-600">Expert Instructor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Image + CTA) */}
          <div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
              <img
                src={course.thumbnail || "https://images.unsplash.com/photo-1515879202570-99db16349c24?w=400&h=250&fit=crop"}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
                  <span>⏱️ Duration: {course.duration}</span>
                </div>
                <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
                  <span>📚 Lessons: {course.lessons}</span>
                </div>
                <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
                  <span>👥 Students: {(course.enrolledStudents?.length || 0).toLocaleString()}+</span>
                </div>

                {/* Enroll Now Button Logic */}
                {!isLoggedIn ? (
                  <button
                    onClick={() => router.push(`/auth/login?callbackUrl=/courses/${course._id}`)}
                    className="w-full px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Enroll Now (Login Required)
                  </button>
                ) : isEnrolled ? (
                  <button
                    disabled
                    className="w-full px-4 py-3 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed"
                  >
                    Already Enrolled
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(`/courses/${course._id}/checkout`)}
                    className="w-full px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}