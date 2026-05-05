'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from './Button';
import { useState } from 'react';

export function Navbar() {
  const { user, profile, role, logout, loading } = useAuth();
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      setShowLogoutDialog(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl hover:text-blue-100">
            TCWD Attendance
          </Link>

          {user && (
            <div className="hidden md:flex gap-6">
              {role === 'hr' && (
                <>
                  <Link href="/dashboard" className="hover:text-blue-100 transition">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/meetings" className="hover:text-blue-100 transition">
                    Meetings
                  </Link>
                  <Link href="/dashboard/users" className="hover:text-blue-100 transition">
                    Users
                  </Link>
                  <Link href="/dashboard/reports" className="hover:text-blue-100 transition">
                    Reports
                  </Link>
                </>
              )}
              {role === 'attendee' && (
                <>
                  <Link href="/meetings" className="hover:text-blue-100 transition">
                    My Meetings
                  </Link>
                  <Link href="/attendance" className="hover:text-blue-100 transition">
                    History
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <span className="text-blue-100">Loading...</span>
          ) : user ? (
            <>
              <div className="hidden md:block">
                <p className="text-sm text-blue-100">
                  {profile?.name || user.displayName || user.email}
                </p>
                <p className="text-xs text-blue-200">
                  {role === 'hr' ? 'HR Manager' : 'Attendee'}
                </p>
              </div>

              <Link href="/profile">
                <Button variant="ghost" size="sm" className="text-white hover:bg-blue-500">
                  Profile
                </Button>
              </Link>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowLogoutDialog(true)}
              >
                Logout
              </Button>

              {/* Logout Dialog */}
              {showLogoutDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Logout</h2>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to log out?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowLogoutDialog(false)}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Link href="/auth/login">
              <Button variant="secondary" size="sm">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
