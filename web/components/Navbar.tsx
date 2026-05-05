'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from './Button';
import { useState } from 'react';

export function Navbar() {
  const { user, profile, role, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      setShowLogoutDialog(false);
      setMobileOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinkClass = (href: string) => {
    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
    return isActive
      ? 'text-white font-semibold border-b-2 border-white pb-0.5'
      : 'text-blue-100 hover:text-white transition';
  };

  const hrLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/meetings', label: 'Meetings' },
    { href: '/dashboard/users', label: 'Users' },
    { href: '/dashboard/reports', label: 'Reports' },
  ];

  const attendeeLinks = [
    { href: '/meetings', label: 'My Meetings' },
  ];

  const links = role === 'hr' ? hrLinks : role === 'attendee' ? attendeeLinks : [];

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-xl text-white hover:text-blue-100 shrink-0">
              TCWD Attendance
            </Link>

            {user && (
              <div className="hidden md:flex gap-6">
                {links.map(({ href, label }) => (
                  <Link key={href} href={href} className={navLinkClass(href)}>
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {loading ? (
              <span className="text-blue-200 text-sm">Loading...</span>
            ) : user ? (
              <>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-white leading-tight">
                    {profile?.name || user.displayName || user.email}
                  </p>
                  <p className="text-xs text-blue-200 leading-tight">
                    {role === 'hr' ? 'HR Manager' : 'Attendee'}
                  </p>
                </div>

                <Link href="/profile" className="hidden md:block">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-blue-600 border border-blue-400">
                    Profile
                  </Button>
                </Link>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowLogoutDialog(true)}
                  className="hidden md:block"
                >
                  Logout
                </Button>

                {/* Mobile hamburger */}
                <button
                  className="md:hidden p-2 rounded-lg hover:bg-blue-600 transition"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-label="Toggle menu"
                >
                  <div className="w-5 h-0.5 bg-white mb-1"></div>
                  <div className="w-5 h-0.5 bg-white mb-1"></div>
                  <div className="w-5 h-0.5 bg-white"></div>
                </button>
              </>
            ) : (
              <Link href="/auth/login">
                <Button variant="secondary" size="sm">Login</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && user && (
          <div className="md:hidden border-t border-blue-600 py-3 space-y-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-100 hover:bg-blue-600 hover:text-white'
                } transition`}
              >
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-blue-600 mt-2">
              <p className="px-3 text-xs text-blue-300 mb-2">
                {profile?.name || user.email} · {role === 'hr' ? 'HR Manager' : 'Attendee'}
              </p>
              <Link href="/profile" onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-blue-600 hover:text-white transition">
                Profile
              </Link>
              <button
                onClick={() => { setMobileOpen(false); setShowLogoutDialog(true); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-blue-600 hover:text-white transition"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
