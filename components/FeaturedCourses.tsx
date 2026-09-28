async function getCourses() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/courses`, {
      next: { revalidate: 60 }, // cache for 60 seconds
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.courses || [];
  } catch {
    return [];
  }
}

export default async function FeaturedCourses() {
  const courses = await getCourses();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy-700">
            Featured Courses
          </h2>
          <p className="mt-3 text-gray-600">
            Explore our most popular training programs
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No courses available at the moment. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course: any) => (
              <div
                key={course._id}
                className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              >
                {/* Course thumbnail */}
                <div className="h-48 bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {course.category}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-navy-700">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-gray-600 text-sm line-clamp-2">
                    {course.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold text-teal-600">
                      ${course.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      {course.duration}
                    </span>
                  </div>

                  <div className="mt-4">
                    <a
                      href={`/courses/${course._id}`}
                      className="inline-block px-4 py-2 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition-colors text-sm"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <a
            href="/courses"
            className="inline-block px-6 py-3 border-2 border-navy-700 text-navy-700 font-semibold rounded-lg hover:bg-navy-700 hover:text-white transition-colors"
          >
            View All Courses
          </a>
        </div>
      </div>
    </section>
  );
}