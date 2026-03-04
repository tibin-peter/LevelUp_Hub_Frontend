import React, { useState, useEffect } from 'react';
import { Users, Clock, BarChart, ArrowUpRight, Search, Filter, Loader2 } from 'lucide-react';
import { getAllCourses } from "../../api/course.api";
import { useNavigate } from 'react-router-dom';
import Footer from "../../components/common/Footer";

export default function CourseGrid() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await getAllCourses();
        if (res.success && res.data) {
          setCourses(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // Extract unique categories
  const categories = ["All", ...new Set(courses.map(c => c.Category))];

  // Client-side Filter
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.Title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.Category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#F7F7F8] min-h-screen">
      <div className="max-w-7xl mx-auto py-24 px-6 lg:px-16">

        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black text-[#262626] tracking-tight mb-6">
              Explore Available <span className="text-[#FF9500]">Courses</span>
            </h1>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full pl-12 pr-6 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-[#FF9500]/20 outline-none font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 max-w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                    ? "bg-[#262626] text-white shadow-lg"
                    : "bg-white text-gray-500 hover:bg-gray-100"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#FF9500]" size={40} />
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div key={course.ID} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col group hover:shadow-xl hover:shadow-gray-200 transition-all duration-300">

                {/* Image Section */}
                <div className="relative overflow-hidden rounded-[24px] mb-6 aspect-[4/3]">
                  <img
                    src={course.ImageURL || "https://via.placeholder.com/600x400"}
                    alt={course.Title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-gray-800 border border-gray-100">
                    {course.Category}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-400">
                    <BarChart size={16} /> {course.Level}
                  </div>

                  <h3 className="text-xl font-bold text-[#262626] mb-3 group-hover:text-[#FF9500] transition-colors line-clamp-2">
                    {course.Title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                    {course.Description}
                  </p>
                </div>

                {/* Button Action */}
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-4 bg-[#F7F7F8] text-[#262626] font-bold rounded-xl group-hover:bg-[#FF9500] group-hover:text-white transition-all flex items-center justify-center gap-2 mt-auto"
                >
                  Join Course <ArrowUpRight size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 font-medium">No courses found matching your criteria.</p>
            <button
              onClick={() => { setSearchTerm(""); setSelectedCategory("All") }}
              className="mt-4 text-[#FF9500] font-bold hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}