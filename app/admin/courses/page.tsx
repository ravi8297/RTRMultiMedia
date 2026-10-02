"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

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

// Generic modal backdrop + panel with escape + outside-click handling
function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };
  const onOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      onKeyDown={onKeyDown}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-navy-700">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AdminCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [courses, setCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseType | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<CourseType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    shortDescription: "",
    description: "",
    category: "",
    price: "",
    originalPrice: "",
    duration: "",
    lessons: "",
    level: "beginner",
    instructor: "",
    thumbnail: "",
  });

  // Redirect if not admin
  if (status === "authenticated" && session?.user?.role !== "admin") {
    router.push("/admin/login");
    return null;
  }

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses || []);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchCourses();
    }
  }, [status]);

  // --- Handlers ---
  const openAddModal = () => {
    setForm({
      title: "", shortDescription: "", description: "", category: "",
      price: "", originalPrice: "", duration: "", lessons: "",
      level: "beginner", instructor: "", thumbnail: "",
    });
    setShowAddModal(true);
  };

  const openEditModal = (course: CourseType) => {
    setEditingCourse(course);
    setForm({
      title: course.title || "",
      shortDescription: course.shortDescription || "",
      description: "",
      category: course.category || "",
      price: course.price.toString() || "",
      originalPrice: "",
      duration: course.duration || "",
      lessons: course.lessons.toString() || "",
      level: course.level || "beginner",
      instructor: course.instructor || "",
      thumbnail: course.thumbnail || "",
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (course: CourseType) => {
    setDeletingCourse(course);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setEditingCourse(null);
    setDeletingCourse(null);
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          shortDescription: form.shortDescription,
          description: form.description,
          category: form.category,
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
          duration: form.duration,
          lessons: Number(form.lessons),
          level: form.level,
          instructor: form.instructor,
          thumbnail: form.thumbnail,
          isPublished: false,
        }),
      });
      if (!response.ok) throw new Error("Failed to create course");
      const { course } = await response.json();
      setCourses((prev) => [course, ...prev]);
      toast.success("Course created successfully!");
      closeModals();
    } catch (err: any) {
      toast.error(err.message || "Failed to create course");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/courses/${editingCourse._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          shortDescription: form.shortDescription,
          description: form.description,
          category: form.category,
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
          duration: form.duration,
          lessons: Number(form.lessons),
          level: form.level,
          instructor: form.instructor,
          thumbnail: form.thumbnail,
          isPublished: editingCourse.isPublished,
        }),
      });
      if (!response.ok) throw new Error("Failed to update course");
      const { course } = await response.json();
      setCourses((prev) => prev.map((c) => (c._id === course._id ? course : c)));
      toast.success("Course updated successfully!");
      closeModals();
    } catch (err: any) {
      toast.error(err.message || "Failed to update course");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourse) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/courses/${deletingCourse._id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete course");
      setCourses((prev) => prev.filter((c) => c._id !== deletingCourse._id));
      toast.success(`"${deletingCourse.title}" has been deleted`);
      closeModals();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete course");
    } finally {
      setActionLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </main>
    );
  }

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
            onClick={openAddModal}
            className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-medium hover:from-teal-500 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-teal-500/25"
          >
            + Add Course
          </button>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {courses.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50/50 transition-colors">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{course.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{course.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{course.level}</td>
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
                      onClick={() => openEditModal(course)}
                      className="text-teal-600 hover:text-teal-800 font-medium mr-3 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(course)}
                      className="text-red-600 hover:text-red-800 font-medium transition-colors"
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
        <Modal open={showAddModal} title="Add New Course" onClose={closeModals}>
          <form className="space-y-4" onSubmit={handleAddCourse}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">Course Title *</label>
                <input
                  type="text" name="title" required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Enter course title"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">Short Description *</label>
                <input
                  type="text" name="shortDescription" required value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Brief description"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">Full Description *</label>
                <textarea
                  name="description" required value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Detailed course description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Category *</label>
                <select
                  name="category" required value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                >
                  <option value="">Select</option>
                  <option value="Programming">Programming</option>
                  <option value="Data">Data</option>
                  <option value="Web">Web</option>
                  <option value="ERP">ERP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Level</label>
                <select
                  name="level" value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Price (₹) *</label>
                <input
                  type="number" name="price" required min="0" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Original Price (₹)</label>
                <input
                  type="number" name="originalPrice" min="0" value={form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Duration *</label>
                <input
                  type="text" name="duration" required value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="e.g., 10 hours"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Lessons *</label>
                <input
                  type="number" name="lessons" required min="1" value={form.lessons}
                  onChange={(e) => setForm({ ...form, lessons: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Number of lessons"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">Instructor Name *</label>
                <input
                  type="text" name="instructor" required value={form.instructor}
                  onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Instructor name"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">Thumbnail URL *</label>
                <input
                  type="url" name="thumbnail" required value={form.thumbnail}
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={closeModals}
                className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-navy-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-all disabled:opacity-50"
              >
                {actionLoading ? "Creating..." : "Create Course"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Course Modal */}
        <Modal open={showEditModal} title="Edit Course" onClose={closeModals}>
          <form className="space-y-4" onSubmit={handleEditCourse}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">Course Title *</label>
                <input
                  type="text" name="title" required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Enter course title"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">Short Description *</label>
                <input
                  type="text" name="shortDescription" required value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Brief description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Category *</label>
                <select
                  name="category" required value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                >
                  <option value="">Select</option>
                  <option value="Programming">Programming</option>
                  <option value="Data">Data</option>
                  <option value="Web">Web</option>
                  <option value="ERP">ERP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Level</label>
                <select
                  name="level" value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Price (₹) *</label>
                <input
                  type="number" name="price" required min="0" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Original Price (₹)</label>
                <input
                  type="number" name="originalPrice" min="0" value={form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Duration *</label>
                <input
                  type="text" name="duration" required value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="e.g., 10 hours"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Lessons *</label>
                <input
                  type="number" name="lessons" required min="1" value={form.lessons}
                  onChange={(e) => setForm({ ...form, lessons: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Number of lessons"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">Instructor Name *</label>
                <input
                  type="text" name="instructor" required value={form.instructor}
                  onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Instructor name"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">Thumbnail URL *</label>
                <input
                  type="url" name="thumbnail" required value={form.thumbnail}
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={closeModals}
                className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-navy-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-all disabled:opacity-50"
              >
                {actionLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          open={showDeleteModal}
          title="Confirm Deletion"
          onClose={closeModals}
        >
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9V3.75c0-.966-.734-1.75-1.5-1.75S9 2.784 9 3.75V9m0 0H4.5c-.966 0-1.5 1.039-1.5 1.5v.5c0 .561.534 1.5 1.5 1.5H9m0 0v5.25c0 .966.734 1.75 1.5 1.75h3c.265 0 .5-.235.5-.5v-5.25m-4.5-3h3" />
              </svg>
            </div>
            {deletingCourse && (
              <p className="text-sm text-gray-600 mb-2">
                Are you sure you want to delete <strong>"{deletingCourse.title}"</strong>?
              </p>
            )}
            <p className="text-xs text-gray-500 mb-6">This action cannot be undone.</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={closeModals}
                className="px-6 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                disabled={actionLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Delete Course"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </main>
  );
}