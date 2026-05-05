'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/route-guard';
import { getMeeting, Meeting, recordAttendeeCheckIn } from '@/lib/meeting-service';
import { Card } from '@/components/FormElements';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { QRScanner } from '@/components/QRScanner';
import Link from 'next/link';

export default function AttendeeMeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<'idle' | 'success' | 'error' | 'wrong-meeting'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    getMeeting(meetingId)
      .then(setMeeting)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [meetingId]);

  const myRecord = meeting?.attendees?.find((a) => a.uid === user?.uid);
  const alreadyCheckedIn = myRecord?.checkedIn ?? false;

  const handleScan = async (raw: string) => {
    setShowScanner(false);
    try {
      // QR payload: { meetingId, meetingTitle, timestamp }
      const payload = JSON.parse(raw);
      const scannedId = payload?.meetingId;

      if (!scannedId) {
        setCheckInStatus('error');
        setErrorMsg('Invalid QR code — not a meeting QR code.');
        return;
      }

      if (scannedId !== meetingId) {
        setCheckInStatus('wrong-meeting');
        setErrorMsg(`This QR code belongs to a different meeting ("${payload?.meetingTitle || scannedId}").`);
        return;
      }

      if (!user) return;
      await recordAttendeeCheckIn(meetingId, user.uid);
      const updated = await getMeeting(meetingId);
      if (updated) setMeeting(updated);
      setCheckInStatus('success');
    } catch {
      setCheckInStatus('error');
      setErrorMsg('Could not read QR code. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!meeting) {
    return (
      <ProtectedRoute requiredRole="attendee">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <Card>
            <p className="text-gray-600 mb-4">Meeting not found.</p>
            <Link href="/meetings" className="text-blue-600 hover:underline">← Back to My Meetings</Link>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  // Guard: attendee must be in the meeting
  if (!myRecord) {
    return (
      <ProtectedRoute requiredRole="attendee">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <Card>
            <p className="text-gray-600 mb-4">You are not assigned to this meeting.</p>
            <Link href="/meetings" className="text-blue-600 hover:underline">← Back to My Meetings</Link>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="attendee">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-xl mx-auto px-4 py-12">

          {/* Back */}
          <Link href="/meetings" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
            ← Back to My Meetings
          </Link>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{meeting.title}</h1>
            <p className="text-gray-500 mt-1">{meeting.venue}</p>
          </div>

          {/* Meeting info card */}
          <Card className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                <p className="text-gray-900 font-medium mt-0.5">{meeting.date}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Time</p>
                <p className="text-gray-900 font-medium mt-0.5">{meeting.time}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Venue</p>
                <p className="text-gray-900 font-medium mt-0.5">{meeting.venue}</p>
              </div>
              {meeting.description && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Notes</p>
                  <p className="text-gray-700 mt-0.5 text-sm">{meeting.description}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Check-in card */}
          <Card>
            <div className="text-center">
              {alreadyCheckedIn ? (
                <>
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold text-green-700 mb-1">You're Checked In!</h2>
                  <p className="text-gray-500 text-sm">
                    Checked in at{' '}
                    {myRecord?.checkInTime
                      ? new Date(myRecord.checkInTime.toMillis()).toLocaleString()
                      : '—'}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">📷</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan to Check In</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Ask the meeting organizer to show the QR code, then tap the button below to scan it with your camera.
                  </p>

                  {checkInStatus === 'success' && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                      ✓ Check-in recorded successfully!
                    </div>
                  )}
                  {(checkInStatus === 'error' || checkInStatus === 'wrong-meeting') && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    onClick={() => { setCheckInStatus('idle'); setShowScanner(true); }}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-lg transition shadow-md shadow-blue-200"
                  >
                    📷 Open Camera & Scan QR Code
                  </button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {showScanner && (
        <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
    </ProtectedRoute>
  );
}
