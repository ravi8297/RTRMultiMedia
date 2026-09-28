import Link from "next/link";

interface Milestone {
  year: number;
  title: string;
  description: string;
}

export const metadata = {
  title: "About Us - RTR Media Solutions",
  description: "Learn about RTR Media Solutions — our mission, vision, and journey in tech training.",
};

const milestones: Milestone[] = [
  { year: 2018, title: "Founded", description: "RTR Media Solutions started with a vision to bridge the gap between academia and industry-ready tech skills." },
  { year: 2019, title: "500+ Students Trained", description: "Crossed 500 trained professionals across Excel, Python, and SAP modules." },
  { year: 2020, title: "Online Platform Launch", description: "Extended our reach with live online courses, serving students across India and beyond." },
  { year: 2022, title: "1000+ Alumni", description: "Reached 1000+ successful placements with hands-on project-based learning." },
  { year: 2024, title: "Expanded Courses", description: "Added Java, Web Development, and Data Science tracks to our catalog." },
  { year: 2026, title: "Continuing Growth", description: "Ongoing — empowering the next generation of tech professionals with expert-led training." },
];

const values = [
  { title: "Expert-Led Training", description: "Learn from industry professionals with real-world experience in their domains." },
  { title: "Hands-On Projects", description: "Build a strong portfolio through practical projects that mirror real work scenarios." },
  { title: "Career Support", description: "Resume guidance, interview prep, and placement assistance to kickstart your career." },
  { title: "Flexible Learning", description: "Choose from classroom, online, or hybrid formats that fit your schedule." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-navy-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About RTR Media Solutions</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Empowering careers through quality education and professional training since 2018.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-navy-700 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To make quality tech education accessible and practical, equipping learners with in-demand
                skills that employers actually need. We focus on hands-on learning, real-world projects,
                and career outcomes — not just certificates.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-navy-700 mb-4">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                To become India's most trusted tech training institute, bridging the gap between education
                and employment by producing job-ready professionals who thrive in the modern workplace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy-700 text-center mb-12">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-xl shadow-md p-6 text-center">
                <h3 className="text-lg font-bold text-navy-700 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy-700 text-center mb-12">Our Journey</h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-teal-200 -translate-x-1/2 hidden md:block" />
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`flex flex-col md:flex-row items-start md:items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-4`}
                >
                  <div className="md:w-1/2 md:text-right">
                    <span className="text-teal-600 font-bold text-lg">{milestone.year}</span>
                    <h3 className="text-xl font-bold text-navy-700">{milestone.title}</h3>
                    <p className="text-gray-600 mt-1">{milestone.description}</p>
                  </div>
                  <div className="hidden md:block w-4 h-4 bg-teal-600 rounded-full border-4 border-white shadow z-10" />
                  <div className="md:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Explore our courses and take the first step toward a rewarding career in tech.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses" className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors">
              Explore Courses
            </Link>
            <Link href="/contact" className="px-8 py-3 bg-white text-navy-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
