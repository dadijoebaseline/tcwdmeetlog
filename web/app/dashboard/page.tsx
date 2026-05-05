'use client';

import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/route-guard';
import { Card } from '@/components/FormElements';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function DashboardPage() {
  const { profile, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

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

          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="text-center py-12 text-gray-500">
              <p>No recent meetings yet</p>
              <p className="text-sm">Create your first meeting to get started</p>
            </div>
          </Card>

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
                  <Link href="/dashboard/users" className="text-blue-600 hover:text-blue-700 font-medium">
                    👥 View all users
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/reports" className="text-blue-600 hover:text-blue-700 font-medium">
                    📊 Generate reports
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
