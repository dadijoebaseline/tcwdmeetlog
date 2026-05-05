'use client';

import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/route-guard';
import { Card } from '@/components/FormElements';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useEffect, useState } from 'react';
import { getMeetingStats, getMeetingsByCreator } from '@/lib/meeting-service';

export default function DashboardPage() {
  const { profile, loading: authLoading } = useAuth();
  const { user } = useAuth();
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getMeetingStats>> | null>(null);
  const [recentMeetings, setRecentMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        setLoading(true);
        const meetingStats = await getMeetingStats(user.uid);
        setStats(meetingStats);

        const meetings = await getMeetingsByCreator(user.uid);
        setRecentMeetings(meetings.slice(0, 5)); // Last 5 meetings
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  if (authLoading || loading) return <LoadingSpinner />;

  return (
    <ProtectedRoute requiredRole="hr">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome, {profile?.name || 'HR Manager'}
            </h1>
            <p className="text-gray-600">
              Manage meetings, track attendance, and supervise your team
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats?.totalMeetings || 0}
              </div>
              <p className="text-gray-600 text-sm">Total Meetings</p>
            </Card>
            <Card>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats?.activeMeetings || 0}
              </div>
              <p className="text-gray-600 text-sm">Active Meetings</p>
            </Card>
            <Card>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats?.totalAttendees || 0}
              </div>
              <p className="text-gray-600 text-sm">Total Attendees</p>
            </Card>
            <Card>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {stats?.averageAttendanceRate || 0}%
              </div>
              <p className="text-gray-600 text-sm">Avg Attendance Rate</p>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Meetings</h2>
                  <p className="text-gray-600 text-sm">Create and manage your meetings</p>
                </div>
              </div>
              <div className="space-y-2">
                <Link href="/dashboard/meetings/create">
                  <Button className="w-full">Create New Meeting</Button>
                </Link>
                <Link href="/dashboard/meetings">
                  <Button variant="secondary" className="w-full">View All Meetings</Button>
                </Link>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                  <p className="text-gray-600 text-sm">View and manage system users</p>
                </div>
              </div>
              <div className="space-y-2">
                <Link href="/dashboard/users">
                  <Button className="w-full">Manage Users</Button>
                </Link>
                <Link href="/dashboard/reports">
                  <Button variant="secondary" className="w-full">View Reports</Button>
                </Link>
              </div>
            </Card>
          </div>

          {recentMeetings.length > 0 && (
            <Card className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Meetings</h2>
              <div className="space-y-3">
                {recentMeetings.map((meeting) => (
                  <Link key={meeting.id} href={`/dashboard/meetings/${meeting.id}`}>
                    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{meeting.title}</p>
                          <p className="text-sm text-gray-600">
                            {meeting.date} at {meeting.time} • {meeting.venue}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            meeting.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {meeting.status === 'active' ? 'Active' : 'Archived'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Quick Actions</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/dashboard/meetings/create" className="text-blue-600 hover:text-blue-700 font-medium">
                    ➕ Create a meeting
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/meetings" className="text-blue-600 hover:text-blue-700 font-medium">
                    📅 View all meetings
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/users" className="text-blue-600 hover:text-blue-700 font-medium">
                    👥 View all users
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="text-blue-600 hover:text-blue-700 font-medium">
                    ⚙️ Edit profile
                  </Link>
                </li>
              </ul>
            </Card>

            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">🚀 Getting Started</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li>1. Create a meeting with date and time</li>
                <li>2. Assign attendees to the meeting</li>
                <li>3. Generate QR code for check-in</li>
                <li>4. Share QR code with attendees</li>
                <li>5. Track attendance in real-time</li>
                <li>6. Export reports to PDF</li>
              </ol>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
