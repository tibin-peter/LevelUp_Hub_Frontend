import React from "react";
import { Bell, Lock, Shield, CreditCard } from "lucide-react";

export default function Settings() {
    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-2xl font-black text-[#262626]">Settings</h1>
                <p className="text-gray-400">Manage system preferences</p>
            </header>

            <div className="grid gap-6 max-w-3xl">

                {/* Profile Settings */}
                <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Shield size={20} className="text-[#FF9500]" />
                        General
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[#F7F7F8] rounded-2xl">
                            <div>
                                <div className="font-bold text-gray-700">Platform Name</div>
                                <div className="text-sm text-gray-400">Customize the site title</div>
                            </div>
                            <input className="font-bold text-right bg-transparent outline-none" defaultValue="LevelUp Hub" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[#F7F7F8] rounded-2xl">
                            <div>
                                <div className="font-bold text-gray-700">Maintenance Mode</div>
                                <div className="text-sm text-gray-400">Disable access for users</div>
                            </div>
                            <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Logic */}
                <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <CreditCard size={20} className="text-[#FF9500]" />
                        Commission
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-[#F7F7F8] rounded-2xl">
                        <div>
                            <div className="font-bold text-gray-700">Platform Fee (%)</div>
                            <div className="text-sm text-gray-400">Percentage taken from mentors</div>
                        </div>
                        <input type="number" className="font-bold text-right bg-transparent outline-none w-16" defaultValue="15" />
                    </div>
                </div>

            </div>
        </div>
    );
}
