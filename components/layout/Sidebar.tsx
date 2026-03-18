"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { isAdminUser } from "@/lib/role-utils";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid, FileText, Trophy, Clock,
  Wallet, SlidersHorizontal, LogOut, Bug,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Recognize", href: "/review", icon: FileText },
  { label: "Redeem", href: "/redeem", icon: Trophy },
   { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "History", href: "/history", icon: Clock },
  { label: "Control Panel", href: "/control-panel", icon: SlidersHorizontal, adminOnly: true },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logoutUser } = useAuth();
  const isAdmin = isAdminUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => { setMounted(true); }, 0);
    return () => clearTimeout(id);
  }, [pathname]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 flex flex-col w-60 h-screen
          transform transition-transform duration-300 ease-in-out
          lg:sticky lg:top-0 lg:translate-x-0 lg:z-auto lg:shrink-0 lg:h-screen
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ background: '#004C8F', borderRight: '1px solid rgba(255,255,255,0.08)' }}
      >

        {/* ── Logo area ── */}
        <div className="flex flex-col items-center justify-center px-6 py-6 shrink-0"
          style={{ background: '#004C8F', borderBottom: '3px solid #E31837' }}>
          <Image
            src="/logo.svg"
            alt="Aabhar Logo"
            width={150}
            height={44}
            priority
          />
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto custom-scrollbar">
            <ul className="space-y-1">
                {navItems
                    .filter(item => !item.adminOnly || isAdmin)
                    .map(item => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={onClose}
                                    className="flex items-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                                    style={isActive
                                        ? { background: 'rgba(255,255,255,0.12)', color: '#fff', paddingLeft: '11px', borderLeft: '4px solid #E31837' }
                                        : { color: 'rgba(255,255,255,0.65)', paddingLeft: '14px' }
                                    }
                                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
                                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                >
                                    <item.icon
                                        className="w-4.5 h-4.5 shrink-0"
                                        style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.4)' }}
                                    />
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
            </ul>
        </nav>

        {/* ── Bottom Section (Logout & Tools) ── */}
        <div className="mt-auto px-4 pb-8 pt-4 space-y-4 shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.05)' }}>
            
            {/* Dev Logger — admin only (Moved inside bottom container for better grouping) */}
            {mounted && isAdmin && (
                <Link
                    href="/dev-logger"
                    onClick={onClose}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border border-white/5"
                    style={pathname.startsWith('/dev-logger')
                        ? {
                            background: 'rgba(139,92,246,0.2)',
                            color: '#fff',
                            borderLeft: '3px solid #a78bfa',
                        }
                        : {
                            color: 'rgba(255,255,255,0.5)',
                            background: 'rgba(255,255,255,0.03)',
                        }
                    }
                >
                    <Bug className="w-3.5 h-3.5" />
                    <span>Dev Logger</span>
                    <span className="ml-auto bg-violet-500 text-white px-1.5 py-0.5 rounded text-[9px]">API</span>
                </Link>
            )}

            <Dialog>
                <DialogTrigger asChild>
                    <button
                        className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl text-sm font-bold shadow-lg transition-all cursor-pointer active:scale-95"
                        style={{ background: '#E31837', color: '#fff', border: 'none', letterSpacing: '0.02em' }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        Log out
                    </button>
                </DialogTrigger>

            <DialogContent showCloseButton={false} className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogDescription>
                  Are you sure you want to log out? You will need to sign in again to access your account.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={logoutUser}
                  style={{ background: '#E31837', color: '#fff' }}
                  className="hover:opacity-90 cursor-pointer"
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

      </aside>
    </>
  );
}