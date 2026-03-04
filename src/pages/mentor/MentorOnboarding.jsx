import React, { useState, useRef } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  DollarSign,
  CheckCircle,
  Briefcase,
  Languages,
  Award,
  Link as LinkIcon,
  FileText,
  X,
  Plus,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createMentorProfile, updateMentorProfile } from "../../api/mentor.api";
import { uploadToCloudinary } from "../../utils/cloudinary";
import { toast } from "react-hot-toast";

export default function MentorOnboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const fileInputRef = useRef(null);

  // --- State Management ---
  const [formData, setFormData] = useState({
    bio: "",
    category: "", // Manually typed
    sub_category: "", // Manually typed
    skills: [],
    languages: [],
    price: "",
    experience: 1,
    linkedin: "",
    documents: "",
  });

  const [customSkill, setCustomSkill] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  // --- Logic Helpers ---
  const updateData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleItem = (field, item) => {
    const current = formData[field];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    updateData(field, updated);
  };

  const addCustomSkill = (e) => {
    if (
      (e.key === "Enter" || e.type === "click") &&
      customSkill.trim() !== ""
    ) {
      e.preventDefault();
      if (!formData.skills.includes(customSkill.trim())) {
        updateData("skills", [...formData.skills, customSkill.trim()]);
      }
      setCustomSkill("");
    }
  };

  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUploading(true);
        setSelectedFileName(`Uploading: ${file.name}...`);
        const url = await uploadToCloudinary(file);
        setSelectedFileName(file.name);
        updateData("documents", url);
      } catch (err) {
        console.error(err);
        setSelectedFileName("Upload failed. Try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleFinalSubmit = async () => {
    try {
      const apiPayload = {
        bio: formData.bio,
        category: formData.category,
        sub_category: formData.sub_category,
        skills: formData.skills.join(", "),
        languages: formData.languages.join(", "),
        hourly_price: parseFloat(formData.price) || 0,
        experience_years: parseInt(formData.experience) || 0,
        linkedin_url: formData.linkedin,
        documents: formData.documents,
      };

      try {
        await createMentorProfile(apiPayload);
      } catch (err) {
        await updateMentorProfile(apiPayload);
      }

      updateUser({ status: "pending", role: "mentor" });
      navigate("/mentor/pending");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save profile.");
    }
  };

  // Pre-defined suggestions (user can still add their own)
  const languageOptions = ["English", "Malayalam", "Hindi", "Spanish"];
  const quickSkillSuggestions = ["Go", "React", "Node.js", "Python"];

  return (
    <div className="min-h-screen bg-[#F7F7F8] py-12 px-6 font-sans text-[#262626]">
      <div className="max-w-2xl mx-auto">
        {/* Step Indicator */}
        <div className="flex gap-3 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${s <= step ? "bg-[#FF9500]" : "bg-gray-200"}`}
              />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10 md:p-14">
          <header className="mb-10">
            <h1 className="text-4xl font-black tracking-tight mb-2">
              {step === 1 && "Professional Info"}
              {step === 2 && "Expertise & Skills"}
              {step === 3 && "Verification"}
            </h1>
            <p className="text-gray-400 font-medium">Step {step} of 3</p>
          </header>

          {/* Step 1: Basic Info & Category */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-400 ml-1">
                    Main Category
                  </label>
                  <input
                    placeholder="e.g. Technology"
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#FF9500]/20 font-bold"
                    onChange={(e) => updateData("category", e.target.value)}
                    value={formData.category}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-400 ml-1">
                    Sub Category
                  </label>
                  <input
                    placeholder="e.g. Backend Development"
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#FF9500]/20 font-bold"
                    onChange={(e) => updateData("sub_category", e.target.value)}
                    value={formData.sub_category}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-400 ml-1">
                  Bio
                </label>
                <textarea
                  placeholder="Share your experience and mentoring style..."
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#FF9500]/20 font-medium min-h-[120px] resize-none"
                  onChange={(e) => updateData("bio", e.target.value)}
                  value={formData.bio}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-400 ml-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold"
                  value={formData.experience}
                  onChange={(e) => updateData("experience", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Custom Skills & Languages */}
          {step === 2 && (
            <div className="space-y-8">
              {/* Skills Section */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase text-gray-400 ml-1">
                  Skills & Expertise
                </label>

                {/* Custom Skill Input */}
                <div className="flex gap-2">
                  <input
                    placeholder="Type a skill and press Enter"
                    className="flex-1 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#FF9500]/20 font-bold"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyDown={addCustomSkill}
                  />
                  <button
                    onClick={addCustomSkill}
                    className="p-4 bg-[#262626] text-white rounded-2xl hover:bg-black transition-colors"
                  >
                    <Plus size={24} />
                  </button>
                </div>

                {/* Skill Tags Display */}
                <div className="flex flex-wrap gap-2 min-h-[50px] p-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-2 bg-[#262626] text-white px-4 py-2 rounded-xl text-sm font-bold animate-in zoom-in-95"
                    >
                      {skill}
                      <X
                        size={14}
                        className="cursor-pointer hover:text-[#FF9500]"
                        onClick={() => toggleItem("skills", skill)}
                      />
                    </span>
                  ))}
                  {formData.skills.length === 0 && (
                    <p className="text-gray-300 text-sm italic">
                      No skills added yet...
                    </p>
                  )}
                </div>
              </div>

              {/* Languages Section */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase text-gray-400 ml-1">
                  Languages
                </label>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => toggleItem("languages", lang)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        formData.languages.includes(lang)
                          ? "bg-[#FF9500] text-white border-[#FF9500]"
                          : "bg-white text-gray-400 border-gray-200"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-400 ml-1">
                  Hourly Price (INR)
                </label>
                <div className="flex items-center bg-gray-50 p-4 rounded-2xl">
                  <DollarSign className="text-[#FF9500]" size={20} />
                  <input
                    type="number"
                    className="bg-transparent outline-none w-full font-black text-xl ml-2"
                    onChange={(e) => updateData("price", e.target.value)}
                    value={formData.price}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Verification */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-400 ml-1">
                  LinkedIn Profile
                </label>
                <input
                  placeholder="https://linkedin.com/in/..."
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-medium"
                  onChange={(e) => updateData("linkedin", e.target.value)}
                  value={formData.linkedin}
                />
              </div>

              <div
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed p-10 rounded-[32px] text-center cursor-pointer transition-all ${
                  selectedFileName
                    ? "border-[#FF9500] bg-[#FF9500]/5"
                    : "border-gray-100 bg-gray-50 hover:border-gray-200"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  onChange={handleFileChange}
                />
                {selectedFileName ? (
                  <div className="flex flex-col items-center">
                    <FileText className="text-[#FF9500] mb-2" size={32} />
                    <p className="font-bold truncate max-w-xs">
                      {selectedFileName}
                    </p>
                    <span className="text-xs text-red-500 font-bold mt-2 uppercase tracking-widest">
                      Replace File
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="text-gray-300 mb-2" size={32} />
                    <p className="text-sm font-bold text-gray-500">
                      Upload Identity Documents
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-12">
            <button
              disabled={step === 1}
              onClick={() => setStep(step - 1)}
              className={`flex items-center gap-1 font-bold ${step === 1 ? "opacity-0" : "text-gray-400 hover:text-[#262626]"}`}
            >
              <ChevronLeft size={20} /> Back
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="bg-[#262626] text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:bg-black transition-all flex items-center gap-2"
              >
                Next <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleFinalSubmit}
                className="bg-[#FF9500] text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:bg-[#E68600] transition-all flex items-center gap-2"
              >
                Submit Application <CheckCircle size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}