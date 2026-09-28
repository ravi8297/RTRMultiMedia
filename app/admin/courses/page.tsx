import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Course from "@/models/Course";

interface CourseType {
  _id: string;
  title: string;
  shortDescription: string;
  thumbnail: string;
  price: number;
  category: string;
  level: string;
  duration: string;
  lessons: number;
  instructor: string;
  isPublished: boolean;
  createdAt: Date;
}

export default async function AdminCoursesPage() {
  const session = await auth();

  if (!session || session.user?.role !== "admin") {
    redirect("/admin/login");
  }

  await dbConnect();

  const courses = await Course.find().sort({ createdAt: -1 }).lean() as unknown as CourseType[];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-navy-700">Manage Courses</h1>
            <p className="text-gray-600 mt-1">Add, edit, or delete courses</p>
          </div>
          <button
            onClick={() => (document.getElementById("addCourseModal") as HTMLDialogElement | null)?.showModal()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            + Add Course
          </button>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course: CourseType) => (
                <tr key={course._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={course.thumbnail || "https://images.unsplash.com/photo-1515879202570-99db16349c24?w=40&h=40&fit=crop"}
                        alt={course.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-navy-700">{course.title}</p>
                        <p className="text-xs text-gray-500">{course.shortDescription}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {course.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${course.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                    {course.level}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => alert(`Edit: ${course.title}`)}
                      className="text-teal-600 hover:text-teal-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${course.title}"?`)) {
                          // Delete would go here
                          alert(`Delete: ${course.title}`);
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {courses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No courses found</p>
              <p className="text-gray-400 text-sm">Click "Add Course" to create your first course</p>
            </div>
          )}
        </div>

        {/* Add Course Modal */}
        <dialog id="addCourseModal" className="modal">
          <div className="modal-box bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <h3 className="text-xl font-bold text-navy-700 mb-4">Add New Course</h3>

            <form method="dialog" className="space-y-4">
              {/* Course Title */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter course title"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Short Description *
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Brief course description"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Full Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Detailed course description"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select category</option>
                  <option value="Programming">Programming</option>
                  <option value="Data">Data</option>
                  <option value="Web">Web</option>
                  <option value="ERP">ERP</option>
                </select>
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Original Price ($)
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Duration & Lessons */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    name="duration"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="e.g., 10 hours"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Lessons *
                  </label>
                  <input
                    type="number"
                    name="lessons"
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Number of lessons"
                  />
                </div>
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Level
                </label>
                <select
                  name="level"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Instructor */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Instructor Name *
                </label>
                <input
                  type="text"
                  name="instructor"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Instructor name"
                />
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Thumbnail URL *
                </label>
                <input
                  type="url"
                  name="thumbnail"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  onClick={() => (document.getElementById("addCourseModal") as HTMLDialogElement | null)?.close()}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Add Course
                </button>
              </div>
            </form>

            <div className="modal-action">
              <form method="dialog">
                <button className="btn">Close</button>
              </form>
            </div>
          </div>
        </dialog>
      </div>
    </main>
  );
}