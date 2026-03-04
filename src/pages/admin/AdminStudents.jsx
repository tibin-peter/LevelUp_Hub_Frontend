import React, { useState, useEffect } from "react";
import { Search, Filter, UserX, UserCheck, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { getStudents, blockUser, unblockUser } from "../../api/admin.api";
import { toast } from "react-hot-toast";

export default function AdminStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await getStudents();
            if (res.success) {
                setStudents(res.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch students:", err);
            toast.error("Cloud connection failed. Could not load registry.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleToggleBlock = async (student) => {
        const action = student.IsBlocked ? unblockUser : blockUser;
        const actionName = student.IsBlocked ? "unblock" : "block";

        if (!window.confirm(`Are you sure you want to ${actionName} ${student.Name}?`)) return;

        try {
            const res = await action(student.ID);
            if (res.success) {
                toast.success(`User ${student.Name} ${actionName}ed`);
                setStudents(prev => prev.map(s => s.ID === student.ID ? { ...s, IsBlocked: !s.IsBlocked } : s));
            }
        } catch (err) {
            toast.error(`Failed to ${actionName} user`);
        }
    };

    const filteredStudents = students.filter(s =>
        s.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.ID.toString().includes(searchTerm)
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#262626] tracking-tight">Student Registry</h1>
                    <p className="text-gray-400 font-medium mt-1">Manage global user access and maintain platform integrity.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-8 py-5 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-6 group">
                        <div className="w-12 h-12 bg-[#262626] rounded-2xl flex items-center justify-center text-white font-black group-hover:scale-110 transition-transform">
                            {students.length}
                        </div>
                        <div>
                            <span className="block text-2xl font-black text-[#262626] line-height-1 leading-none">{students.filter(s => !s.IsBlocked).length}</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Licenses</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[600px] relative">
                <div className="p-10 border-b border-gray-50 flex flex-col lg:flex-row gap-8 bg-gray-50/20">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF9500] transition-colors" size={22} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, email or secure ID..."
                            className="w-full pl-16 pr-8 py-5 rounded-[24px] bg-white border border-gray-100 focus:border-[#FF9500]/30 focus:ring-4 focus:ring-[#FF9500]/5 transition-all outline-none font-bold text-[#262626] placeholder:text-gray-300"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-3 px-8 py-5 bg-white border border-gray-100 rounded-[24px] text-gray-500 font-bold hover:bg-gray-50 hover:border-gray-200 transition-all group">
                            <Filter size={20} className="group-hover:rotate-180 transition-transform duration-500" /> Advanced Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4">
                            <Loader2 className="animate-spin text-[#FF9500]" size={42} />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Synchronizing Registry</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-50">
                            <AlertCircle size={48} className="text-gray-200" />
                            <p className="font-bold text-gray-400 font-black">No student matches found.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                    <th className="px-10 py-8">User Integrity</th>
                                    <th className="px-10 py-8">Security Status</th>
                                    <th className="px-10 py-8 text-center">Registration</th>
                                    <th className="px-10 py-8 text-right">Administrative</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredStudents.map((student) => (
                                    <tr key={student.ID} className="group hover:bg-gray-50/50 transition-all duration-300">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="relative">
                                                    <img
                                                        src={student.ProfilePicURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.Name)}&background=random`}
                                                        className="w-16 h-16 rounded-[24px] object-cover shadow-sm group-hover:scale-110 transition-transform duration-500 border-2 border-white"
                                                        alt={student.Name}
                                                    />
                                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${!student.IsBlocked ? 'bg-green-500' : 'bg-red-500'} shadow-sm`}></div>
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-lg text-[#262626] group-hover:text-[#FF9500] transition-colors">{student.Name}</h4>
                                                    <p className="text-xs text-gray-400 font-bold tracking-tight lowercase">{student.Email}</p>
                                                    <p className="text-[9px] font-black text-gray-300 uppercase mt-1 tracking-widest">UID: {student.ID}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${!student.IsBlocked ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${!student.IsBlocked ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                                {!student.IsBlocked ? 'Clear / Active' : 'Restricted'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <div className="text-sm font-black text-gray-600">{new Date(student.CreatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                            <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-0.5">Verified Entry</div>
                                        </td>
                                        <td className="px-10 py-8 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleToggleBlock(student)}
                                                    className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all ${!student.IsBlocked ? 'text-red-400 hover:bg-red-50 hover:text-red-600' : 'text-green-500 hover:bg-green-50 hover:text-green-600'} border border-transparent hover:border-current/10`}
                                                    title={!student.IsBlocked ? 'Restrict Access' : 'Restore Access'}
                                                >
                                                    {!student.IsBlocked ? <UserX size={22} /> : <UserCheck size={22} />}
                                                </button>
                                                <button className="w-12 h-12 rounded-[18px] flex items-center justify-center text-gray-300 hover:text-[#262626] hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200" title="Full System Log">
                                                    <BookOpen size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
