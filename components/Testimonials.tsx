"use client";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Software Developer",
      company: "TechCorp India",
      quote:
        "The Advanced Python course completely transformed my career. The hands-on projects and expert mentors made all the difference. I got a 40% salary hike after completing the course!",
      rating: 5,
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      role: "Data Analyst",
      company: "FinEdge Solutions",
      quote:
        "RTR's Excel Masterclass taught me everything I needed to advance in data analysis. The structured curriculum and real-world case studies helped me land my dream job.",
      rating: 5,
    },
    {
      id: 3,
      name: "Ananya Patel",
      role: "Web Developer",
      company: "DigitalWave",
      quote:
        "The Full Stack Web Development program gave me the confidence to build full applications. The career support team helped me with my resume and interview preparation.",
      rating: 4,
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy-700">What Our Students Say</h2>
          <p className="mt-3 text-gray-600">
            Hear from those who transformed their careers with us
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Rating stars */}
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 ${
                      i < testimonial.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.299 4.004 4.401-.627c.916-.132 1.67.739 1.492 1.527l-3.333 2.583 1.299 4.403c.277.921-.778 1.643-1.515 1.157l-3.728-2.41 3.728 2.41c-.737.486-1.792-.236-1.515-1.157l-1.299-4.403-3.333-2.583c-.188-.788.579-1.657 1.492-1.527l4.401.628c.3-.921 1.603-.921 1.902 0l4.401-.627c.916-.132 1.67.739 1.492 1.527l-3.333 2.583 1.299 4.403c.277.921-.778 1.643-1.515 1.157l-3.728-2.41z" />
                  </svg>
                ))}
              </div>

              <blockquote className="text-gray-700 mb-6">
                <p className="italic">"{testimonial.quote}"</p>
              </blockquote>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-teal-600 font-bold text-lg">
                      {testimonial.name[0]}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="font-bold text-navy-700">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}