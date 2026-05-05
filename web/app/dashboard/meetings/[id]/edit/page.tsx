'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/route-guard';
import { getMeeting, updateMeeting, Meeting } from '@/lib/meeting-service';
import { MeetingForm } from '@/components/MeetingForm';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function EditMeetingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadMeeting = async () => {
      try {
        setLoading(true);
        const data = await getMeeting(meetingId);
        setMeeting(data);
      } catch (error) {
        console.error('Failed to load meeting:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMeeting();
  }, [meetingId]);

  const handleUpdateMeeting = async (data: {
    title: string;
    date: string;
    time: string;
    venue: string;
    description?: string;
  }) => {
    if (!meeting) return;
    try {
      setIsSubmitting(true);
      await updateMeeting(meetingId, { ...data });
      router.push(`/dashboard/meetings/${meetingId}`);
    } catch (error) {
      console.error('Failed to update meeting:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!meeting) {
    return (
      <ProtectedRoute requiredRole="hr">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Meeting not found</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="hr">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Edit Meeting</h1>
            <p className="text-gray-600">Update meeting details</p>
          </div>
          <MeetingForm
            initialData={meeting}
            onSubmit={handleUpdateMeeting}
            submitLabel="Update Meeting"
            isLoading={isSubmitting}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
