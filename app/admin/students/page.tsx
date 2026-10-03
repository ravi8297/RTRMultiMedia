import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminSidebar } from "@/components/AdminSidebar";

interface EnrollmentType {
  _id: string;
  course: {
    _id: string;
    title: string;
    category: string;
  };
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  amount: number;
  enrolledAt: Date;
}

interface StudentType {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  enrollments: EnrollmentType[];
  totalEnrolled: number;
  paidEnrollments: number;
  pendingEnrollments: number;
}

export default async function AdminStudentsPage() {
  const session = await auth();

  if (!session || session.user?.role !== "admin") {
    redirect("/unauthorized");
  }

  // Fetch students data from API
  const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/admin/students`, {
    cache: "no-store",
  });
  const { students = [] } = await res.json();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex h-[calc(100vh-4rem)]">
        <AdminSidebar />
        <div className="flex-1 p-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-navy-700">Students & Enrollments</h1>
              <p className="text-gray-600 mt-1">Manage student accounts and track enrollments</p>
            </div>

            {/* Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-3xl font-bold text-navy-700">{students.length}</p>
            <p className="text-sm text-gray-500">Total Students</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-3xl font-bold text-teal-600">
              {students.reduce((acc: number, s: StudentType) => acc + s.paidEnrollments, 0)}
            </p>
            <p className="text-sm text-gray-500">Paid Enrollments</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-3xl font-bold text-orange-600">
              {students.reduce((acc: number, s: StudentType) => acc + s.pendingEnrollments, 0)}
            </p>
            <p className="text-sm text-gray-500">Pending Payments</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-3xl font-bold text-teal-600">
              {students.reduce((acc: number, s: StudentType) => acc + s.totalEnrolled, 0)}
            </p>
            <p className="text-sm text-gray-500">Total Enrollments</p>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrolled Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student: StudentType) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-teal-600 font-bold">{student.name[0]}</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-navy-700">{student.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <span>{student.totalEnrolled} enrolled</span>
                      {student.enrollments.length > 0 && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {student.enrollments.slice(0, 2).map((e: EnrollmentType) => e.course?.title).join(", ")}
                          {student.enrollments.length > 2 && ` +${student.enrollments.length - 2} more`}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                      {student.paidEnrollments}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full font-medium">
                      {student.pendingEnrollments}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-teal-600 hover:text-teal-900 mr-4">
                      View
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {students.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No students found</p>
              <p className="text-gray-400 text-sm">Students will appear here after registration</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </main>
  );
}