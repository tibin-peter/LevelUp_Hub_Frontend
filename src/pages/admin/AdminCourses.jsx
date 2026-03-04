import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Filter, BookOpen, User, Calendar, Trash2, Edit3, Shield, Star, Loader2, X, Image as ImageIcon, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import { getCourses, getCourseCount, createCourse, updateCourse, deleteCourse, getAdminDashboardStats } from "../../api/admin.api";
import { uploadToCloudinary } from '../../utils/cloudinary';
import { toast } from "react-hot-toast";

export default function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [totalCourses, setTotalCourses] = useState(0);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ published: 0, enrollment: "1,460", hours: "12.5k" });

    // Filter & Search State
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [level, setLevel] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCourse, setCurrentCourse] = useState({
        Title: "",
        Description: "",
        Category: "",
        Level: "Beginner",
        ImageURL: "",
        IsActive: true
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getCourses({
                search,
                category,
                level,
                page,
                limit
            });
            if (res.success) {
                setCourses(res.data.items || []);
                setTotalCourses(res.data.total || 0);
            }

            const countRes = await getCourseCount();
            if (countRes.success) {
                // Fetch full stats for enrollment and hours estimation
                const dashRes = await getAdminDashboardStats("year");
                const enrollment = dashRes.success ? dashRes.data.total_enrollments : 0;
                setStats({ 
                    published: countRes.data, 
                    enrollment: enrollment.toLocaleString(),
                    hours: (enrollment * 1.5).toFixed(1) + "k" // Heuristic estimation
                });
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to sync with curriculum database.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, category, level, page]);

    const handleDelete = async (id) => {
        if (!window.confirm("Verify Authorization: Are you certain you want to decommission this program?")) return;
        try {
            const res = await deleteCourse(id);
            if (res.success) {
                toast.success("Program decommissioned successfully.");
                fetchData();
            }
        } catch (err) {
            toast.error("Decommissioning sequence failed.");
        }
    };

    const handleOpenModal = (course = null) => {
        if (course) {
            setCurrentCourse(course);
            setIsEditing(true);
        } else {
            setCurrentCourse({
                Title: "",
                Description: "",
                Category: "",
                Level: "Beginner",
                ImageURL: "",
                IsActive: true
            });
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentCourse.Title || !currentCourse.Category) {
            toast.error("Title and Category are mandatory protocols.");
            return;
        }

        try {
            setSubmitting(true);
            let res;
            if (isEditing) {
                res = await updateCourse(currentCourse.ID, currentCourse);
            } else {
                res = await createCourse(currentCourse);
            }

            if (res.success) {
                toast.success(`Program ${isEditing ? 'recalibrated' : 'initialized'} successfully.`);
                setIsModalOpen(false);
                fetchData();
            }
        } catch (err) {
            toast.error("Sync operation failed.");
        } finally {
            setSubmitting(false);
        }
    };

    const courseImageRef = useRef(null);

    const handleCourseImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setSubmitting(true);
            toast.loading("Uploading course asset to Cloudinary...", { id: "course-upload" });
            const url = await uploadToCloudinary(file);
            setCurrentCourse(prev => ({ ...prev, ImageURL: url }));
            toast.success("Asset synchronized successfully.", { id: "course-upload" });
        } catch (err) {
            toast.error("Upload failed. Verify Cloudinary configuration.", { id: "course-upload" });
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (course) => {
        try {
            const res = await updateCourse(course.ID, { ...course, IsActive: !course.IsActive });
            if (res.success) {
                toast.success(`Status revised: ${!course.IsActive ? 'Active' : 'Archived'}`);
                setCourses(prev => prev.map(c => c.ID === course.ID ? { ...c, IsActive: !c.IsActive } : c));
            }
        } catch (err) {
            toast.error("Status update failed.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#262626] tracking-tight">Curriculum Governance</h1>
                    <p className="text-gray-400 font-medium mt-1">Audit, deploy, and monitor instructional assets across the ecosystem.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-3 px-10 py-5 bg-[#262626] text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> Initialize Program
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Published Programs", value: stats.published, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Active Enrolments", value: stats.enrollment, icon: User, color: "text-orange-500", bg: "bg-orange-50" },
                    { label: "Learning Hours", value: stats.hours, icon: Calendar, color: "text-green-500", bg: "bg-green-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all duration-500 border-b-4 border-b-transparent hover:border-b-current">
                        <div className={`${stat.bg} w-16 h-16 rounded-3xl flex items-center justify-center transition-transform group-hover:rotate-12`}>
                            <stat.icon size={28} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                            <h4 className="text-3xl font-black text-[#262626] tracking-tight">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                {/* Search & Filter Bar */}
                <div className="p-8 border-b border-gray-50 flex flex-col lg:flex-row gap-6 bg-gray-50/20">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF9500] transition-colors" size={22} />
                        <input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Scan by title, category, or secure handle..."
                            className="w-full pl-16 pr-8 py-5 rounded-[24px] bg-white border border-gray-100 font-bold text-[#262626] outline-none focus:ring-4 focus:ring-[#FF9500]/5 hover:border-gray-200 transition-all placeholder:text-gray-300"
                        />
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <select
                            value={category}
                            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                            className="px-6 py-4 bg-white border border-gray-100 rounded-[22px] text-gray-500 font-bold text-sm outline-none focus:ring-4 focus:ring-gray-100 cursor-pointer"
                        >
                            <option value="">All Disciplines</option>
                            <option value="Development">Development</option>
                            <option value="Design">Design</option>
                            <option value="Business">Business</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Data Science">Data Science</option>
                        </select>
                        <select
                            value={level}
                            onChange={(e) => { setLevel(e.target.value); setPage(1); }}
                            className="px-6 py-4 bg-white border border-gray-100 rounded-[22px] text-gray-500 font-bold text-sm outline-none focus:ring-4 focus:ring-gray-100 cursor-pointer"
                        >
                            <option value="">Expertise Tier</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
                                <th className="px-10 py-8">Program Identity</th>
                                <th className="px-10 py-8">Classification</th>
                                <th className="px-10 py-8">Clearance</th>
                                <th className="px-10 py-8 text-center">Deployment Date</th>
                                <th className="px-10 py-8 text-right">Operational Interface</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="animate-spin text-[#FF9500]" size={42} />
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Synchronizing Infrastructure</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : courses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Shield size={48} className="text-gray-300" />
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No active modules detected</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                courses.map(course => (
                                    <tr key={course.ID} className="group hover:bg-gray-50/50 transition-all">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-[22px] overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 group-hover:scale-110 transition-transform duration-500 relative">
                                                    {course.ImageURL ? (
                                                        <img src={course.ImageURL} alt={course.Title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                            <BookOpen size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="max-w-[300px]">
                                                    <h4 className="font-black text-[#262626] text-lg leading-tight truncate">{course.Title}</h4>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Ref: #PROG-{course.ID}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-2">
                                                <span className="px-3 py-1 bg-gray-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-500 inline-block w-fit">{course.Category}</span>
                                                <span className="px-3 py-1 bg-[#262626] rounded-lg text-[9px] font-black uppercase tracking-widest text-white inline-block w-fit">{course.Level}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <button
                                                onClick={() => toggleStatus(course)}
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${course.IsActive ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${course.IsActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                                <span className="text-[9px] font-black uppercase tracking-widest">{course.IsActive ? 'Authorized' : 'Archived'}</span>
                                            </button>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <div className="text-sm font-black text-[#262626]">{new Date(course.CreatedAt).toLocaleDateString()}</div>
                                            <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-0.5">Deployment</div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => handleOpenModal(course)}
                                                    className="w-12 h-12 rounded-[18px] bg-white border border-gray-100 flex items-center justify-center text-gray-300 hover:text-[#262626] hover:border-gray-200 transition-all"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(course.ID)}
                                                    className="w-12 h-12 rounded-[18px] bg-white border border-gray-100 flex items-center justify-center text-gray-300 hover:text-red-500 hover:border-red-100 transition-all font-bold"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-8 border-t border-gray-50 flex items-center justify-between bg-gray-50/10">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Showing {courses.length} of {totalCourses} Registry entries
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-[#262626] disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            disabled={page * limit >= totalCourses}
                            onClick={() => setPage(p => p + 1)}
                            className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-[#262626] disabled:opacity-30 transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Program Initialization Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#262626]/60 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                            <div>
                                <h3 className="text-2xl font-black text-[#262626] tracking-tight">{isEditing ? 'Protocol Revision' : 'Initialize Program'}</h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{isEditing ? 'Modify existing curriculum parameters' : 'Define new instructional asset'}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-4 rounded-[22px] bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Program Designation</label>
                                        <input
                                            value={currentCourse.Title}
                                            onChange={(e) => setCurrentCourse({ ...currentCourse, Title: e.target.value })}
                                            placeholder="e.g. Neural Network Mastery"
                                            className="w-full px-6 py-4 rounded-[22px] border border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9500]/5 font-bold transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Discipline</label>
                                        <select
                                            value={currentCourse.Category}
                                            onChange={(e) => setCurrentCourse({ ...currentCourse, Category: e.target.value })}
                                            className="w-full px-6 py-4 rounded-[22px] border border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9500]/5 font-bold transition-all cursor-pointer appearance-none"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Development">Development</option>
                                            <option value="Design">Design</option>
                                            <option value="Business">Business</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Data Science">Data Science</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Experience Level</label>
                                        <div className="flex gap-2">
                                            {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                                                <button
                                                    key={lvl}
                                                    type="button"
                                                    onClick={() => setCurrentCourse({ ...currentCourse, Level: lvl })}
                                                    className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${currentCourse.Level === lvl ? 'bg-[#262626] text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                                >
                                                    {lvl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Status Configuration</label>
                                        <div className="flex items-center gap-4 px-6 py-3 bg-gray-50/50 rounded-[22px] border border-gray-100">
                                            <button
                                                type="button"
                                                onClick={() => setCurrentCourse({ ...currentCourse, IsActive: !currentCourse.IsActive })}
                                                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${currentCourse.IsActive ? 'bg-[#FF9500]' : 'bg-gray-200'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${currentCourse.IsActive ? 'left-7' : 'left-1'}`}></div>
                                            </button>
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">{currentCourse.IsActive ? 'Ready for Deployment' : 'Draft Mode'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Operational Summary</label>
                                    <textarea
                                        value={currentCourse.Description}
                                        onChange={(e) => setCurrentCourse({ ...currentCourse, Description: e.target.value })}
                                        placeholder="Detailed curriculum breakdown and learning objectives..."
                                        rows="4"
                                        className="w-full px-6 py-4 rounded-[22px] border border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9500]/5 font-bold transition-all resize-none"
                                    ></textarea>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Visual Program Asset</label>
                                    <div className="flex items-center gap-6 p-6 bg-gray-50/50 rounded-[32px] border border-gray-100 group">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border border-gray-100 flex-shrink-0 shadow-sm relative">
                                            {currentCourse.ImageURL ? (
                                                <img src={currentCourse.ImageURL} className="w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                    <ImageIcon size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">Upload a high-resolution identity asset for this program (JPEG, PNG, WEBP).</p>
                                            <div className="flex gap-3">
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    ref={courseImageRef}
                                                    onChange={handleCourseImageUpload}
                                                    accept="image/*"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={submitting}
                                                    onClick={() => courseImageRef.current.click()}
                                                    className="px-6 py-3 bg-[#262626] text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 group-hover:scale-105 active:scale-95 disabled:opacity-50"
                                                >
                                                    {submitting ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} 
                                                    {isEditing ? 'REPLACE ASSET' : 'UPLOAD ASSET'}
                                                </button>
                                                {currentCourse.ImageURL && (
                                                     <button
                                                         type="button"
                                                         onClick={() => setCurrentCourse({ ...currentCourse, ImageURL: "" })}
                                                         className="px-6 py-3 text-red-500 font-black text-[9px] uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all"
                                                     >
                                                         Clear
                                                     </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-5 rounded-[24px] border border-gray-100 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] py-5 rounded-[24px] bg-[#262626] text-[#FF9500] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : (isEditing ? <CheckCircle2 size={18} /> : <Shield size={18} />)}
                                    {isEditing ? 'Authorize Changes' : 'Finalize Initialisation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
