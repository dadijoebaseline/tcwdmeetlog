'use client';

import { useState } from 'react';
import { Input, Card, Select } from './FormElements';
import { Button } from './Button';
import { Meeting } from '@/lib/meeting-service';

interface MeetingFormProps {
  initialData?: Meeting;
  onSubmit: (data: {
    title: string;
    date: string;
    time: string;
    venue: string;
    description?: string;
  }) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
}

export function MeetingForm({
  initialData,
  onSubmit,
  submitLabel = 'Create Meeting',
  isLoading = false,
}: MeetingFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    date: initialData?.date || '',
    time: initialData?.time || '',
    venue: initialData?.venue || '',
    description: initialData?.description || '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Meeting title is required');
      return;
    }
    if (!formData.date) {
      setError('Meeting date is required');
      return;
    }
    if (!formData.time) {
      setError('Meeting time is required');
      return;
    }
    if (!formData.venue.trim()) {
      setError('Venue is required');
      return;
    }

    try {
      await onSubmit(formData);
      setSuccess(true);
      if (!initialData) {
        setFormData({
          title: '',
          date: '',
          time: '',
          venue: '',
          description: '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save meeting');
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Title *
          </label>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Monthly Team Sync"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time *
            </label>
            <Input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Venue *
          </label>
          <Input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            placeholder="e.g., Conference Room A"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add any additional details about this meeting..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              Meeting {initialData ? 'updated' : 'created'} successfully!
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? '...' : submitLabel}
          </Button>
          <Button type="button" variant="secondary" disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
