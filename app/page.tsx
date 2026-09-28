import Link from "next/link";
import FeaturedCourses from "@/components/FeaturedCourses";
import StatsCounter from "@/components/StatsCounter";
import Testimonials from "@/components/Testimonials";

export const metadata = {
  title: "RTR Media Solutions - Training Institute",
  description: "Master Excel, Python, SAP, Java & Web Development with expert-led courses at RTR Media Solutions.",
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-navy-700 text-white overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl" />
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-block px-4 py-1 bg-teal-600/20 border border-teal-400/30 rounded-full text-teal-300 text-sm font-medium mb-6">
              🚀 Your Career Growth Starts Here
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              Excel, Python, SAP, Java &{" "}
              <span className="text-teal-400">Web Development</span> Courses
            </h1>

            {/* Subheadline */}
            <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              Master in-demand skills with expert-led training, hands-on projects, and
              career support. Join 10,000+ alumni shaping their future with RTR Media Solutions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/30 text-center"
              >
                Explore Courses
              </Link>
              <Link
                href="/courses"
                className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors text-center"
              >
                Get Started Free
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <p className="text-3xl font-bold text-teal-400">50+</p>
                <p className="mt-1 text-sm text-gray-400">Expert Trainers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-teal-400">10K+</p>
                <p className="mt-1 text-sm text-gray-400">Students Trained</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-teal-400">98%</p>
                <p className="mt-1 text-sm text-gray-400">Placement Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-navy-700 mb-12">
            Why Choose RTR Media Solutions?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Hands-On Projects", desc: "Learn by doing with real-world projects and industry-relevant case studies." },
              { title: "Expert Mentors", desc: "Guidance from seasoned professionals with 10+ years of experience." },
              { title: "Career Support", desc: "Resume building, interview prep, and job placement assistance." },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-navy-700 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <FeaturedCourses />

      {/* Stats Counter */}
      <StatsCounter />

      {/* Testimonials */}
      <Testimonials />
    </>
  );
}