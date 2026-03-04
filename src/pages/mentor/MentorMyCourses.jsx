import React, { useEffect, useState } from "react";
import { BookCheck, Loader2, ArrowRight, BookOpen, Clock, CalendarPlus } from "lucide-react";
import { getMentorCourses } from "../../api/course.api";
import { Link } from "react-router-dom";
import SlotManagerModal from "../../components/mentor/SlotManagerModal";

export default function MentorMyCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await getMentorCourses();
            if (res.success) {
                setCourses(res.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch my courses", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#171717] tracking-tight">My Mentorship Courses</h1>
                    <p className="text-[#737373] text-lg font-medium">Courses you are currently offering mentorship for.</p>
                </div>
                <Link to="/mentor/explore-courses" className="btn-primary flex items-center gap-2">
                    <ArrowRight size={20} /> Browse More Courses
                </Link>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-[#FF9500]" size={40} />
                </div>
            ) : courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <div key={course.ID} className="card-premium flex flex-col h-full group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300">
                            {/* Image Cover */}
                            <div className="relative h-48 w-full overflow-hidden">
                                <img
                                    src={course.ImageURL || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000"}
                                    alt={course.Title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4">
                                    <div className="bg-white/90 backdrop-blur-md p-2 rounded-full text-green-600 shadow-sm">
                                        <BookCheck size={20} />
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <span className="inline-block px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg border border-white/10">
                                        {course.Category || "General"}
                                    </span>
                                </div>
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

                                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-[#A3A3A3]">
                                        <BookOpen size={14} />
                                        <span>{course.Level || "All Levels"}</span>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setIsSlotModalOpen(true)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-[#FAFAFA] text-[#262626] rounded-lg text-xs font-bold hover:bg-[#262626] hover:text-white transition-all border border-gray-100"
                                    >
                                        <CalendarPlus size={14} /> 
                                        Manage Schedule
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[32px] border border-gray-100 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <BookCheck className="text-gray-300" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-[#171717] mb-2">You haven't added any courses yet</h3>
                    <p className="text-gray-400 max-w-sm mx-auto mb-8 font-medium">Start building your mentorship profile by adding courses you are expert in.</p>
                    <Link to="/mentor/explore-courses" className="btn-primary">
                        Explore Courses
                    </Link>
                </div>
            )}

            {/* Slot Manager Modal */}
            <SlotManagerModal isOpen={isSlotModalOpen} onClose={() => setIsSlotModalOpen(false)} />
        </div>
    );
}
