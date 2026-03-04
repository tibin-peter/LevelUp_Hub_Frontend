import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

                    {/* Branding & Contact - 5 Columns wide */}
                    <div className="md:col-span-5 space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-[#FF9500] rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl italic">L</span>
                            </div>
                            <span className="font-bold text-xl text-gray-800">LevelUp-Hub</span>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-600 text-sm">
                                <Mail size={18} className="text-gray-800" />
                                <span>contact@levelup-hub.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 text-sm">
                                <Phone size={18} className="text-gray-800" />
                                <span>+91 6282635670</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 text-sm">
                                <MapPin size={18} className="text-gray-800" />
                                <span>Somewhere in the World</span>
                            </div>
                        </div>
                    </div>

                    {/* Links Section - 7 Columns wide */}
                    <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="font-bold text-gray-800 mb-4">Home</h3>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><Link to="#" className="hover:text-[#FF9500]">Benefits</Link></li>
                                <li><Link to="#" className="hover:text-[#FF9500]">Our Courses</Link></li>
                                <li><Link to="#" className="hover:text-[#FF9500]">Our Testimonials</Link></li>
                                <li><Link to="#" className="hover:text-[#FF9500]">Our FAQ</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-800 mb-4">About Us</h3>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><Link to="#" className="hover:text-[#FF9500]">Company</Link></li>
                                <li><Link to="#" className="hover:text-[#FF9500]">Achievements</Link></li>
                                <li><Link to="#" className="hover:text-[#FF9500]">Our Goals</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-800 mb-4">Social Profiles</h3>
                            <div className="flex gap-2">
                                <a href="#" className="p-3 bg-gray-50 rounded-lg text-gray-700 hover:bg-[#FF9500] hover:text-white transition-all border border-gray-100">
                                    <Facebook size={20} fill="currentColor" />
                                </a>
                                <a href="#" className="p-3 bg-gray-50 rounded-lg text-gray-700 hover:bg-[#FF9500] hover:text-white transition-all border border-gray-100">
                                    <Twitter size={20} fill="currentColor" />
                                </a>
                                <a href="#" className="p-3 bg-gray-50 rounded-lg text-gray-700 hover:bg-[#FF9500] hover:text-white transition-all border border-gray-100">
                                    <Linkedin size={20} fill="currentColor" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                    <p className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} TibinPeter. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}