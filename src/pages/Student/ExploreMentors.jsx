import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Star, Heart, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { addFavorite, removeFavorite, getMyFavorites } from '../../api/favorite.api';

export default function ExploreMentors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const querySearch = searchParams.get("search") || "";

  const [mentors, setMentors] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(querySearch);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    return `${apiBase}/${url}`;
  };

  useEffect(() => {
    setSearchTerm(querySearch);
  }, [querySearch]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [mentorsRes, favsRes] = await Promise.all([
          api.get("/mentors"),
          getMyFavorites()
        ]);

        if (mentorsRes.data.success) {
          setMentors(mentorsRes.data.data || []);
        }

        if (favsRes.success && favsRes.data) {
          setFavorites(new Set(favsRes.data.map(f => f.mentor_profile_id)));
        }
      } catch (err) {
        console.error("Failed to fetch discovery data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleFavorite = async (mentorId) => {
    try {
      if (favorites.has(mentorId)) {
        await removeFavorite(mentorId);
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(mentorId);
          return next;
        });
      } else {
        await addFavorite(mentorId);
        setFavorites(prev => new Set(prev).add(mentorId));
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
    }
  };

  const filteredMentors = mentors.filter(m =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#171717] tracking-tight">Find your Mentor</h1>
          <p className="text-[#737373] text-base md:text-lg font-medium mt-1">Discover experts to help you achieve your goals.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A3A3A3] group-focus-within:text-[#FF9500] transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-3.5 md:py-4.5 bg-white border border-[#F0F0F0] rounded-[24px] outline-none focus:ring-4 focus:ring-[#FF9500]/5 focus:border-[#FF9500]/20 shadow-sm transition-all text-[#171717] font-medium text-sm md:text-base"
          />
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-[#FF9500]" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMentors.map((mentor) => (
            <div key={mentor.id} className="bg-white rounded-[40px] p-7 border border-[#F5F5F5] shadow-sm hover:shadow-2xl transition-all group relative">
              <button
                onClick={() => toggleFavorite(mentor.id)}
                className={`absolute top-10 right-10 z-10 p-3 rounded-2xl backdrop-blur-md transition-all active:scale-90 ${favorites.has(mentor.id)
                  ? "bg-[#FEF2F2] text-[#EF4444] shadow-md"
                  : "bg-black/10 text-white hover:bg-black/20"
                  }`}
              >
                <Heart size={20} fill={favorites.has(mentor.id) ? "currentColor" : "none"} strokeWidth={2.5} />
              </button>

              <div className="relative mb-6">
                <img
                  src={getImageUrl(mentor.profile_pic_url || mentor.profilePicURL) || `https://ui-avatars.com/api/?name=${mentor.name}&background=262626&color=fff`}
                  className="w-full h-64 object-cover rounded-[32px] group-hover:scale-[1.02] transition-transform duration-500"
                  alt={mentor.name}
                />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
                  <Star size={16} className="text-[#FF9500] fill-[#FF9500]" />
                  <span className="text-sm font-black text-[#171717]">{mentor.rating_avg || "0.0"}</span>
                </div>
              </div>

              <div className="px-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-bold text-[#171717] transition-colors">{mentor.name}</h3>
                </div>
                <p className="text-[#737373] text-sm font-bold uppercase tracking-wider mb-5">{mentor.category || "General Expert"}</p>

                <div className="flex flex-row items-center justify-between border-t border-[#F5F5F5] pt-5 md:pt-7 mt-4 gap-2">
                  <div className="shrink-0">
                    <span className="text-xl md:text-3xl font-black text-[#171717]">₹{mentor.hourly_price}</span>
                    <span className="text-[#A3A3A3] text-[10px] md:text-sm font-bold tracking-tight"> / hr</span>
                  </div>
                  <Link
                    to={`/dashboard/mentordetails/${mentor.id}`}
                    className="bg-[#262626] text-white px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-base font-bold hover:bg-[#FF9500] transition-all shadow-lg shadow-black/5 active:scale-95 whitespace-nowrap"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
