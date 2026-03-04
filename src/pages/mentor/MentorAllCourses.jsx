import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Plus, BookOpen, Loader2, CheckCircle2 } from "lucide-react";
import { getAllCourses, addCourseToMentor, getMentorCourses } from "../../api/course.api";
import { toast } from "react-hot-toast";

export default function MentorAllCourses() {
    const [searchParams] = useSearchParams();
    const querySearch = searchParams.get("search") || "";

    const [courses, setCourses] = useState([]);
    const [myCourses, setMyCourses] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState(querySearch);

    useEffect(() => {
        setSearchTerm(querySearch);
    }, [querySearch]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [allRes, myRes] = await Promise.all([
                getAllCourses(),
                getMentorCourses()
            ]);

            if (allRes.success) {
                setCourses(allRes.data || []);
            }

            if (myRes.success) {
                const myIds = new Set((myRes.data || []).map(c => c.ID));
                setMyCourses(myIds);
            }
        } catch (err) {
            console.error("Failed to fetch courses", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourse = async (courseId) => {
        setAddingId(courseId);
        try {
            const res = await addCourseToMentor(courseId);
            if (res.success) {
                setMyCourses(prev => new Set(prev).add(courseId));
            } else {
                toast.error(res.message || "Failed to add course");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error adding course");
        } finally {
            setAddingId(null);
        }
    };

    // Filter courses
    const filteredCourses = courses.filter(course =>
        course.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.Category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#171717] tracking-tight">Explore Courses</h1>
                    <p className="text-[#737373] text-lg font-medium">Browse and add courses to your mentorship profile.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9500]/20 focus:border-[#FF9500] transition-all font-medium"
                    />
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-[#FF9500]" size={40} />
                </div>
            ) : filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map((course) => {
                        const isAdded = myCourses.has(course.ID);

                        return (
                            <div key={course.ID} className="card-premium flex flex-col h-full group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300">
                                {/* Image Cover */}
                                <div className="relative h-48 w-full overflow-hidden">
                                    <img
                                        src={course.ImageURL || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000"}
                                        alt={course.Title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-md text-[#262626] text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                                            {course.Category || "General"}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-extrabold text-[#171717] group-hover:text-[#FF9500] transition-colors line-clamp-2 leading-tight">
                                            {course.Title}
                                        </h3>
                                    </div>

                                    <p className="text-[#737373] text-sm font-medium mb-6 line-clamp-2 flex-1 leading-relaxed">
                                        {course.Description}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-2 text-xs font-bold text-[#A3A3A3]">
                                            <BookOpen size={14} />
                                            <span>{course.Level || "All Levels"}</span>
                                        </div>

                                        {isAdded ? (
                                            <button disabled className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold text-sm cursor-default border border-green-100">
                                                <CheckCircle2 size={16} /> Added
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleAddCourse(course.ID)}
                                                disabled={addingId === course.ID}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-[#262626] text-white rounded-xl font-bold text-sm hover:bg-[#FF9500] hover:shadow-lg hover:shadow-[#FF9500]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                            >
                                                {addingId === course.ID ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                                                Add to Profile
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100">
                    <p className="text-gray-400 font-medium">No courses found matching your search.</p>
                </div>
            )}
        </div>
    );
}
