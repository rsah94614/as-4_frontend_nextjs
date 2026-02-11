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
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Review", href: "/review", icon: FileText },
  { label: "Rewards", href: "/rewards", icon: Trophy },
  { label: "History", href: "/history", icon: Clock },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Control Panel", href: "/admin", icon: SlidersHorizontal },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-60 h-screen sticky top-0 overflow-y-auto bg-white">
      {/* Logo */}
      <div className="flex flex-col items-center px-6 py-6">
        <Image
          src="/logo.svg"
          alt="Abhaar Logo"
          width={80}
          height={80}
          priority
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-orange-600" : "text-gray-500"}`} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="px-4 pb-6 mt-auto space-y-1">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
            ${pathname.startsWith("/settings")
              ? "bg-orange-100 text-orange-700"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
        >
          <Settings className={`w-5 h-5 ${pathname.startsWith("/settings") ? "text-orange-600" : "text-gray-500"}`} />
          Settings
        </Link>

        <button
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
          onClick={() => {
            // TODO: Add logout logic
            console.log("Logout clicked");
          }}
        >
          <LogOut className="w-5 h-5 text-red-500" />
          Log out
        </button>
      </div>
    </aside>
  );
}
