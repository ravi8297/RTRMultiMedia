import Link from "next/link";

interface Trainer {
  name: string;
  role: string;
  bio: string;
  experience: string;
  image: string;
  specialization: string[];
}

export const metadata = {
  title: "Our Trainers - RTR Media Solutions",
  description: "Meet our expert trainers with years of industry experience.",
};

const trainers: Trainer[] = [
  {
    name: "Rajesh Kumar",
    role: "Lead Excel & Data Analytics Trainer",
    bio: "15+ years in financial modeling and data analytics with top consulting firms. Certified Microsoft Office Specialist.",
    experience: "15 years",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    specialization: ["Advanced Excel", "Power BI", "Data Analysis"],
  },
  {
    name: "Priya Sharma",
    role: "Python & Machine Learning Trainer",
    bio: "PhD in Computer Science with 8 years of teaching and industry experience in AI/ML frameworks.",
    experience: "8 years",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
    specialization: ["Python", "Machine Learning", "TensorFlow"],
  },
  {
    name: "Amit Patel",
    role: "SAP & ERP Consultant",
    bio: "Certified SAP consultant with 12 years implementing ERP solutions for Fortune 500 companies.",
    experience: "12 years",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop",
    specialization: ["SAP MM", "SAP SD", "ERP Implementation"],
  },
  {
    name: "Sneha Reddy",
    role: "Java & Full-Stack Developer",
    bio: "Senior developer with expertise in Spring Boot, React, and cloud-native architectures.",
    experience: "10 years",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
    specialization: ["Java", "Spring Boot", "React"],
  },
  {
    name: "Vikram Singh",
    role: "Web Development Trainer",
    bio: "Full-stack developer and open-source contributor with a passion for teaching modern web technologies.",
    experience: "7 years",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
    specialization: ["JavaScript", "Node.js", "Next.js"],
  },
  {
    name: "Ananya Iyer",
    role: "UX/UI & Design Thinking",
    bio: "Design strategist with experience at leading product companies, specializing in user-centered design.",
    experience: "6 years",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
    specialization: ["Figma", "UI/UX", "Design Systems"],
  },
];

export default function TrainersPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-navy-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Trainers</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Learn from industry professionals with years of real-world experience.
          </p>
        </div>
      </section>

      {/* Trainers Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainers.map((trainer) => (
              <div key={trainer.name} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-64 overflow-hidden">
                  <img
                    src={trainer.image}
                    alt={trainer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-navy-700">{trainer.name}</h3>
                  <p className="text-teal-600 text-sm font-medium mt-1">{trainer.role}</p>
                  <p className="text-gray-600 text-sm mt-3 line-clamp-3">{trainer.bio}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {trainer.specialization.map((spec) => (
                      <span key={spec} className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                        {spec}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {trainer.experience} experience
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Interested in Our Courses?</h2>
          <p className="text-lg text-teal-100 mb-6">
            Speak with our team to find the perfect course for your career goals.
          </p>
          <Link href="/contact" className="px-8 py-3 bg-white text-teal-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
            Get in Touch
          </Link>
        </div>
      </section>
    </main>
  );
}
