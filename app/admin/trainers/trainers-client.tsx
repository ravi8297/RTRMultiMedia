"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { AdminSidebar } from "@/components/AdminSidebar";

interface Trainer {
  _id: string;
  name: string;
  email: string;
  bio: string;
  expertise: string[];
  image?: string;
  yearsOfExperience: number;
  certifications?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  isActive: boolean;
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

export default function AdminTrainersClient() {
  const router = useRouter();

  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    expertise: "",
    yearsOfExperience: "",
    certifications: "",
    image: "",
    isActive: true,
  });

  // Fetch trainers
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await fetch("/api/admin/trainers");
        if (response.ok) {
          const data = await response.json();
          setTrainers(data.trainers || []);
        }
      } catch (error) {
        console.error("Error fetching trainers:", error);
        toast.error("Failed to load trainers");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  // --- Handlers ---

  const openAddModal = () => {
    setForm({
      name: "",
      email: "",
      bio: "",
      expertise: "",
      yearsOfExperience: "",
      certifications: "",
      image: "",
      isActive: true,
    });
    setShowAddModal(true);
  };

  const openEditModal = (trainer: any) => {
    setForm({
      _id: trainer._id,
      name: trainer.name || "",
      email: trainer.email || "",
      bio: trainer.bio || "",
      expertise: trainer.expertise ? trainer.expertise.join(", ") : "",
      yearsOfExperience: trainer.yearsOfExperience?.toString() || "",
      certifications: trainer.certifications ? trainer.certifications.join(", ") : "",
      image: trainer.image || "",
      isActive: trainer.isActive,
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
  };

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          bio: form.bio,
          expertise: form.expertise ? form.expertise.split(",").map((e: string) => e.trim()) : [],
          yearsOfExperience: Number(form.yearsOfExperience),
          certifications: form.certifications ? form.certifications.split(",").map((e: string) => e.trim()) : [],
          image: form.image,
          isActive: form.isActive,
        }),
      });
      if (!response.ok) throw new Error("Failed to create trainer");
      const { trainer } = await response.json();
      setTrainers((prev) => [trainer, ...prev]);
      toast.success("Trainer created successfully!");
      closeModals();
    } catch (err: any) {
      toast.error(err.message || "Failed to create trainer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form._id) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/trainers/${form._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          bio: form.bio,
          expertise: form.expertise ? form.expertise.split(",").map((e: string) => e.trim()) : [],
          yearsOfExperience: Number(form.yearsOfExperience),
          certifications: form.certifications ? form.certifications.split(",").map((e: string) => e.trim()) : [],
          image: form.image,
          isActive: form.isActive,
        }),
      });
      if (!response.ok) throw new Error("Failed to update trainer");
      const { trainer } = await response.json();
      setTrainers((prev) => prev.map((t) => t._id === form._id ? trainer : t));
      toast.success("Trainer updated successfully!");
      closeModals();
    } catch (err: any) {
      toast.error(err.message || "Failed to update trainer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTrainer = async () => {
    if (!form._id) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/trainers/${form._id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete trainer");
      setTrainers((prev) => prev.filter((t) => t._id !== form._id));
      toast.success("Trainer deleted");
      closeModals();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete trainer");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-navy-700">Manage Trainers</h1>
            <p className="text-gray-600 mt-1">Add, edit, or delete trainers</p>
          </div>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-medium hover:from-teal-500 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-teal-500/25"
          >
            + Add Trainer
          </button>
        </div>

        <AdminSidebar />

        {/* Trainers Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expertise</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {trainers.map((trainer) => (
                <tr key={trainer._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={trainer.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop"}
                        alt={trainer.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-navy-700">{trainer.name}</p>
                        <p className="text-xs text-gray-500">{trainer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{trainer.expertise ? trainer.expertise.join(", ") : ""}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{trainer.yearsOfExperience} years</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        trainer.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {trainer.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setForm({
                          _id: trainer._id,
                          name: trainer.name || "",
                          email: trainer.email || "",
                          bio: trainer.bio || "",
                          expertise: trainer.expertise ? trainer.expertise.join(", ") : "",
                          yearsOfExperience: trainer.yearsOfExperience?.toString() || "",
                          certifications: trainer.certifications ? trainer.certifications.join(", ") : "",
                          image: trainer.image || "",
                          isActive: trainer.isActive,
                        });
                        setShowEditModal(true);
                      }}
                      className="text-teal-600 hover:text-teal-800 font-medium mr-3 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setForm({ _id: trainer._id, name: trainer.name });
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-800 font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {trainers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No trainers found</p>
                <p className="text-gray-400 text-sm">Click "Add Trainer" to add your first trainer</p>
              </div>
            )}
          </table>
        </div>

        {/* Add Trainer Modal */}
        <Modal open={showAddModal} title="Add New Trainer" onClose={closeModals}>
          <form className="space-y-4" onSubmit={handleAddTrainer}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Name *</label>
                <input
                  type="text" name="name" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Instructor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Email *</label>
                <input
                  type="email" name="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="instructor@domain.com"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">Bio *</label>
                <textarea
                  name="bio" required value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Trainer biography"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Expertise (comma-separated)</label>
                <input
                  type="text" name="expertise" value={form.expertise}
                  onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="e.g., Advanced Excel, Power BI"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Years of Experience *</label>
                <input
                  type="number" name="yearsOfExperience" required min="0" value={form.yearsOfExperience}
                  onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">Certifications</label>
                <input
                  type="text" name="certifications" value={form.certifications}
                  onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="e.g., MCP, PMP"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Image URL</label>
                <input
                  type="url" name="image" value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
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
                {actionLoading ? "Creating..." : "Create Trainer"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Trainer Modal */}
        <Modal open={showEditModal} title="Edit Trainer" onClose={closeModals}>
          <form className="space-y-4" onSubmit={handleEditTrainer}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Name *</label>
                <input
                  type="text" name="name" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Instructor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Email *</label>
                <input
                  type="email" name="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="instructor@domain.com"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">Bio *</label>
                <textarea
                  name="bio" required value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Trainer biography"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Expertise (comma-separated)</label>
                <input
                  type="text" name="expertise" value={form.expertise}
                  onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="e.g., Advanced Excel, Power BI"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Years of Experience *</label>
                <input
                  type="number" name="yearsOfExperience" required min="0" value={form.yearsOfExperience}
                  onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">Certifications</label>
                <input
                  type="text" name="certifications" value={form.certifications}
                  onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="e.g., MCP, PMP"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Image URL</label>
                <input
                  type="url" name="image" value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
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
            {form._id && (
              <p className="text-sm text-gray-600 mb-2">
                Are you sure you want to delete <strong>{form.name}</strong>?
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
                onClick={handleDeleteTrainer}
                disabled={actionLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Delete Trainer"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </main>
  );
}