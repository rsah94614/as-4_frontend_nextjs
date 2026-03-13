"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { isAdminUser, isSuperDev } from "@/lib/role-utils";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid, FileText, Trophy, Clock,
  Wallet, SlidersHorizontal, LogOut, X, Bug,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",     href: "/dashboard",    icon: LayoutGrid },
  { label: "Review",        href: "/review",        icon: FileText },
  { label: "Redeem",        href: "/redeem",        icon: Trophy },
  { label: "History",       href: "/history",       icon: Clock },
  { label: "Wallet",        href: "/wallet",        icon: Wallet },
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
  const [isSuper, setIsSuper] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => { setMounted(true); setIsSuper(isSuperDev()); }, 0);
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
        style={{ background: '#fff', borderRight: '1px solid #dde3ea' }}
      >
        {/* Close — mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md lg:hidden"
          style={{ color: '#6b7280' }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── TOP: White logo area ── */}
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

        {/* ── Nav — white bg ── */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto" style={{ background: '#004C8F' }}>
          <ul className="space-y-0.5">
            {navItems
              .filter(item => !item.adminOnly || isAdmin)
              .map(item => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                      style={isActive
                        ? { background: 'rgba(255,255,255,0.18)', color: '#fff', paddingLeft: '9px', borderLeft: '3px solid #E31837' }
                        : { color: 'rgba(255,255,255,0.75)', paddingLeft: '12px' }
                      }
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <item.icon
                        className="w-4 h-4 shrink-0"
                        style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.5)' }}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </nav>

        {/* Dev Logger */}
        {mounted && process.env.NODE_ENV !== 'production' && isSuper && (
          <div className="px-3 py-2 shrink-0" style={{ background: '#004C8F' }}>
            <Link
              href="/dev-logger"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={pathname.startsWith('/dev-logger')
                ? { background: '#ede9fe', color: '#6d28d9' }
                : { color: '#7c3aed' }
              }
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ede9fe'; }}
              onMouseLeave={e => { if (!pathname.startsWith('/dev-logger')) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <Bug className="w-4 h-4 shrink-0" style={{ color: '#7c3aed' }} />
              Dev Logger
            </Link>
          </div>
        )}

        {/* ── BOTTOM: HDFC blue footer with prominent logout ── */}
        <div className="px-4 py-5 shrink-0" style={{ background: '#004C8F' }}>
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: '#E31837',
                  color: '#fff',
                  border: 'none',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#c41230')}
                onMouseLeave={e => (e.currentTarget.style.background = '#E31837')}
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
                  className="hover:opacity-90"
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