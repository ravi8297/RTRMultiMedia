import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileForm from "./ProfileForm";

interface EnrollmentType {
  _id: string;
  student: string;
  course: {
    _id: string;
    title: string;
    thumbnail: string;
    price: number;
    duration: string;
    category: string;
  };
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  amount: number;
  enrolledAt: Date;
  completedAt?: Date;
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

    // Fetch enrollments
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const enrollmentsRes = await fetch(`${baseUrl}/api/enrollments/my`, {
    headers: { cookie: cookies().toString() },
    cache: "no-store",
  });
  const { enrollments = [] } = await enrollmentsRes.json();

  const enrolledCourses = enrollments.filter((e: EnrollmentType) => e.paymentStatus === "paid");
  const completedCount = enrollments.filter((e: EnrollmentType) => e.completedAt !== undefined).length;
  const progressPercentage = enrolledCourses.length > 0 ?
    Math.round((completedCount / enrolledCourses.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-navy-700 mb-4">
            Welcome back, {session.user?.name}!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Your learning dashboard
          </p>
        </div>

        {/* Stats */}
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-medium text-navy-700 mb-3">Enrolled Courses</h3>
            <p className="text-4xl font-bold text-teal-600">{enrolledCourses.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-medium text-navy-700 mb-3">Completed</h3>
            <p className="text-4xl font-bold text-teal-600">{completedCount}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-medium text-navy-700 mb-3">Progress</h3>
            <p className="text-4xl font-bold text-orange-600">{progressPercentage}%</p>
          </div>
        </div>

        {/* Enrolled Courses List */}
        {enrolledCourses.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-navy-700 mb-6">My Courses</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map((course: EnrollmentType) => (
                <div key={course._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <img
                      src={course.course?.thumbnail || "https://images.unsplash.com/photo-1515879202570-99db16349c24?w=400&h=250&fit=crop"}
                      alt={course.course?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-navy-700 mb-2">{course.course?.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{course.course?.category} • {course.course?.duration}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        ${course.amount}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        course.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {course.paymentStatus}
                      </span>
                    </div>
                    <div className="mt-4">
                      <a
                        href={`/courses/${course.course?._id}`}
                        className="w-full px-4 py-2 bg-navy-700 text-white font-medium rounded-lg hover:bg-navy-800 transition-colors"
                      >
                        Continue Learning
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 mb-4">No enrolled courses yet</p>
            <p className="text-gray-400">Browse courses and start your learning journey!</p>
            <Link
              href="/courses"
              className="inline-block px-6 py-3 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition-colors"
            >
              Explore Courses
            </Link>
          </div>
        )}

        {/* Profile Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-navy-700 mb-6">Profile</h2>
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-navy-700 mb-2">Account Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-teal-600 font-bold">{session.user?.name?.[0] || "U"}</span>
                    </div>
                    <div>
                      <p className="font-medium text-navy-700">{session.user?.name}</p>
                      <p className="text-sm text-gray-500">{session.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">Role:</span>
                    <span className="font-medium capitalize">{session.user?.role}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-navy-700 mb-4">Change Password</h3>
                <ProfileForm user={session.user} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}