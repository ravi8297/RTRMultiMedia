"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";

interface AboutContent {
  title: string;
  subtitle: string;
  description: string;
  mission: string;
  vision: string;
  values: Array<{ title: string; description: string }>;
  milestones: Array<{ year: number; title: string; description: string }>;
}

export default function AdminAboutClient() {
  const router = useRouter();

  // Default about content
  const defaultAbout: AboutContent = {
    title: "About RTR Media Solutions",
    subtitle: "Empowering careers through quality education and professional training.",
    description: "RTR Media Solutions is a leading training institute dedicated to bridging the gap between academia and industry. We provide hands-on, practical training that prepares students for real-world challenges.",
    mission: "To make quality tech education accessible and practical, equipping learners with in-demand skills that employers actually need. We focus on hands-on learning, real-world projects, and career outcomes — not just certificates.",
    vision: "To become India's most trusted tech training institute, bridging the gap between education and employment by producing job-ready professionals who thrive in the modern workplace.",
    values: [
      { title: "Expert-Led Training", description: "Learn from industry professionals with real-world experience in their domains." },
      { title: "Hands-On Projects", description: "Build a strong portfolio through practical projects that mirror real work scenarios." },
      { title: "Career Support", description: "Resume guidance, interview prep, and placement assistance to kickstart your career." },
      { title: "Flexible Learning", description: "Choose from classroom, online, or hybrid formats that fit your schedule." },
  ];

  const defaultMilestones: AboutContent["milestones"] = [
    { year: 2018, title: "Founded", description: "RTR Media Solutions started with a vision to bridge the gap between academia and industry-ready tech skills." },
    { year: 2019, title: "500+ Students Trained", description: "Crossed 500 trained professionals across Excel, Python, and SAP modules." },
    { year: 2020, title: "Online Platform Launch", description: "Extended our reach with live online courses, serving students across India and beyond." },
    { year: 2022, title: "1000+ Alumni", description: "Reached 1000+ successful placements with hands-on project-based learning." },
    { year: 2024, title: "Expanded Courses", description: "Added Java, Web Development, and Data Science tracks to our catalog." },
    { year: 2026, title: "Continuing Growth", description: "Ongoing — empowering the next generation of tech professionals with expert-led training." },
  };

  // State for about content
  const [about, setAbout] = useState<AboutContent>(defaultAbout);

  // Fetch about content - in production, this would come from DB
  useEffect(() => {
    // For now, use default about content
    setAbout(defaultAbout);
  }, []);

  // --- Handlers ---

  const handleSave = () => {
    toast.success("About content updated successfully!");
    // In production, this would save to DB
  };

  const handleAddMilestone = () => {
    // Add milestone handler
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-navy-700">About Management</h1>
            <p className="text-gray-600 mt-1">Manage about content</p>
          </div>
        </div>

        {/* About Content */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-navy-700 mb-4">About Content</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Title</label>
              <input
                value={about.title}
                onChange={(e) => setAbout({ ...about, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="Title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Subtitle</label>
              <input
                value={about.subtitle}
                onChange={(e) => setAbout({ ...about, subtitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="Subtitle"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Description</label>
              <textarea
                value={about.description}
                onChange={(e) => setAbout({ ...about, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="Description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Mission</label>
              <textarea
                value={about.mission}
                onChange={(e) => setAbout({ ...about, mission: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="Mission"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Vision</label>
              <textarea
                value={about.vision}
                onChange={(e) => setAbout({ ...about, vision: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="Vision"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Values (one per line)</label>
              <textarea
                value={about.values.map((v) => v.title).join("\n")}
                onChange={(e) => {
                  const lines = e.target.value.split("\n").filter((l: string) => l.trim());
                  setAbout({
                    ...about,
                    values: lines.map((l: string) => ({ title: l, description: "" })),
                  });
                }}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="Expert-Led Training, Hands-On Projects, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Milestones (year - title)</label>
            <textarea
              value={about.milestones.map((m: any) => `${m.year}: ${m.title}`).join("\n")}
              onChange={(e) => {
                const lines = e.target.value.split("\n").filter((l: string) => l.trim());
                const parsedMilestones = lines.map((l: string) => {
                  const [year, title] = l.split(" - ").map((s: string) => s.trim());
                  return { year: parseInt(year) || 0, title: title || "" };
                });
                setAbout({
                  ...about,
                  milestones: parsedMilestones,
                });
              }}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              placeholder="2018 - Founded, 2019 - 500+ Students Trained, etc."
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={() => setAbout(defaultAbout)}
            className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-all disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </div>
    </main>
  );
}