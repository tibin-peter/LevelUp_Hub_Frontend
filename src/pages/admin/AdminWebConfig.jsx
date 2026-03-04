import React, { useState, useEffect } from 'react';
import {
    Settings,
    Shield,
    LayoutDashboard,
    Users,
    BookOpenCheck,
    MessageCircle,
    CreditCard,
    AlertCircle,
    Plus,
    Check,
    RotateCcw,
    Zap,
    Lock,
    ShieldCheck,
    Calendar,
    Search,
    Loader2
} from 'lucide-react';
import { getRoles, getPermissions, getRolePermissions, toggleRolePermission, createRole } from '../../api/admin.api';
import toast from 'react-hot-toast';

// Icon Map for Slugs - Maps backend slugs to Lucide icons
const ICON_MAP = {
    'dashboard': LayoutDashboard,
    'students': Users,
    'mentors': Users,
    'courses': BookOpenCheck,
    'bookings': Calendar,
    'messages': MessageCircle,
    'payments': CreditCard,
    'settings': Settings,
    'explore_courses': Search,
    'my_courses': BookOpenCheck,
    'sessions': Calendar,
    'earnings': CreditCard,
    'booking_requests': MessageCircle,
    'mentor_approvals': ShieldCheck,
    'complaints': AlertCircle,
    'wallet': CreditCard,
    'profile': Users,
};

const DEFAULT_ICON = Settings;

