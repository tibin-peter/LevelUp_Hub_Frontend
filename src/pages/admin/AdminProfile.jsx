import React, { useState, useEffect, useRef } from 'react';
import { User, Shield, Key, Save, Camera, Loader2, Lock, Mail, BadgeCheck } from 'lucide-react';
import { getAdminProfile, updateAdminProfile, updateAdminProfileImage, changeAdminPassword } from "../../api/admin.api";
import { uploadToCloudinary } from '../../utils/cloudinary';
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function AdminProfile() {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [profile, setProfile] = useState({
        Name: "",
        Email: "",
        Role: "",
        ProfilePicURL: ""
    });

    const [passwordData, setPasswordData] = useState({
        old_password: "",
        new_password: "",
        conform_password: ""
    });

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await getAdminProfile();
            if (res.success) {
                setProfile({
                    Name: res.data.Name || res.data.name || "",
                    Email: res.data.Email || res.data.email || "",
                    Role: res.data.Role || res.data.role || "",
                    ProfilePicURL: res.data.ProfilePicURL || res.data.profile_pic_url || ""
                });
            }
        } catch (err) {
            toast.error("Security handshake failed. Could not retrieve profile.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const res = await updateAdminProfile({
                name: profile.Name,
                email: profile.Email
            });
            if (res.success) {
                toast.success("Identity protocols updated.");
                setProfile(res.data);
                updateUser({
                    name: res.data.Name,
                    email: res.data.Email
                });
            }
        } catch (err) {
            toast.error("Update sequence aborted by server.");
        } finally {
            setSubmitting(false);
        }
    };

    const fileInputRef = useRef(null);

    const handleUpdateImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setSubmitting(true);
            toast.loading("Uploading identity asset to Cloudinary...", { id: "uploading" });
            
            const url = await uploadToCloudinary(file);
            
            const res = await updateAdminProfileImage({ profile_Pic_url: url });
            if (res.success) {
                toast.success("Visual identity synchronized.", { id: "uploading" });
                setProfile(prev => ({ ...prev, ProfilePicURL: res.data.ProfilePicURL }));
                updateUser({
                    profilePicURL: res.data.ProfilePicURL
                });
            }
        } catch (err) {
            toast.error("Cloudinary upload failed. Check upload_preset.", { id: "uploading" });
        } finally {
            setSubmitting(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.conform_password) {
            toast.error("Credential mismatch: Passwords do not align.");
            return;
        }

        try {
            setSubmitting(true);
            const res = await changeAdminPassword(passwordData);
            if (res.success) {
                toast.success("Security keys rotated successfully.");
                setPasswordData({ old_password: "", new_password: "", conform_password: "" });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update security credentials.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-[#FF9500]" size={42} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Decrypting Profile Assets</p>
        </div>
    );

    const tabs = [
        { id: 'profile', label: 'Admin Identity', icon: User },
        { id: 'security', label: 'Security & Auth', icon: Shield },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-[#262626] tracking-tight">Access Control</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center gap-2">
                        <BadgeCheck size={14} className="text-[#FF9500]" /> Root Level Authorization Matrix
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-10">
                {/* Profile Card */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden p-10 flex flex-col items-center group">
                        <div className="relative">
                            <div className="w-40 h-40 rounded-[48px] overflow-hidden border-8 border-gray-50 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                                {profile.ProfilePicURL ? (
                                    <img src={profile.ProfilePicURL} alt={profile.Name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-5xl font-black text-[#262626]">
                                        {profile.Name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleUpdateImage}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute -bottom-2 -right-2 bg-[#262626] text-white p-4 rounded-2xl shadow-xl border-4 border-white hover:bg-black transition-all hover:scale-110 active:scale-90"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                                </button>
                        </div>
                        <h3 className="mt-8 text-2xl font-black text-[#262626]">{profile.Name}</h3>
                        <p className="text-xs text-gray-400 font-black tracking-[0.1em] uppercase mt-1 px-4 py-1.5 bg-gray-50 rounded-full">{profile.Role}</p>

                        <div className="w-full mt-12 space-y-3">
                            {tabs.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id)}
                                    className={`w-full flex items-center justify-between px-8 py-5 rounded-[24px] transition-all font-black text-[10px] uppercase tracking-widest
                                        ${activeTab === t.id
                                            ? 'bg-[#262626] text-white shadow-2xl shadow-black/20'
                                            : 'text-gray-400 hover:bg-gray-50 active:scale-95'}
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <t.icon size={18} className={activeTab === t.id ? 'text-[#FF9500]' : ''} />
                                        {t.label}
                                    </div>
                                    {activeTab === t.id && <div className="w-2 h-2 rounded-full bg-[#FF9500] animate-pulse"></div>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Forms Area */}
                <div className="col-span-12 lg:col-span-8 bg-white rounded-[48px] border border-gray-100 shadow-sm p-12 overflow-hidden">
                    {activeTab === 'profile' && (
                        <form onSubmit={handleUpdateProfile} className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-black text-[#262626]">Personal Credentials</h3>
                                    <p className="text-gray-400 text-xs font-bold mt-1">Manage your administrative identity and contact data.</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-3 px-8 py-4 bg-[#FF9500] text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-[#e68600] transition-all shadow-xl shadow-orange-100 hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={18} />} Save Changes
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Identity</label>
                                    <div className="relative">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                        <input
                                            type="text"
                                            value={profile.Name}
                                            onChange={(e) => setProfile({ ...profile, Name: e.target.value })}
                                            className="w-full pl-16 pr-8 py-5 rounded-[24px] bg-gray-50/50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9500]/5 font-bold transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Deployment Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                        <input
                                            type="email"
                                            value={profile.Email}
                                            onChange={(e) => setProfile({ ...profile, Email: e.target.value })}
                                            className="w-full pl-16 pr-8 py-5 rounded-[24px] bg-gray-50/50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9500]/5 font-bold transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Assigned Role</label>
                                    <div className="relative opacity-60">
                                        <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                        <input type="text" readOnly value={profile.Role} className="w-full pl-16 pr-8 py-5 rounded-[24px] bg-gray-100 border border-gray-200 font-bold text-gray-500 cursor-not-allowed" />
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}

                    {activeTab === 'security' && (
                        <form onSubmit={handleChangePassword} className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
                            <div>
                                <h3 className="text-2xl font-black text-[#262626]">Security Matrix</h3>
                                <p className="text-gray-400 text-xs font-bold mt-1">Rotate access keys to maintain environment integrity.</p>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Current Protocol Key</label>
                                    <div className="relative">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                        <input
                                            type="password"
                                            placeholder="••••••••••••"
                                            value={passwordData.old_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                            className="w-full pl-16 pr-8 py-5 rounded-[24px] bg-gray-50/50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9500]/5 font-bold transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-50">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">New Security Key</label>
                                        <div className="relative">
                                            <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                            <input
                                                type="password"
                                                placeholder="••••••••••••"
                                                value={passwordData.new_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                                className="w-full pl-16 pr-8 py-5 rounded-[24px] bg-gray-50/50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9500]/5 font-bold transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Confirm New Key</label>
                                        <div className="relative">
                                            <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                            <input
                                                type="password"
                                                placeholder="••••••••••••"
                                                value={passwordData.conform_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, conform_password: e.target.value })}
                                                className="w-full pl-16 pr-8 py-5 rounded-[24px] bg-gray-50/50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9500]/5 font-bold transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-5 bg-[#262626] text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-4 group"
                                >
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} className="text-[#FF9500] group-hover:rotate-12 transition-transform" />} Initiate Key Rotation
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
