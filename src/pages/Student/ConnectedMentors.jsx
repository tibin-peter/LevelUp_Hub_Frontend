import React, { useEffect, useState } from 'react';
import { getMyMentors } from '../../api/connections.api';
import { addFavorite, removeFavorite, getMyFavorites } from '../../api/favorite.api';
import { Star, MessageCircle, Heart, Users, Loader2, History } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { startConversation } from '../../api/chat.api';
import { toast } from 'react-hot-toast';

export default function ConnectedMentors() {
    const navigate = useNavigate();
    const [mentors, setMentors] = useState([]);
    const [favorites, setFavoriteIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('history'); // 'history' or 'favorites'

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
        return `${apiBase}/${url}`;
    };

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [mentorsRes, favsRes] = await Promise.all([
                    activeTab === 'history' ? getMyMentors() : getMyFavorites(),
                    getMyFavorites()
                ]);

                if (mentorsRes.success) {
                    setMentors(mentorsRes.data || []);
                }

                if (favsRes.success && favsRes.data) {
                    setFavoriteIds(new Set(favsRes.data.map(f => f.mentor_profile_id)));
                }
            } catch (err) {
                console.error("Failed to fetch mentors data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [activeTab]);

    const toggleFavorite = async (mentorId) => {
        try {
            if (favorites.has(mentorId)) {
                await removeFavorite(mentorId);
                setFavoriteIds(prev => {
                    const next = new Set(prev);
                    next.delete(mentorId);
                    return next;
                });
                if (activeTab === 'favorites') {
                    setMentors(prev => prev.filter(m => m.mentor_profile_id !== mentorId));
                }
            } else {
                await addFavorite(mentorId);
                setFavoriteIds(prev => new Set(prev).add(mentorId));
            }
        } catch (err) {
            console.error("Favorite toggle failed:", err);
        }
    };

    const handleMessage = async (mentorUserId) => {
        if (!mentorUserId) {
            toast.error("Mentor information missing.");
            return;
        }
        try {
            const res = await startConversation(mentorUserId);
            if (res.conversation_id) {
                navigate("/dashboard/messages", { state: { conversation_id: res.conversation_id } });
            }
        } catch (err) {
            console.error("Failed to start conversation:", err);
            toast.error("Unable to open chat.");
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#171717] tracking-tight">My Mentors</h1>
                    <p className="text-[#737373] text-lg font-medium">Manage your learning network and favorites.</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 p-1.5 bg-[#F5F5F5] rounded-2xl w-fit border border-[#F0F0F0]">
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'history'
                            ? "bg-white text-[#262626] shadow-sm"
                            : "text-[#737373] hover:text-[#262626]"
                            }`}
                    >
                        <History size={18} />
                        History
                    </button>
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'favorites'
                            ? "bg-white text-[#262626] shadow-sm"
                            : "text-[#737373] hover:text-[#262626]"
                            }`}
                    >
                        <Heart size={18} fill={activeTab === 'favorites' ? "currentColor" : "none"} />
                        Favorites
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="animate-spin text-[#FF9500]" size={40} />
                </div>
            ) : mentors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mentors.map((mentor) => (
                        <div key={mentor.mentor_profile_id} className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                            <button
                                onClick={() => toggleFavorite(mentor.mentor_profile_id)}
                                className={`absolute top-8 right-8 z-10 p-3 rounded-2xl backdrop-blur-md transition-all active:scale-90 ${favorites.has(mentor.mentor_profile_id)
                                    ? "bg-[#FEF2F2] text-[#EF4444] shadow-md border border-[#FEE2E2]"
                                    : "bg-[#FAFAFA] text-[#A3A3A3] hover:bg-[#F5F5F5] border border-[#F0F0F0]"
                                    }`}
                            >
                                <Heart size={20} fill={favorites.has(mentor.mentor_profile_id) ? "currentColor" : "none"} strokeWidth={2.5} />
                            </button>

                            <div className="relative mb-6">
                                <img
                                    src={getImageUrl(mentor.profile_pic_url || mentor.profilePicURL) || `https://ui-avatars.com/api/?name=${mentor.name}&background=262626&color=fff`}
                                    className="w-24 h-24 object-cover rounded-[30px] shadow-lg group-hover:scale-105 transition-transform duration-500"
                                    alt={mentor.name}
                                />
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-2xl font-bold text-[#171717] group-hover:text-[#FF9500] transition-colors">{mentor.name}</h3>
                                <p className="text-[#737373] font-semibold text-sm uppercase tracking-wider">{mentor.category || "General Mentorship"}</p>
                            </div>

                            <div className="flex items-center gap-3 mt-6 mb-8">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F9FAFB] rounded-xl border border-[#F0F0F0]">
                                    <Star size={14} className="text-[#FF9500] fill-[#FF9500]" />
                                    <span className="text-xs font-bold text-[#171717]">{mentor.rating_avg || "5.0"}</span>
                                </div>
                                <div className="px-3 py-1.5 bg-[#F9FAFB] rounded-xl border border-[#F0F0F0]">
                                    <span className="text-xs font-bold text-[#171717]">₹{mentor.hourly_price}/hr</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Link
                                    to={`/dashboard/mentordetails/${mentor.mentor_profile_id}`}
                                    className="bg-[#262626] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#171717] transition-all text-center shadow-lg shadow-black/5"
                                >
                                    Book Again
                                </Link>
                                <button
                                    onClick={() => handleMessage(mentor.mentor_user_id || mentor.MentorUserID)}
                                    className="bg-[#FAFAFA] text-[#262626] py-4 rounded-2xl font-bold text-sm hover:bg-[#F5F5F5] transition-all text-center border border-[#F0F0F0]"
                                >
                                    Message
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center card-premium">
                    <div className="w-24 h-24 bg-[#FAFAFA] rounded-full flex items-center justify-center mb-6">
                        <Users className="text-[#D4D4D4]" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-[#171717] mb-3">
                        {activeTab === 'history' ? "No connections yet" : "No favorites yet"}
                    </h3>
                    <p className="text-[#737373] max-w-sm mx-auto mb-8 font-medium">
                        {activeTab === 'history'
                            ? "Connect with mentors to level up your skills. Start by exploring our community!"
                            : "Save mentors you like by clicking the heart icon to find them easily later."}
                    </p>
                    <Link to="/dashboard/mentors" className="btn-primary px-10 py-4 text-lg">
                        Find a Mentor
                    </Link>
                </div>
            )}
        </div>
    );
}
