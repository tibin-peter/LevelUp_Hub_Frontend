import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  User,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ChevronRight,
  History,
  MessageSquare
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { updateUserProfile } from "../../api/user.api";
import { createComplaint, getMyComplaints } from "../../api/complaint.api";
import { uploadToCloudinary } from "../../utils/cloudinary";
import { toast } from "react-hot-toast";

export default function StudentSettings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || "",
    profilePicURL: user?.profilePicURL || user?.profile_pic_url || "https://i.pravatar.cc/150?u=student",
  });

  const [complaint, setComplaint] = useState({ subject: "", description: "" });

  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUpdating(true);
      const url = await uploadToCloudinary(file);
      
      // Immediately save to DB if we have user ID
      const userId = user?.id || user?.ID;
      if (userId) {
        const res = await updateUserProfile(userId, {
            name: profile.name,
            profilePicURL: url,
        });
        if (res.success) {
            updateUser({ profilePicURL: url });
        }
      }
      
      setProfile(prev => ({ ...prev, profilePicURL: url }));
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        profilePicURL: user.profilePicURL || user.profile_pic_url || "https://i.pravatar.cc/150?u=student",
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "complaints") {
      fetchComplaints();
    }
  }, [activeTab]);

  const fetchComplaints = async () => {
    setIsLoadingComplaints(true);
    try {
      const res = await getMyComplaints();
      if (res.success) {
        setComplaints(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
    } finally {
      setIsLoadingComplaints(false);
    }
  };

  const handleUpdateProfile = async () => {
    const userId = user?.id || user?.ID;
    if (!userId) {
      console.error("User ID missing from context", user);
      return;
    }
    setIsUpdating(true);
    try {
      const res = await updateUserProfile(userId, {
        name: profile.name,
        profilePicURL: profile.profilePicURL,
      });

      if (res.success) {
        updateUser({
          name: profile.name,
          profilePicURL: profile.profilePicURL,
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!complaint.subject || !complaint.description) return;

    setIsSubmittingComplaint(true);
    try {
      const res = await createComplaint(complaint);
      if (res.success) {
        setComplaint({ subject: "", description: "" });
        fetchComplaints();
        toast.success("Complaint submitted successfully!");
      }
    } catch (err) {
      console.error("Failed to submit complaint:", err);
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-[#262626]">Account Settings</h1>
        <p className="text-gray-400 font-medium text-lg">
          Manage your identity and report issues.
        </p>
      </header>

      {/* Navigation Pills */}
      <div className="flex bg-gray-100/80 p-1.5 rounded-2xl w-fit border border-gray-100">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === "profile" ? "bg-white text-[#262626] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
        >
          My Profile
        </button>
        <button
          onClick={() => setActiveTab("complaints")}
          className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === "complaints" ? "bg-white text-[#262626] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
        >
          Support
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-50/50 overflow-hidden">
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="p-8 md:p-12 space-y-10 animate-in fade-in duration-500">
            {/* Minimalist Avatar Section */}
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#FF9500] to-[#ffb347] rounded-[48px] blur-md opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <img
                  src={profile.profilePicURL}
                  className="relative w-40 h-40 rounded-[44px] object-cover border-4 border-white shadow-2xl bg-gray-50"
                  alt="Profile"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                />
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => fileInputRef.current.click()}
                  className="absolute -bottom-2 -right-2 bg-[#262626] p-4 rounded-2xl text-white shadow-xl border-4 border-white hover:bg-black transition-transform hover:scale-110 active:scale-95"
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                </button>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#262626]">
                  Profile Identity
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Click the camera icon to update your profile photo
                </p>
              </div>
            </div>

            <div className="max-w-md mx-auto space-y-8">
              {/* Name Input */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Display Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-4 bg-[#F7F7F8] rounded-2xl border-2 border-transparent outline-none focus:border-[#FF9500]/20 focus:bg-white focus:ring-4 focus:ring-[#FF9500]/5 transition-all font-bold text-[#262626]"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button
                  onClick={handleUpdateProfile}
                  disabled={isUpdating}
                  className="w-full relative overflow-hidden bg-[#262626] text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
                >
                  {isUpdating ? (
                    <Loader2 className="animate-spin" size={22} />
                  ) : showSuccess ? (
                    <CheckCircle2 className="text-green-400" size={22} />
                  ) : null}
                  {isUpdating
                    ? "Processing..."
                    : showSuccess
                      ? "Profile Updated"
                      : "Save Changes"}
                </button>

                {showSuccess && (
                  <p className="text-green-600 text-center font-bold text-sm mt-4 animate-in fade-in slide-in-from-top-2">
                    Success! Your changes are now live.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SUPPORT / COMPLAINTS TAB */}
        {activeTab === "complaints" && (
          <div className="p-8 md:p-12 space-y-10 animate-in fade-in duration-500">
            {/* Complaint Form */}
            <div className="space-y-8">
              <div className="p-6 bg-[#F7F7F8] rounded-3xl border border-gray-100 flex items-start gap-4">
                <AlertTriangle
                  className="text-[#FF9500] shrink-0 mt-1"
                  size={22}
                />
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  Having trouble with a booking or a mentor? Let us know. Our
                  dedicated support team will review your report and get back to
                  you as soon as possible.
                </p>
              </div>

              <form
                onSubmit={handleComplaintSubmit}
                className="max-w-md mx-auto space-y-6"
              >
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Issue Category
                  </label>
                  <select
                    required
                    className="w-full p-4 bg-[#F7F7F8] rounded-2xl border-2 border-transparent outline-none focus:border-[#FF9500]/20 focus:bg-white focus:ring-4 focus:ring-[#FF9500]/5 transition-all font-bold text-[#262626]"
                    value={complaint.subject}
                    onChange={(e) =>
                      setComplaint({ ...complaint, subject: e.target.value })
                    }
                  >
                    <option value="">Select category...</option>
                    <option value="Mentor Issue">Mentor Issue</option>
                    <option value="Payment Issue">Payment Issue</option>
                    <option value="Technical Bug">Technical Bug</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Message
                  </label>
                  <textarea
                    required
                    className="w-full p-5 bg-[#F7F7F8] rounded-2xl border-2 border-transparent outline-none focus:border-[#FF9500]/20 focus:bg-white focus:ring-4 focus:ring-[#FF9500]/5 transition-all h-40 resize-none font-medium text-[#262626]"
                    placeholder="Describe your concern..."
                    value={complaint.description}
                    onChange={(e) =>
                      setComplaint({ ...complaint, description: e.target.value })
                    }
                  />
                </div>

                <button
                  disabled={isSubmittingComplaint}
                  className="w-full bg-[#FF9500] text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-[#FF9500]/20 hover:bg-[#e68600] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmittingComplaint ? <Loader2 className="animate-spin" size={20} /> : "Send Report"}
                  {!isSubmittingComplaint && <ChevronRight size={20} />}
                </button>
              </form>
            </div>

            {/* Complaint History */}
            <div className="border-t border-gray-100 pt-10">
              <div className="flex items-center gap-3 mb-6">
                <History className="text-[#262626]" size={22} />
                <h3 className="text-xl font-bold text-[#262626]">My Complaints</h3>
              </div>

              {isLoadingComplaints ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-[#FF9500]" size={32} />
                </div>
              ) : complaints.length > 0 ? (
                <div className="space-y-4">
                  {complaints.map((c) => (
                    <div key={c.ID} className="p-6 bg-white border border-gray-100 rounded-3xl hover:shadow-md transition-shadow group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <MessageSquare size={16} className="text-[#FF9500]" />
                          <span className="font-bold text-[#262626]">{c.subject}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${c.status === 'resolved' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                          }`}>
                          {c.status || 'Pending'}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm font-medium leading-relaxed">{c.description}</p>
                      {c.reply && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Admin Response</p>
                          <p className="text-sm text-[#262626] font-medium">{c.reply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-[#F7F7F8] rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium">No complaints found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

