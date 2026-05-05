'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/route-guard';
import {
  getMeeting,
  Meeting,
  getMeetingAttendanceSummary,
  addMeetingAttendee,
  removeMeetingAttendee,
  archiveMeeting,
  deleteMeeting,
  recordAttendeeCheckIn,
} from '@/lib/meeting-service';
import { getAllUsers } from '@/lib/user-service';
import { UserProfile } from '@/lib/auth-context';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { Card } from '@/components/FormElements';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { exportAttendancePDF } from '@/lib/pdf-export';
import Link from 'next/link';

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'attendees' | 'attendance'>(
    'info'
  );
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [attendance, setAttendance] = useState<Awaited<
    ReturnType<typeof getMeetingAttendanceSummary>
  > | null>(null);
  const [showAddAttendee, setShowAddAttendee] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<string>('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadMeetingData = async () => {
      try {
        setLoading(true);
        const meetingData = await getMeeting(meetingId);
        setMeeting(meetingData);

        if (meetingData) {
          const summary = await getMeetingAttendanceSummary(meetingId);
          setAttendance(summary);

          const users = await getAllUsers();
          setAvailableUsers(users);
        }
      } catch (error) {
        console.error('Failed to load meeting:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMeetingData();
  }, [meetingId]);

  if (loading) return <LoadingSpinner />;
  if (!meeting) {
    return (
      <ProtectedRoute requiredRole="hr">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card>
            <p className="text-gray-600 mb-4">Meeting not found</p>
            <Link href="/dashboard/meetings">
              <Button variant="primary">Back to Meetings</Button>
            </Link>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  const handleAddAttendee = async () => {
    if (!selectedAttendee) return;

    const userToAdd = availableUsers.find((u) => u.uid === selectedAttendee);
    if (!userToAdd) return;

    try {
      await addMeetingAttendee(meetingId, {
        uid: userToAdd.uid,
        name: userToAdd.name,
        email: userToAdd.email,
        checkedIn: false,
      });

      const updated = await getMeeting(meetingId);
      if (updated) setMeeting(updated);
      setShowAddAttendee(false);
      setSelectedAttendee('');
    } catch (error) {
      console.error('Failed to add attendee:', error);
    }
  };

  const handleRemoveAttendee = async (attendeeUid: string) => {
    try {
      await removeMeetingAttendee(meetingId, attendeeUid);
      const updated = await getMeeting(meetingId);
      if (updated) setMeeting(updated);
    } catch (error) {
      console.error('Failed to remove attendee:', error);
    }
  };

  const handleRecordCheckIn = async (attendeeUid: string) => {
    try {
      await recordAttendeeCheckIn(meetingId, attendeeUid);
      const updated = await getMeeting(meetingId);
      if (updated) setMeeting(updated);
    } catch (error) {
      console.error('Failed to record check-in:', error);
    }
  };

  const handleArchive = async () => {
    if (confirm('Archive this meeting?')) {
      try {
        await archiveMeeting(meetingId);
        router.push('/dashboard/meetings');
      } catch (error) {
        console.error('Failed to archive meeting:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (confirm('Delete this meeting? This cannot be undone.')) {
      try {
        await deleteMeeting(meetingId);
        router.push('/dashboard/meetings');
      } catch (error) {
        console.error('Failed to delete meeting:', error);
      }
    }
  };

  const usersNotInMeeting = availableUsers.filter(
    (u) => !meeting.attendees.find((att) => att.uid === u.uid)
  );

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await exportAttendancePDF({
        title: meeting.title,
        venue: meeting.venue,
        date: meeting.date,
        time: meeting.time,
        description: meeting.description,
        attendees: meeting.attendees,
        allUsers: availableUsers,
      });
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="hr">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{meeting.title}</h1>
              <p className="text-gray-600 mt-2">{meeting.venue}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="primary"
                onClick={handleExportPDF}
                disabled={exporting}
              >
                {exporting ? '⏳ Exporting…' : '📄 Export PDF'}
              </Button>
              <Link href={`/dashboard/meetings/${meeting.id}/edit`}>
                <Button variant="secondary">✏️ Edit</Button>
              </Link>
              <Button variant="ghost" onClick={handleArchive}>
                📦 Archive
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                🗑️ Delete
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex gap-4 border-b border-gray-200">
              {(['info', 'attendees', 'attendance'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium border-b-2 transition ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'info' && (
            <Card>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="text-xl font-semibold text-gray-900">{meeting.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="text-xl font-semibold text-gray-900">{meeting.time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Venue</p>
                  <p className="text-xl font-semibold text-gray-900">{meeting.venue}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      meeting.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {meeting.status === 'active' ? '🟢 Active' : '⚪ Archived'}
                  </span>
                </div>
              </div>

              {meeting.description && (
                <div className="mb-8">
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-gray-900">{meeting.description}</p>
                </div>
              )}

              <div className="pt-8 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  QR Code for Check-in
                </h3>
                <QRCodeDisplay meetingId={meeting.id} meetingTitle={meeting.title} />
              </div>
            </Card>
          )}

          {activeTab === 'attendees' && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Attendees ({meeting.attendees.length})
                </h3>
                <Button onClick={() => setShowAddAttendee(!showAddAttendee)}>
                  ➕ Add Attendee
                </Button>
              </div>

              {showAddAttendee && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <select
                    value={selectedAttendee}
                    onChange={(e) => setSelectedAttendee(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                  >
                    <option value="">Select an attendee...</option>
                    {usersNotInMeeting.map((user) => (
                      <option key={user.uid} value={user.uid}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button onClick={handleAddAttendee} variant="primary">
                      Add
                    </Button>
                    <Button
                      onClick={() => setShowAddAttendee(false)}
                      variant="secondary"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {meeting.attendees.map((attendee) => (
                      <tr
                        key={attendee.uid}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">{attendee.name}</td>
                        <td className="py-3 px-4">{attendee.email}</td>
                        <td className="py-3 px-4">
                          {attendee.checkedIn ? (
                            <span className="text-green-600 font-medium">
                              ✓ Checked In
                            </span>
                          ) : (
                            <span className="text-gray-500">Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          {!attendee.checkedIn && (
                            <Button
                              variant="primary"
                              onClick={() => handleRecordCheckIn(attendee.uid)}
                            >
                              Check In
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            onClick={() => handleRemoveAttendee(attendee.uid)}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === 'attendance' && (
            <Card>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Attendees</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {attendance?.total || 0}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Checked In</p>
                  <p className="text-3xl font-bold text-green-600">
                    {attendance?.checkedIn || 0}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Absent</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {attendance?.absent || 0}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {attendance?.attendanceRate || 0}%
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Check-in Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {meeting.attendees.map((attendee) => (
                      <tr
                        key={attendee.uid}
                        className={`border-b border-gray-100 ${
                          attendee.checkedIn ? 'bg-green-50' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-medium">{attendee.name}</td>
                        <td className="py-3 px-4">{attendee.email}</td>
                        <td className="py-3 px-4">
                          {attendee.checkedIn ? (
                            <span className="text-green-600 font-medium">
                              ✓ Checked In
                            </span>
                          ) : (
                            <span className="text-gray-500">Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {attendee.checkInTime
                            ? new Date(
                                attendee.checkInTime.toDate()
                              ).toLocaleTimeString()
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
