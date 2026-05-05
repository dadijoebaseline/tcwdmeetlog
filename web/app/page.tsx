'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/Button';
import { Card } from '@/components/FormElements';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && role === 'hr') {
      router.push('/dashboard');
    } else if (user && role === 'attendee') {
      router.push('/meetings');
    }
  }, [user, role, router]);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url('/IMG_3219.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="min-h-screen bg-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
            TCWD Attendance Management
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8">
            Modern attendance tracking system for Toledo City Water District
          </p>

          {!user ? (
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Sign Up
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-gray-600">
              <p className="text-white text-sm sm:text-base">Welcome, {user.email}</p>
              <p className="text-xs sm:text-sm mt-2 text-gray-200">Redirecting to dashboard...</p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
          <Card className="text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Easy Check-In</h3>
            <p className="text-gray-600">
              Employees scan QR codes via their Android app to confirm attendance
            </p>
          </Card>

          <Card className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Real-time Dashboard</h3>
            <p className="text-gray-600">
              HR managers track attendance in real-time with instant updates
            </p>
          </Card>

          <Card className="text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Export Reports</h3>
            <p className="text-gray-600">
              Generate professional PDF attendance reports on demand
            </p>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-gray-900">How It Works</h2>
          <div className="space-y-4 sm:space-y-6">
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-md bg-blue-500 text-white font-bold text-sm">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sign Up with Gmail</h3>
                <p className="text-gray-600">
                  Employees create an account using their Gmail address
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-500 text-white font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">HR Schedules Meetings</h3>
                <p className="text-gray-600">
                  HR managers create meetings and assign attendees
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-500 text-white font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Generate QR Codes</h3>
                <p className="text-gray-600">
                  Unique QR codes are generated for each meeting
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-500 text-white font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Scan & Confirm</h3>
                <p className="text-gray-600">
                  Employees scan QR code to confirm attendance with their Android app
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-500 text-white font-bold">
                  5
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Export Reports</h3>
                <p className="text-gray-600">
                  HR can export attendance records as PDF for documentation
                </p>
              </div>
            </div>
          </div>
        </Card>


      </div>
      </div>
    </div>
  );
}
