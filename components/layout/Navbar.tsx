'use client';

import { Search, Bell, Menu, Loader2 } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { auth } from '@/services/auth-service';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { notificationService, Notification } from '@/services/notification-service';

interface NavbarProps {
    onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [user] = useState(() => auth.getUser());
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const notificationRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    // Fetch unread count
    const fetchUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    // Fetch notifications for dropdown
    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const response = await notificationService.getNotifications(false, 5);
            setNotifications(response.notifications);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllRead();
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        // Refresh unread count every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Reset unread count when navigating to notifications page
    useEffect(() => {
        if (pathname === '/notifications') {
            setUnreadCount(0);
        }
    }, [pathname]);

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

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                                        const willShow = !showNotifications;
                                        setShowNotifications(willShow);
                                        if (willShow) {
                                            fetchNotifications();
                                            handleMarkAllRead();
                                        }
                                    }
                                }}
                                className="w-10 h-10 rounded-full hover:bg-gray-100 transition-colors relative flex items-center justify-center cursor-pointer"
                                aria-label="Notifications"
                            >
                                <Bell className="h-6 w-6 text-gray-900" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white pointer-events-none flex items-center justify-center text-[10px] text-white font-bold">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 top-14 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 hidden lg:block overflow-hidden">
                                    <div className="p-4 border-b flex justify-between items-center">
                                        <span className="font-semibold text-gray-800">Notifications</span>
                                        {unreadCount > 0 && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                {unreadCount} New
                                            </span>
                                        )}
                                    </div>

                                    <div className="max-h-96 overflow-y-auto">
                                        {isLoading ? (
                                            <div className="p-8 flex flex-col items-center justify-center text-gray-500">
                                                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                                <p className="text-sm">Loading...</p>
                                            </div>
                                        ) : notifications.length > 0 ? (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    className={`p-4 hover:bg-gray-50 cursor-pointer border-b last:border-0 transition-colors ${!notif.read_at ? 'bg-blue-50/30' : ''}`}
                                                >
                                                    <p className="text-sm text-gray-800 leading-snug">{notif.message}</p>
                                                    <p className="text-[11px] text-gray-400 mt-1">{formatTime(notif.created_at)}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-500">
                                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                <p className="text-sm">No notifications yet</p>
                                            </div>
                                        )}
                                    </div>

                                    <div
                                        onClick={() => {
                                            router.push('/notifications');
                                            setShowNotifications(false);
                                        }}
                                        className="p-3 text-center text-sm font-medium text-blue-600 hover:bg-gray-50 cursor-pointer border-t transition-colors"
                                    >
                                        View all
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bar between bell icon and profile button */}
                        <div className="h-10 w-px bg-gray-300"></div>


                        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity pl-2 cursor-pointer"
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
