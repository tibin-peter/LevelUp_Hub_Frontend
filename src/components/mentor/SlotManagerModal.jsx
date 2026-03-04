import React, { useEffect, useState } from "react";
import { X, Calendar, Clock, Trash2, Plus, Loader2 } from "lucide-react";
import { createSlot, getMentorSlots, deleteSlot } from "../../api/slot.api";
import { toast } from "react-hot-toast";

export default function SlotManagerModal({ isOpen, onClose }) {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [newSlot, setNewSlot] = useState({ date: "", startTime: "", endTime: "" });

    useEffect(() => {
        if (isOpen) {
            loadSlots();
            // Reset form on open
            setNewSlot({ date: "", startTime: "", endTime: "" });
        }
    }, [isOpen]);

    const loadSlots = async () => {
        setLoading(true);
        try {
            const res = await getMentorSlots();
            if (res.success) {
                // Sort slots by start time
                const sorted = (res.data || []).sort((a, b) => new Date(a.StartTime) - new Date(b.StartTime));
                setSlots(sorted);
            }
        } catch (err) {
            console.error("Failed to load slots", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSlot = async () => {
        if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) return;

        setAdding(true);
        try {
            // Combine date and time strings into ISO strings
            const startDateTime = new Date(`${newSlot.date}T${newSlot.startTime}`);
            const endDateTime = new Date(`${newSlot.date}T${newSlot.endTime}`);

            const res = await createSlot(startDateTime.toISOString(), endDateTime.toISOString());
            if (res.success) {
                await loadSlots(); 
                setNewSlot({ date: "", startTime: "", endTime: "" }); 
                toast.success("Availability slot created!");
            } else {
                toast.error(res.message || "Failed to create slot");
            }
        } catch (err) {
            console.error("Failed to add slot", err);
            toast.error("Error adding slot. Please try again.");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this slot?")) return;
        try {
            const res = await deleteSlot(id);
            if (res.success || res.status === 200) {
                setSlots(prev => prev.filter(s => s.ID !== id));
            }
        } catch (err) {
            console.error("Failed to delete slot", err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col md:flex-row overflow-hidden">

                {/* Left Panel: Add Slot Form */}
                <div className="md:w-1/3 bg-[#FAFAFA] p-8 border-r border-[#F0F0F0] flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-2xl font-black text-[#171717] mb-2">Add Availability</h2>
                        <p className="text-sm text-[#737373] font-medium">Set a time for students to book sessions with you.</p>
                    </div>

                    <div className="space-y-5 flex-1">
                        <div>
                            <label className="block text-xs font-bold text-[#A3A3A3] uppercase tracking-wider mb-2">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="date"
                                    value={newSlot.date}
                                    onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF9500]/20 focus:border-[#FF9500] outline-none font-medium text-[#171717]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#A3A3A3] uppercase tracking-wider mb-2">Start Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="time"
                                        value={newSlot.startTime}
                                        onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                                        className="w-full pl-10 pr-2 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF9500]/20 focus:border-[#FF9500] outline-none font-medium text-[#171717]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#A3A3A3] uppercase tracking-wider mb-2">End Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="time"
                                        value={newSlot.endTime}
                                        onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                                        className="w-full pl-10 pr-2 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF9500]/20 focus:border-[#FF9500] outline-none font-medium text-[#171717]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleAddSlot}
                        disabled={adding || !newSlot.date || !newSlot.startTime || !newSlot.endTime}
                        className="w-full mt-6 py-4 bg-[#262626] text-white font-bold rounded-2xl hover:bg-[#FF9500] hover:shadow-lg hover:shadow-[#FF9500]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {adding ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                        Add Slot
                    </button>
                </div>

                {/* Right Panel: Slot List */}
                <div className="md:w-2/3 p-8 flex flex-col bg-white">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-[#171717]">Your Schedule</h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={24} className="text-[#737373]" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="animate-spin text-[#FF9500]" size={32} />
                            </div>
                        ) : slots.length > 0 ? (
                            <div className="space-y-3">
                                {slots.map((slot) => {
                                    const start = new Date(slot.StartTime);
                                    const end = new Date(slot.EndTime);
                                    const dateStr = start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                                    const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                                    return (
                                        <div key={slot.ID} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-shadow group/item">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-orange-50 text-[#FF9500] rounded-xl flex items-center justify-center font-bold text-lg">
                                                    {start.getDate()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#171717]">{dateStr}</p>
                                                    <p className="text-sm text-[#737373] font-medium flex items-center gap-1">
                                                        <Clock size={12} /> {timeStr}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {slot.IsBooked ? (
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg border border-green-200">
                                                        Booked
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDelete(slot.ID)}
                                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Delete Slot"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Calendar className="text-gray-300" size={24} />
                                </div>
                                <p className="text-[#171717] font-bold">No slots added yet</p>
                                <p className="text-sm text-[#737373] max-w-xs mx-auto mt-1">Add your available times so students can book sessions with you.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
