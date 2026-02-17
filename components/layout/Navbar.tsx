'use client';

import { Search, Bell, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';

interface NavbarProps {
    onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [username,    setUsername]    = useState('');
    const [initials,    setInitials]    = useState('');

    useEffect(() => {
        const user = auth.getUser();
        if (user?.username) {
            setUsername(user.username);
            // Build initials from username words, fall back to first two chars
            const parts = (user.username as string).trim().split(/\s+/);
            setInitials(
                parts.length >= 2
                    ? (parts[0][0] + parts[1][0]).toUpperCase()
                    : user.username.slice(0, 2).toUpperCase()
            );
        }
    }, []);

    return (
        <nav className="w-full bg-white border-b border-gray-200 flex-shrink-0">
            <div className="px-4 sm:px-6">
                <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
                    {/* Hamburger — mobile only */}
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden flex-shrink-0"
                    >
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Search */}
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
                                className="block w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </div>
                    </div>

                    {/* Right — notifications + profile */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        <button
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                            aria-label="Notifications"
                        >
                            <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                        </button>

                        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-medium text-xs sm:text-sm">
                                    {initials || '??'}
                                </span>
                            </div>
                            {username && (
                                <span className="text-gray-900 font-medium hidden md:block text-sm">
                                    {username}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}