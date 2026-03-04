import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Clock, Tag, AlertCircle, BookOpen } from "lucide-react";
import api from "../../api/axios";

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Based on your info: baseUrl + /api/courses
        const response = await api.get("/courses");

        // Your JSON structure: response.data.data is the array
        if (response.data.success) {
          setCourses(response.data.data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Unable to load courses. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter logic - matching PascalCase "Title" and "Category"
  const filteredCourses = courses.filter(
    (course) =>
      course.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.Category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#262626] tracking-tight">
            Available Courses
          </h1>
          <p className="text-gray-500 text-sm md:text-base font-medium mt-1">
            Upgrade your skills with our curated curriculum.
          </p>
        </div>

        <div className="relative w-full lg:w-96 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF9500] transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm outline-none focus:ring-4 focus:ring-[#FF9500]/10 focus:border-[#FF9500] transition-all text-sm"
          />
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-[30px] flex items-center gap-3">
          <AlertCircle size={22} />
          <span className="font-bold">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-[40px] border border-gray-50 h-96 animate-pulse"
            >
              <div className="h-48 bg-gray-100 rounded-[30px] mb-6" />
              <div className="h-6 bg-gray-100 rounded-full w-3/4 mb-4" />
              <div className="h-4 bg-gray-100 rounded-full w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <Link
                to={`/dashboard/course/${course.ID}`}
                key={course.ID}
                className="group"
              >
                <div className="bg-white p-5 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-[#FF9500]/5 hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                  {/* Category Badge & Course Image */}
                  <div className="h-52 rounded-[30px] overflow-hidden mb-6 relative bg-gray-100 flex items-center justify-center">
                    <img
                      src={course.ImageURL || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000"}
                      alt={course.Title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] text-[#FF9500] shadow-sm">
                      {course.Category}
                    </div>
                  </div>

                  <div className="px-2 flex-1 flex flex-col">
                    <h3 className="text-2xl font-black text-[#262626] mb-3 leading-tight group-hover:text-[#FF9500] transition-colors line-clamp-2">
                      {course.Title}
                    </h3>

                    <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-6">
                      {course.Description}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-5 border-t border-gray-50">
                      <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                        <Tag size={14} className="text-[#FF9500]" />
                        {course.Level}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#FF9500] group-hover:text-white transition-colors">
                        <Search size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-24 text-center bg-white rounded-[50px] border-2 border-dashed border-gray-100">
              <h3 className="text-xl font-bold text-gray-400">
                No courses found matching your search.
              </h3>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-[#FF9500] font-black hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
