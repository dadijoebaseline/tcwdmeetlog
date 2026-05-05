'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card } from '@/components/FormElements';

export default function MeetingsPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || role !== 'attendee')) {
      router.push('/auth/login');
    }
  }, [user, role, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>Loading...</Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Meetings</h1>
          <p className="text-gray-600">Meetings assigned to you</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
            <p className="text-gray-600 text-sm">Upcoming Meetings</p>
          </Card>
          <Card>
            <div className="text-3xl font-bold text-green-600 mb-2">0</div>
            <p className="text-gray-600 text-sm">Meetings Attended</p>
          </Card>
          <Card>
            <div className="text-3xl font-bold text-purple-600 mb-2">0%</div>
            <p className="text-gray-600 text-sm">Your Attendance Rate</p>
          </Card>
        </div>

        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Meetings</h2>
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">📅 No upcoming meetings</p>
            <p className="text-sm mt-2">Check back soon for meetings you'll need to attend</p>
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Check In</h2>
          <ol className="space-y-3 text-gray-600">
            <li className="flex gap-4">
              <span className="font-bold text-blue-600 flex-shrink-0">1</span>
              <span>Open your Android app when a meeting is available</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-blue-600 flex-shrink-0">2</span>
              <span>Tap on a meeting to view details</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-blue-600 flex-shrink-0">3</span>
              <span>Use your phone camera to scan the QR code</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-blue-600 flex-shrink-0">4</span>
              <span>Confirm your attendance to complete check-in</span>
            </li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
