'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/route-guard';
import { Card } from '@/components/FormElements';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getMeetingsByAttendee, Meeting } from '@/lib/meeting-service';
import Link from 'next/link';

export default function MeetingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getMeetingsByAttendee(user.uid)
      .then(setMeetings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) return <LoadingSpinner />;

  const checkedInCount = meetings.filter((m) =>
    m.attendees?.some((att) => att.uid === user?.uid && att.checkedIn)
  ).length;
  const rate = meetings.length > 0 ? Math.round((checkedInCount / meetings.length) * 100) : 0;

  return (
    <ProtectedRoute requiredRole="attendee">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Meetings</h1>
            <p className="text-gray-600">Meetings assigned to you — tap one to check in</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <div className="text-3xl font-bold text-blue-600 mb-1">{meetings.length}</div>
              <p className="text-gray-600 text-sm">Total</p>
            </Card>
            <Card>
              <div className="text-3xl font-bold text-green-600 mb-1">{checkedInCount}</div>
              <p className="text-gray-600 text-sm">Attended</p>
            </Card>
            <Card>
              <div className="text-3xl font-bold text-purple-600 mb-1">{rate}%</div>
              <p className="text-gray-600 text-sm">Rate</p>
            </Card>
          </div>

          {/* Meeting list */}
          {meetings.length === 0 ? (
            <Card>
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-3">📅</p>
                <p className="text-lg font-medium">No meetings yet</p>
                <p className="text-sm mt-1">You'll appear here once HR assigns you to a meeting</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => {
                const myRecord = meeting.attendees?.find((a) => a.uid === user?.uid);
                const checked = myRecord?.checkedIn ?? false;
                return (
                  <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                    <Card className="hover:shadow-md transition cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{meeting.title}</h3>
                          <p className="text-sm text-gray-700 mt-0.5">
                            {meeting.date} at {meeting.time} · {meeting.venue}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          {checked ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              ✓ Checked In
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                              📷 Scan to Check In
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