export default function AdminWebConfig() {
    const [roles, setRoles] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null); // Full Role object from backend
    const [assignedPermissionIds, setAssignedPermissionIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [pendingChanges, setPendingChanges] = useState(new Set()); // IDs of permissions toggled locally

    // Initial load: Fetch all roles and all possible permission definitions
    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const [rolesRes, permsRes] = await Promise.all([getRoles(), getPermissions()]);

                if (rolesRes.data) setRoles(rolesRes.data);
                if (permsRes.data) setAllPermissions(permsRes.data);

                // Select first role by default
                if (rolesRes.data?.length > 0) {
                    await fetchRolePermissions(rolesRes.data[0]);
                }
            } catch (err) {
                console.error("Init Error:", err);
                toast.error("Failed to load configuration data from server.");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Fetch what permissions are currently assigned to a role
    const fetchRolePermissions = async (role) => {
        try {
            setSelectedRole(role);
            const res = await getRolePermissions(role.Name);
            if (res.data) {
                // res.data is expected to be the Role object with Preloaded Permissions
                const ids = new Set((res.data.Permissions || []).map(p => p.ID));
                setAssignedPermissionIds(ids);
                setPendingChanges(new Set());
            }
        } catch (err) {
            console.error("Fetch Role Perms Error:", err);
            toast.error(`Failed to load current permissions for ${role.Name}`);
        }
    };

    // Locally toggle a permission before hitting "Apply"
    const toggleLocalPermission = (permId) => {
        setPendingChanges(prev => {
            const newSet = new Set(prev);
            if (newSet.has(permId)) newSet.delete(permId);
            else newSet.add(permId);
            return newSet;
        });

        setAssignedPermissionIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(permId)) newSet.delete(permId);
            else newSet.add(permId);
            return newSet;
        });
    };

    // Commit all pending local changes to the backend
    const handleApplyChanges = async () => {
        if (pendingChanges.size === 0) {
            toast.success("No changes to apply.");
            return;
        }

        try {
            setSubmitting(true);
            const changeArray = Array.from(pendingChanges);

            // Sequential toggles - backend expects one change at a time
            for (const permId of changeArray) {
                const isEnabled = assignedPermissionIds.has(permId);
                await toggleRolePermission(selectedRole.ID, permId, isEnabled);
            }

            setPendingChanges(new Set());
            toast.success(`Access updated successfully for ${selectedRole.Name}`);
        } catch (err) {
            console.error("RBAC Submit Error:", err);
            toast.error("Failed to synchronize changes. Some updates may not have saved.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        if (selectedRole) fetchRolePermissions(selectedRole);
    };

    const handleCreateRole = async () => {
        const name = window.prompt("Enter new role name (e.g., moderator):");
        if (!name) return;

        try {
            setLoading(true);
            const res = await createRole(name.trim().toLowerCase());
            if (res.message) {
                toast.success(`Role '${name}' created!`);
                // Refresh roles list
                const rolesRes = await getRoles();
                if (rolesRes.data) setRoles(rolesRes.data);
            }
        } catch (err) {
            console.error("Create Role Error:", err);
            toast.error(err.response?.data?.error || "Failed to create role");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-100 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-[#FF9500] border-t-transparent rounded-full animate-spin absolute top-0"></div>
                </div>
                <div className="text-center">
                    <p className="text-[#262626] font-black tracking-widest uppercase text-xs">Synchronizing RBAC Modules</p>
                    <p className="text-gray-400 text-[10px] mt-1 font-medium">Connecting to LevelUp Hub API...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#262626]">Web Configuration</h1>
                    <p className="text-gray-400 font-medium mt-1">Configure visibility and access for <span className="text-[#FF9500] capitalize">{selectedRole?.Name}</span>s.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 text-[#262626] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <RotateCcw size={16} /> Reset
                    </button>
                    <button
                        onClick={handleApplyChanges}
                        disabled={submitting || pendingChanges.size === 0}
                        className="flex items-center gap-2 px-8 py-3 bg-[#FF9500] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#e68600] transition-all shadow-lg shadow-[#FF9500]/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} fill="white" className="group-hover:animate-pulse" />}
                        Apply Changes {pendingChanges.size > 0 && `(${pendingChanges.size})`}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 h-full">
                {/* Left Column: Role Selection */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 h-fit">
                        <div className="flex items-center gap-2 mb-8 text-[#FF9500]">
                            <Shield size={20} />
                            <h3 className="font-black uppercase tracking-widest text-[11px]">System Roles</h3>
                        </div>

                        <div className="space-y-3">
                            {roles.map((role) => (
                                <button
                                    key={role.ID}
                                    onClick={() => {
                                        if (pendingChanges.size > 0) {
                                            if (window.confirm("You have unsaved changes for this role. Switch anyway?")) {
                                                fetchRolePermissions(role);
                                            }
                                        } else {
                                            fetchRolePermissions(role);
                                        }
                                    }}
                                    className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-300 ${selectedRole?.ID === role.ID
                                        ? 'bg-[#FF9500]/5 border border-[#FF9500]/20 text-[#FF9500]'
                                        : 'bg-gray-50/50 border border-transparent text-gray-400 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="font-bold capitalize">{role.Name}</span>
                                    {selectedRole?.ID === role.ID && (
                                        <div className="w-5 h-5 bg-[#FF9500] rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                            <Check size={12} className="text-white" strokeWidth={4} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={handleCreateRole}
                            className="w-full mt-6 py-4 flex items-center justify-center gap-2 text-[#FF9500] font-black text-[11px] uppercase tracking-widest hover:bg-[#FF9500]/5 rounded-2xl transition-all border border-dashed border-[#FF9500]/30 active:scale-95"
                        >
                            <Plus size={16} /> Create New Role
                        </button>
                    </div>

                    <div className="bg-[#262626] rounded-[32px] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-[#FF9500]/10 transition-colors duration-500"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                <Lock size={20} className="text-[#FF9500]" />
                            </div>
                            <h3 className="text-xl font-black mb-3">System Logic</h3>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
                                RBAC settings update the application's sidebar and route access in real-time.
                            </p>
                            <button className="w-full py-4 bg-[#FF9500] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#e68600] transition-all shadow-xl shadow-black/20">
                                Global Controls
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Permissions Map */}
                <div className="col-span-12 lg:col-span-8 bg-white rounded-[32px] border border-gray-100 shadow-sm p-10 flex flex-col min-h-[500px] h-[750px]">
                    <div className="flex justify-between items-center mb-10 shrink-0">
                        <div>
                            <h2 className="text-2xl font-black text-[#262626]">Visibility Map: <span className="capitalize">{selectedRole?.Name}</span></h2>
                            <p className="text-gray-400 font-medium text-sm mt-1">Directly control active modules and sidebar items.</p>
                        </div>
                        <div className="hidden md:block">
                            <span className="bg-[#FF9500]/10 text-[#FF9500] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck size={14} /> Registered Modules
                            </span>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-50 overflow-y-auto pr-4 custom-scrollbar flex-1">
                        {allPermissions.map((perm) => {
                            const Icon = ICON_MAP[perm.Slug] || DEFAULT_ICON;
                            const isActive = assignedPermissionIds.has(perm.ID);

                            return (
                                <div key={perm.ID} className="py-6 flex items-center justify-between group transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive
                                            ? 'bg-[#FF9500]/10 text-[#FF9500]'
                                            : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            <Icon size={20} />
                                        </div>
                                        <div>
                                            <h4 className={`font-black text-base transition-colors ${isActive ? 'text-[#262626]' : 'text-gray-400'}`}>
                                                {perm.Name}
                                            </h4>
                                            <p className="text-xs text-gray-400 font-medium lowercase">Key Identifier: {perm.Slug}</p>
                                        </div>
                                    </div>

                                    <button
                                        disabled={submitting}
                                        onClick={() => toggleLocalPermission(perm.ID)}
                                        className={`relative w-14 h-7 rounded-full transition-all duration-500 ease-in-out ${isActive ? 'bg-green-500 shadow-lg shadow-green-500/20' : 'bg-gray-200'
                                            } ${pendingChanges.has(perm.ID) ? 'ring-2 ring-[#FF9500] ring-offset-2' : ''} ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-500 ease-in-out ${isActive ? 'left-8' : 'left-1'
                                            }`} />
                                    </button>
                                </div>
                            );
                        })}

                        {!loading && allPermissions.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in zoom-in duration-500">
                                <AlertCircle size={48} className="text-gray-200" />
                                <div>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No definitions found</p>
                                    <p className="text-gray-300 text-xs mt-1">Please ensure your permissions table is seeded correctly.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
