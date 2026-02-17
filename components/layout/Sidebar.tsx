"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  FileText,
  Trophy,
  Clock,
  Wallet,
  SlidersHorizontal,
  Settings,
  LogOut,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",     href: "/dashboard",      icon: LayoutGrid        },
  { label: "Review",        href: "/review",         icon: FileText          },
  { label: "Redeem",        href: "/redeem",         icon: Trophy            },
  { label: "History",       href: "/history",        icon: Clock             },
  { label: "Wallet",        href: "/wallet",         icon: Wallet            },
  { label: "Control Panel", href: "/control-panel",  icon: SlidersHorizontal },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 flex flex-col w-60 h-screen bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:sticky lg:top-0 lg:translate-x-0 lg:z-auto lg:shrink-0 lg:h-screen
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 lg:hidden"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center px-6 py-6 flex-shrink-0">
          <Image
            src="/logo.svg"
            alt="Abhaar Logo"
            width={80}
            height={80}
            priority
          />
        </div>

        {/* Navigation — scrolls internally if items overflow */}
        <nav className="flex-1 px-4 py-2 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${isActive
                        ? "bg-orange-100 text-orange-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${isActive ? "text-orange-600" : "text-gray-500"}`}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="px-4 pb-6 mt-auto space-y-1 flex-shrink-0">
          <Link
            href="/settings"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${pathname.startsWith("/settings")
                ? "bg-orange-100 text-orange-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
          >
            <Settings
              className={`w-5 h-5 ${pathname.startsWith("/settings") ? "text-orange-600" : "text-gray-500"}`}
            />
            Settings
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            Log out
          </Link>
        </div>
      </aside>
    </>
  );
}