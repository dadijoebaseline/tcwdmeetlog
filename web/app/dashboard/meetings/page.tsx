'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/route-guard';
import {
  getMeetingsByCreator,
  Meeting,
  getMeetingAttendanceSummary,
  searchMeetings,
  filterMeetingsByDateRange,
} from '@/lib/meeting-service';
import { Card } from '@/components/FormElements';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function MeetingsListPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>(
    'active'
  );
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summaries, setSummaries] = useState<
    Record<string, Awaited<ReturnType<typeof getMeetingAttendanceSummary>>>
  >({});

  useEffect(() => {
    if (!user) return;

    const loadMeetings = async () => {
      try {
        setLoading(true);
        const data = await getMeetingsByCreator(user.uid);
        setMeetings(data);

        // Load attendance summaries
        const newSummaries: Record<string, any> = {};
        for (const meeting of data) {
          const summary = await getMeetingAttendanceSummary(meeting.id);
          newSummaries[meeting.id] = summary;
        }
        setSummaries(newSummaries);
      } catch (error) {
        console.error('Failed to load meetings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMeetings();
  }, [user]);

  if (loading) return <LoadingSpinner />;

  let filteredMeetings = meetings;

  // Apply status filter
  if (statusFilter !== 'all') {
    filteredMeetings = filteredMeetings.filter(
      (m) => m.status === statusFilter
    );
  }

  // Apply search
  if (searchTerm) {
    filteredMeetings = searchMeetings(filteredMeetings, searchTerm);
  }

  // Apply date range filter
  if (startDate && endDate) {
    filteredMeetings = filterMeetingsByDateRange(
      filteredMeetings,
      startDate,
      endDate
    );
  }

  return (
    <ProtectedRoute requiredRole="hr">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">Meetings</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage your meetings and track attendance</p>
            </div>
            <Link href="/dashboard/meetings/create" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto">➕ Create Meeting</Button>
            </Link>
          </div>

          <Card className="mb-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex gap-2 sm:gap-4">
                <input
                  type="text"
                  placeholder="Search meetings by title or venue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as 'all' | 'active' | 'archived'
                    )
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Meetings</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>

                <input
                  type="date"
                  placeholder="Start date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />

                <input
                  type="date"
                  placeholder="End date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />

                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Clear Dates
                </button>
              </div>
            </div>
          </Card>

          {filteredMeetings.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No meetings found</p>
                <Link href="/dashboard/meetings/create">
                  <Button variant="primary">Create Your First Meeting</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredMeetings.map((meeting) => {
                const summary = summaries[meeting.id];
                return (
                  <Card key={meeting.id} className="hover:shadow-lg transition">
                    <Link href={`/dashboard/meetings/${meeting.id}`}>
                      <div className="cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">
                              {meeting.title}
                            </h3>
                            <p className="text-gray-600">{meeting.venue}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              meeting.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {meeting.status === 'active' ? '🟢 Active' : '⚪ Archived'}
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-sm text-gray-600">Date</p>
                            <p className="font-semibold text-gray-900">{meeting.date}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Time</p>
                            <p className="font-semibold text-gray-900">{meeting.time}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Attendees</p>
                            <p className="font-semibold text-gray-900">
                              {summary ? `${summary.checkedIn}/${summary.total}` : '0/0'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Attendance</p>
                            <p className="font-semibold text-gray-900">
                              {summary ? `${summary.attendanceRate}%` : '0%'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
