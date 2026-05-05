'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/route-guard';
import { createMeeting, updateMeetingQRCode } from '@/lib/meeting-service';
import { MeetingForm } from '@/components/MeetingForm';
import { Card } from '@/components/FormElements';
import { QRCodeSVG } from 'qrcode.react';

export default function CreateMeetingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);

  const handleCreateMeeting = async (data: {
    title: string;
    date: string;
    time: string;
    venue: string;
    description?: string;
  }) => {
    if (!user) {
      alert('You must be logged in to create a meeting');
      return;
    }

    try {
      setIsLoading(true);

      // Create meeting
      const meetingId = await createMeeting({
        ...data,
        createdBy: user.uid,
      });

      // Generate QR code (stored as SVG reference)
      const qrValue = JSON.stringify({
        meetingId,
        meetingTitle: data.title,
        timestamp: new Date().toISOString(),
      });

      // Store QR code reference in Firestore (actual SVG generated on-demand)
      await updateMeetingQRCode(meetingId, qrValue);

      // Redirect to meeting detail page
      router.push(`/dashboard/meetings/${meetingId}`);
    } catch (error) {
      console.error('Failed to create meeting:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="hr">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Create New Meeting
            </h1>
            <p className="text-gray-600">
              Set up meeting details and generate a QR code for attendees
            </p>
          </div>

          <MeetingForm
            onSubmit={handleCreateMeeting}
            submitLabel="Create Meeting"
            isLoading={isLoading}
          />

          {generatedQR && (
            <Card className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">QR Code</h2>
              <div className="flex justify-center">
                <QRCodeSVG value={generatedQR} size={256} />
              </div>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
