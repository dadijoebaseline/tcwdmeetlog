'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/route-guard';
import { Card } from '@/components/FormElements';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getMeetingsByCreator, getMeetingAttendanceSummary, Meeting } from '@/lib/meeting-service';
import { getUserStats } from '@/lib/user-service';

export default function ReportsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [summaries, setSummaries] = useState<Record<string, any>>({});
  const [userStats, setUserStats] = useState({ totalUsers: 0, hrCount: 0, attendeeCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        setLoading(true);
        const [meetingData, stats] = await Promise.all([
          getMeetingsByCreator(user.uid),
          getUserStats(),
        ]);
        setMeetings(meetingData);
        setUserStats(stats);

        const newSummaries: Record<string, any> = {};
        for (const m of meetingData) {
          newSummaries[m.id] = await getMeetingAttendanceSummary(m.id);
        }
        setSummaries(newSummaries);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <LoadingSpinner />;

  const totalMeetings = meetings.length;
  const activeMeetings = meetings.filter((m) => m.status === 'active').length;
  const totalCheckins = Object.values(summaries).reduce(
    (acc: number, s: any) => acc + (s?.checkedIn || 0),
    0
  );
  const avgRate =
    totalMeetings > 0
      ? Math.round(
          Object.values(summaries).reduce(
            (acc: number, s: any) => acc + (s?.attendanceRate || 0),
            0
          ) / totalMeetings
        )
      : 0;

  return (
    <ProtectedRoute requiredRole="hr">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-1">Attendance overview and meeting statistics</p>
          </div>

          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Card>
              <div className="text-3xl font-bold text-blue-600 mb-1">{totalMeetings}</div>
              <p className="text-gray-600 text-sm">Total Meetings</p>
            </Card>
            <Card>
              <div className="text-3xl font-bold text-green-600 mb-1">{activeMeetings}</div>
              <p className="text-gray-600 text-sm">Active Meetings</p>
            </Card>
            <Card>
              <div className="text-3xl font-bold text-purple-600 mb-1">{totalCheckins}</div>
              <p className="text-gray-600 text-sm">Total Check-ins</p>
            </Card>
            <Card>
              <div className="text-3xl font-bold text-orange-600 mb-1">{avgRate}%</div>
              <p className="text-gray-600 text-sm">Avg Attendance Rate</p>
            </Card>
          </div>

          {/* User Stats */}
          <Card className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">User Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-700">{userStats.totalUsers}</p>
                <p className="text-sm text-gray-600 mt-1">Total Registered Users</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-purple-700">{userStats.hrCount}</p>
                <p className="text-sm text-gray-600 mt-1">HR Managers</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-700">{userStats.attendeeCount}</p>
                <p className="text-sm text-gray-600 mt-1">Attendees</p>
              </div>
            </div>
          </Card>

          {/* Meeting Breakdown Table */}
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Meeting Attendance Breakdown</h2>
            {meetings.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No meetings yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Meeting</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Invited</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Checked In</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meetings.map((meeting) => {
                      const s = summaries[meeting.id];
                      return (
                        <tr key={meeting.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900 font-medium">{meeting.title}</td>
                          <td className="py-3 px-4 text-gray-600">{meeting.date}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              meeting.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {meeting.status === 'active' ? 'Active' : 'Archived'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{s?.total ?? 0}</td>
                          <td className="py-3 px-4 text-gray-600">{s?.checkedIn ?? 0}</td>
                          <td className="py-3 px-4">
                            <span className={`font-semibold ${
                              (s?.attendanceRate ?? 0) >= 80
                                ? 'text-green-600'
                                : (s?.attendanceRate ?? 0) >= 50
                                ? 'text-orange-600'
                                : 'text-red-600'
                            }`}>
                              {s?.attendanceRate ?? 0}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
