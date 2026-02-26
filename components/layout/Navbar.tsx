'use client';

import { Search, Bell, Menu } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { auth } from '@/services/auth-service';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

interface NavbarProps {
    onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [user] = useState(() => auth.getUser());
    const [showNotifications, setShowNotifications] = useState(false);
    const [hasUnread, setHasUnread] = useState(true); // Mocking initial unread state
    const [prevPathname, setPrevPathname] = useState(usePathname());

    const notificationRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    // Reset unread when navigating to notifications page
    if (pathname !== prevPathname) {
        setPrevPathname(pathname);
        if (pathname === '/notifications') {
            setHasUnread(false);
        }
    }

    const initials = React.useMemo(() => {
        if (!user?.username) return '';
        const parts = (user.username as string).trim().split(/\s+/);
        return parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : user.username.slice(0, 2).toUpperCase();
    }, [user]);

    const username = user?.username || '';

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target as Node)
            ) {
                setShowNotifications(false);
            }
        }

        if (showNotifications) {
            document.addEventListener('pointerdown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('pointerdown', handleClickOutside);
        };
    }, [showNotifications]);

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth < 1024) {
                setShowNotifications(false);
            }
        }
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    useEffect(() => {
        function handleResize() {
            if (window.innerWidth >= 1024 && pathname === '/notifications') {
                router.push('/'); // go back to main page
                setShowNotifications(true); // open dropdown
            }
        }

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [pathname, router]);

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

                    <div className='flex flex-row gap-2'>
                        {/* Right — notifications + profile */}

                        <div className="relative flex items-center gap-2 shrink-0" ref={notificationRef}>
                            <button
                                onClick={() => {
                                    if (window.innerWidth < 1024) {
                                        router.push('/notifications');
                                    } else {
                                        setShowNotifications((prev) => !prev);
                                        setHasUnread(false); // Clear indicator when dropdown opens
                                    }
                                }}
                                className="w-10 h-10 rounded-full hover:bg-gray-100 transition-colors relative flex items-center justify-center"
                                aria-label="Notifications"
                            >
                                <Bell className="h-6 w-6 text-gray-900" />
                                {hasUnread && (
                                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white pointer-events-none" />
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 top-14 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 hidden lg:block">
                                    <div className="p-4 border-b font-semibold text-gray-800">
                                        Notifications
                                    </div>

                                    <div className="max-h-96 overflow-y-auto">
                                        <div className="p-4 hover:bg-gray-50 cursor-pointer">
                                            🎉 You received a reward from HR
                                        </div>
                                        <div className="p-4 hover:bg-gray-50 cursor-pointer">
                                            ⭐ Your nomination was approved
                                        </div>
                                        <div className="p-4 hover:bg-gray-50 cursor-pointer">
                                            🏆 Top performer this month!
                                        </div>
                                    </div>

                                    <div className="p-3 text-center text-blue-600 hover:bg-gray-50 cursor-pointer border-t">
                                        View all
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bar between bell icon and profile button */}
                        <div className="h-10 w-px bg-gray-300"></div>


                        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity pl-2"
                            onClick={handleProfileClick}

                        >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
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
        </nav >
    );
}