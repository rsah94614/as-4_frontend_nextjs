'use client';

import { Search, Bell, Menu } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
    onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <nav className="w-full bg-white border-b border-gray-200">
            <div className="px-4 sm:px-6">
                <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
                    {/* Hamburger menu - mobile only */}
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden flex-shrink-0"
                    >
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    {/* Search Bar */}
                    <div className="flex-1 min-w-0 max-w-2xl">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </div>
                    </div>

                    {/* Right Side - Notification and Profile */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        {/* Notification Icon */}
                        <button
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                            aria-label="Notifications"
                        >
                            <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                        </button>

                        {/* Profile */}
                        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                <span className="text-white font-medium text-xs sm:text-sm">GH</span>
                            </div>
                            <span className="text-gray-900 font-medium hidden md:block text-sm">
                                Gautam Hazarika
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}