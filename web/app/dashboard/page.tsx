'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card } from '@/components/FormElements';
import { Button } from '@/components/Button';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || role !== 'hr')) {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">HR Dashboard</h1>
          <p className="text-gray-600">Manage meetings and track attendance</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
            <p className="text-gray-600 text-sm">Active Meetings</p>
          </Card>
          <Card>
            <div className="text-3xl font-bold text-green-600 mb-2">0</div>
            <p className="text-gray-600 text-sm">Total Attendees</p>
          </Card>
          <Card>
            <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
            <p className="text-gray-600 text-sm">Check-ins Today</p>
          </Card>
          <Card>
            <div className="text-3xl font-bold text-orange-600 mb-2">0%</div>
            <p className="text-gray-600 text-sm">Attendance Rate</p>
          </Card>
        </div>

        <Card className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Meetings</h2>
              <p className="text-gray-600">Create and manage your meetings</p>
            </div>
            <Link href="/dashboard/meetings/create">
              <Button>Create Meeting</Button>
            </Link>
          </div>
        </Card>

        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Meetings</h2>
          <div className="text-center py-12 text-gray-500">
            <p>No meetings yet</p>
            <p className="text-sm">Create your first meeting to get started</p>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Quick Links</h3>
            <div className="space-y-2">
              <Link href="/dashboard/meetings" className="block text-blue-600 hover:text-blue-700">
                View all meetings →
              </Link>
              <Link href="/dashboard/reports" className="block text-blue-600 hover:text-blue-700">
                View reports →
              </Link>
              <Link href="/dashboard/attendees" className="block text-blue-600 hover:text-blue-700">
                Manage attendees →
              </Link>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">🚀 Getting Started</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>1. Create a meeting with date and time</li>
              <li>2. Assign attendees to the meeting</li>
              <li>3. Generate QR code for the meeting</li>
              <li>4. Share QR code with attendees</li>
              <li>5. Track attendance in real-time</li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
