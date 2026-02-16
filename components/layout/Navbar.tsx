'use client';

import { Search, Bell, Menu } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NavbarProps {
    onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleProfileClick = () => {
        router.push('/profile');
    };

    return (
        <nav className="w-full pt-4 bg-gray-100">
            <div className="px-6 sm:px-8">
                <div className="flex items-center justify-between h-16 gap-4">
                    {/* Hamburger menu - mobile only */}
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden shrink-0"
                    >
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Search Bar */}
                    <div className="flex-1 min-w-0 max-w-2xl">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search for rewards.."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                            />
                        </div>
                    </div>

                    {/* Right Side - Notification and Profile */}
                    <div className="flex items-center gap-4 shrink-0">
                        {/* Notification Icon */}
                        <button
                            className="w-10 h-10 rounded-full hover:bg-gray-200 transition-colors relative flex items-center justify-center"
                            aria-label="Notifications"
                        >
                            <Bell className="h-6 w-6 text-gray-900" />
                        </button>

                        {/* Vertical Divider */}
                        <div className="h-10 w-px bg-gray-300"></div>

                        {/* Profile */}
                        <button
                            onClick={handleProfileClick}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                                <span className="text-white font-medium text-sm">GH</span>
                            </div>
                            <span className="text-gray-900 font-medium hidden md:block text-base">
                                Gautam Hazarika
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}