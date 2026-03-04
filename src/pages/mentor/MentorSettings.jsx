import React, { useState, useEffect, useRef } from "react";
import { User, MessageSquareWarning, Save, Loader2, AlertCircle, CheckCircle2, Send, History, MessageSquare, Camera } from "lucide-react";
import { getMentorProfile, updateMentorProfile } from "../../api/mentor.api";
import { updateUserProfile } from "../../api/user.api";
import { createComplaint, getMyComplaints } from "../../api/complaint.api";
import { uploadToCloudinary } from "../../utils/cloudinary";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

export default function MentorSettings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(false);

  // Profile Form Data
  const [formData, setFormData] = useState({
    Name: "",
    ProfilePicURL: "",
    Bio: "",
    Skills: "",
    Languages: "",
    HourlyPrice: 0,
    ExperienceYears: 0,
  });

  // Complaint Form Data
  const [complaintData, setComplaintData] = useState({
    subject: "",
    description: "",
  });


  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSaving(true);
      const url = await uploadToCloudinary(file);
      
      // Immediately save to DB to prevent vanishing on refresh
      if (user?.id) {
          // 1. Sync User Record
          const userRes = await updateUserProfile(user.id, {
            name: formData.Name,
            profilePicURL: url,
          });
          
          // 2. Sync Mentor Record (since fetchProfile reads from here)
          const mentorRes = await updateMentorProfile({
              ...formData,
              profile_pic_url: url
          });

          if (userRes.success && mentorRes.success) {
            updateUser({ profilePicURL: url });
          }
      }

      setFormData(prev => ({ ...prev, ProfilePicURL: url }));
      toast.success("Profile picture updated permanently.");
    } catch (err) {
      console.error(err);
      toast.error("Cloudinary upload failed.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === "complaints") {
      fetchComplaints();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getMentorProfile();
      if (res.success) {
        const pic = res.data.profile_pic_url || res.data.ProfilePicURL || user?.profilePicURL || user?.profile_pic_url || "";
        setFormData({
          Name: res.data.Name || res.data.name || user?.name || user?.Name || "",
          ProfilePicURL: pic,
          Bio: res.data.Bio || res.data.bio || "",
          Skills: res.data.Skills || res.data.skills || "",
          Languages: res.data.Languages || res.data.languages || "",
          HourlyPrice: res.data.HourlyPrice || res.data.hourly_price || 0,
          ExperienceYears: res.data.ExperienceYears || res.data.experience_years || 0,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "HourlyPrice" || name === "ExperienceYears" ? Number(value) : value,
    }));
  };

  const handleComplaintChange = (e) => {
    const { name, value } = e.target;
    setComplaintData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
          ...formData,
          profile_pic_url: formData.ProfilePicURL
      };

      // 1. Update User Profile (Name & Photo)
      const userRes = await updateUserProfile(user.id, {
        name: formData.Name,
        profilePicURL: formData.ProfilePicURL,
      });

      // 2. Update Mentor Profile (Bio, Skills, etc.)
      const mentorRes = await updateMentorProfile(payload);

      if (userRes.success && mentorRes.success) {
        // Sync global auth state
        updateUser({
          name: formData.Name,
          profilePicURL: formData.ProfilePicURL,
        });
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!complaintData.subject || !complaintData.description) return;

    setIsSubmittingComplaint(true);
    try {
      const res = await createComplaint(complaintData);
      if (res.success) {
        toast.success("Complaint submitted successfully!");
        setComplaintData({ subject: "", description: "" });
        fetchComplaints();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit complaint.");
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#FF9500]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-[#262626]">Settings</h1>
        <p className="text-gray-400 font-medium text-lg">Manage your identity and professional profile.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          <button
            onClick={() => { setActiveTab("profile"); }}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl font-black transition-all duration-300 ${activeTab === "profile"
              ? "bg-white text-[#262626] shadow-xl border border-gray-100"
              : "text-gray-400 hover:text-gray-600"
              }`}
          >
            <User size={20} /> My Profile
          </button>
          <button
            onClick={() => { setActiveTab("complaints"); }}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl font-black transition-all duration-300 ${activeTab === "complaints"
              ? "bg-white text-[#262626] shadow-xl border border-gray-100"
              : "text-gray-400 hover:text-gray-600"
              }`}
          >
            <MessageSquareWarning size={20} /> Support
          </button>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">

          {activeTab === "profile" && (
            <div className="bg-white p-8 md:p-12 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-50/50 animate-in fade-in duration-500">
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center justify-center text-center space-y-6 pb-4">
                  <div className="relative group">
                    <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#FF9500] to-[#ffb347] rounded-[48px] blur-md opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <img
                      src={formData.ProfilePicURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
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
                      disabled={saving}
                      onClick={() => fileInputRef.current.click()}
                      className="absolute -bottom-2 -right-2 bg-[#262626] p-4 rounded-2xl text-white shadow-xl border-4 border-white hover:bg-black transition-transform hover:scale-110 active:scale-95"
                    >
                      {saving ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#262626]">Profile Identity</h3>
                    <p className="text-gray-400 text-sm mt-1">Click the camera icon to update your photo</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Display Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          name="Name"
                          value={formData.Name}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 bg-[#F7F7F8] rounded-2xl border-2 border-transparent outline-none focus:border-[#FF9500]/20 focus:bg-white focus:ring-4 focus:ring-[#FF9500]/5 transition-all font-bold text-[#262626]"
                          placeholder="Your Name"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Profile Image URL</label>
                      <input
                        type="text"
                        name="ProfilePicURL"
                        value={formData.ProfilePicURL}
                        onChange={handleChange}
                        className="w-full px-4 py-4 bg-[#F7F7F8] rounded-2xl border-2 border-transparent outline-none focus:border-[#FF9500]/20 focus:bg-white focus:ring-4 focus:ring-[#FF9500]/5 transition-all font-bold text-[#262626]"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Professional Bio</label>
                    <textarea
                      name="Bio"
                      value={formData.Bio}
                      onChange={handleChange}
                      className="w-full p-5 bg-[#F7F7F8] rounded-2xl border-2 border-transparent outline-none focus:border-[#FF9500]/20 focus:bg-white focus:ring-4 focus:ring-[#FF9500]/5 transition-all h-32 resize-none font-medium text-[#262626]"
                      placeholder="Tell students about your expertise and teaching style..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Skills (Comma separated)</label>
                      <input
                        type="text"
                        name="Skills"
                        value={formData.Skills}
                        onChange={handleChange}
                        className="w-full px-4 py-4 bg-[#F7F7F8] rounded-2xl border-2 border-transparent outline-none focus:border-[#FF9500]/20 focus:bg-white focus:ring-4 focus:ring-[#FF9500]/5 transition-all font-bold text-[#262626]"
                        placeholder="e.g. React, UX Design, Python"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Languages</label>
                      <input
                        type="text"
                        name="Languages"
                        value={formData.Languages}
                        onChange={handleChange}
                        className="w-full px-4 py-4 bg-[#F7F7F8] rounded-2xl border-2 border-transparent outline-none focus:border-[#FF9500]/20 focus:bg-white focus:ring-4 focus:ring-[#FF9500]/5 transition-all font-bold text-[#262626]"
                        placeholder="e.g. English, Spanish"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Hourly Price (₹)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                        <input
                          type="number"
                          name="HourlyPrice"
                          value={formData.HourlyPrice}
                          onChange={handleChange}
                          className="w-full pl-8 pr-4 py-4 bg-[#F7F7F8] rounded-2xl border-2 border-transparent outline-none focus:border-[#FF9500]/20 focus:bg-white focus:ring-4 focus:ring-[#FF9500]/5 transition-all font-bold text-[#262626]"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Experience (Years)</label>
                      <input
                        type="number"
                        name="ExperienceYears"
                        value={formData.ExperienceYears}
                        onChange={handleChange}
                        className="w-full px-4 py-4 bg-[#F7F7F8] rounded-2xl border-2 border-transparent outline-none focus:border-[#FF9500]/20 focus:bg-white focus:ring-4 focus:ring-[#FF9500]/5 transition-all font-bold text-[#262626]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full relative overflow-hidden bg-[#262626] text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
                  >
                    {saving ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
                    {saving ? "Saving Changes..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "complaints" && (
            <div className="bg-white p-8 md:p-12 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-50/50 space-y-12 animate-in fade-in duration-500">
              {/* Complaint Form */}
              <div className="space-y-8">
                <div className="p-6 bg-[#F7F7F8] rounded-3xl border border-gray-100 flex items-start gap-4">
                  <AlertCircle className="text-[#FF9500] shrink-0 mt-1" size={22} />
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    Having trouble with a booking or a student? Let us know. Our
                    dedicated support team will review your report and get back to
                    you as soon as possible.
                  </p>
                </div>

                <form onSubmit={handleComplaintSubmit} className="max-w-md mx-auto space-y-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={complaintData.subject}
                      onChange={handleComplaintChange}
                      className="w-full px-4 py-4 bg-[#F7F7F8] rounded-2xl border-2 border-transparent outline-none focus:border-[#FF9500]/20 focus:bg-white focus:ring-4 focus:ring-[#FF9500]/5 transition-all font-bold text-[#262626]"
                      placeholder="Brief title of the issue"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea
                      name="description"
                      value={complaintData.description}
                      onChange={handleComplaintChange}
                      className="w-full p-5 bg-[#F7F7F8] rounded-2xl border-2 border-transparent outline-none focus:border-[#FF9500]/20 focus:bg-white focus:ring-4 focus:ring-[#FF9500]/5 transition-all h-40 resize-none font-medium text-[#262626]"
                      placeholder="Please provide detailed information about the issue..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingComplaint}
                    className="w-full bg-red-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmittingComplaint ? <Loader2 className="animate-spin" size={22} /> : <Send size={22} />}
                    {isSubmittingComplaint ? "Submitting..." : "Submit Complaint"}
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
                            <span className="font-bold text-[#262626] font-inter">{c.subject}</span>
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
    </div>
  );
}
