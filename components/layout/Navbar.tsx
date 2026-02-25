'use client';

import { Search, Bell, Menu } from 'lucide-react';
import { useState } from 'react';
import { auth } from '@/services/auth-service';
import { useRouter } from 'next/navigation';

interface NavbarProps {
    onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const user = auth.getUser();
    let username = '';
    let initials = '';
    if (user?.username) {
        username = user.username;
        const parts = (user.username as string).trim().split(/\s+/);
        initials = parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : user.username.slice(0, 2).toUpperCase();
    }

    const router = useRouter();

    const handleProfileClick = () => {
        router.push('/profile');
    };

    return (
        <nav className="w-full pt-4 shrink-0">
            <div className="px-4 sm:px-6">
                <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
                    {/* Hamburger — mobile only */}
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

                    {/* Right — notifications + profile */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        <button
                            className="w-10 h-10 rounded-full hover:bg-gray-200 transition-colors relative flex items-center justify-center"
                            aria-label="Notifications"
                        >
                            <Bell className="h-6 w-6 text-gray-900" />
                        </button>

                        <div className="h-10 w-px bg-gray-300"></div>


                        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            onClick={handleProfileClick}

                        >
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