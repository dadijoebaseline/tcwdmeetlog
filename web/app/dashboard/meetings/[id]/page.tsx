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
  const [selectedAttendees, setSelectedAttendees] = useState<Set<string>>(new Set());
  const [addingAttendees, setAddingAttendees] = useState(false);

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
    if (selectedAttendees.size === 0) return;

    setAddingAttendees(true);
    try {
      // Add all selected attendees
      for (const uid of selectedAttendees) {
        const userToAdd = availableUsers.find((u) => u.uid === uid);
        if (userToAdd) {
          await addMeetingAttendee(meetingId, {
            uid: userToAdd.uid,
            name: userToAdd.name,
            email: userToAdd.email,
            checkedIn: false,
          });
        }
      }

      // Refresh meeting data
      const updated = await getMeeting(meetingId);
      if (updated) setMeeting(updated);
      
      // Reset
      setShowAddAttendee(false);
      setSelectedAttendees(new Set());
    } catch (error) {
      console.error('Failed to add attendees:', error);
    } finally {
      setAddingAttendees(false);
    }
  };

  const handleToggleAttendee = (uid: string) => {
    const newSelected = new Set(selectedAttendees);
    if (newSelected.has(uid)) {
      newSelected.delete(uid);
    } else {
      newSelected.add(uid);
    }
    setSelectedAttendees(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedAttendees.size === usersNotInMeeting.length) {
      setSelectedAttendees(new Set());
    } else {
      setSelectedAttendees(new Set(usersNotInMeeting.map(u => u.uid)));
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
        topics: meeting.topics,
        description: meeting.description,
        resourceSpeaker: meeting.resourceSpeaker,
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
            <div className="flex gap-2 sm:gap-4 border-b border-gray-200 overflow-x-auto">
              {(['info', 'attendees', 'attendance'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 sm:px-4 py-2 font-medium text-sm sm:text-base border-b-2 transition whitespace-nowrap ${
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
                {meeting.resourceSpeaker && (
                  <div>
                    <p className="text-sm text-gray-600">Resource Speaker</p>
                    <p className="text-xl font-semibold text-gray-900">{meeting.resourceSpeaker}</p>
                  </div>
                )}
              </div>

              {meeting.description && (
                <div className="mb-8">
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-gray-900">{meeting.description}</p>
                </div>
              )}

              <div className="pt-6 sm:pt-8 border-t border-gray-200">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">
                  QR Codes for Check-in & Check-out
                </h3>
                <QRCodeDisplay meetingId={meeting.id} meetingTitle={meeting.title} showBoth={true} />
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
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Select Attendees to Add ({selectedAttendees.size})
                    </h4>
                    
                    {usersNotInMeeting.length > 0 ? (
                      <>
                        <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedAttendees.size === usersNotInMeeting.length && usersNotInMeeting.length > 0}
                              onChange={handleSelectAll}
                              className="w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer"
                            />
                            <span className="font-medium text-gray-900">
                              Select All ({usersNotInMeeting.length})
                            </span>
                          </label>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto bg-white rounded-lg border border-gray-200 p-3">
                          {usersNotInMeeting.map((user) => (
                            <label key={user.uid} className="flex items-start gap-3 p-2 hover:bg-blue-50 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedAttendees.has(user.uid)}
                                onChange={() => handleToggleAttendee(user.uid)}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer mt-0.5"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                                <p className="text-xs text-gray-600 truncate">{user.email}</p>
                                {user.department && (
                                  <p className="text-xs text-gray-500">{user.department}</p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-600 text-sm">All users are already attendees</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddAttendee} 
                      variant="primary"
                      disabled={selectedAttendees.size === 0 || addingAttendees}
                    >
                      {addingAttendees ? 'Adding...' : `Add ${selectedAttendees.size > 0 ? selectedAttendees.size : ''} Attendee${selectedAttendees.size !== 1 ? 's' : ''}`}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAddAttendee(false);
                        setSelectedAttendees(new Set());
                      }}
                      variant="secondary"
                      disabled={addingAttendees}
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
                        <td className="py-3 px-4 text-gray-900">{attendee.name}</td>
                        <td className="py-3 px-4 text-gray-900">{attendee.email}</td>
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
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Check-out Time
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
                        <td className="py-3 px-4 font-medium text-gray-900">{attendee.name}</td>
                        <td className="py-3 px-4 text-gray-900">{attendee.email}</td>
                        <td className="py-3 px-4">
                          {attendee.checkedIn ? (
                            <span className="text-green-600 font-medium">
                              ✓ Checked In
                            </span>
                          ) : (
                            <span className="text-gray-500">Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {attendee.checkInTime
                            ? new Date(
                                attendee.checkInTime.toDate()
                              ).toLocaleTimeString()
                            : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {attendee.checkedOut && attendee.checkOutTime
                            ? new Date(
                                attendee.checkOutTime.toDate()
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
