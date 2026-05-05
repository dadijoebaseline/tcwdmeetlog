'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from './Button';

export function Navbar() {
  const { user, role, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
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
                  {user.email}
                </p>
                <p className="text-xs text-blue-200">
                  {role === 'hr' ? 'HR Manager' : 'Attendee'}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
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
