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
    topics?: string[];
    resourceSpeaker?: string;
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
    topics: initialData?.topics || [''],
    resourceSpeaker: initialData?.resourceSpeaker || '',
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
          topics: [''],
          resourceSpeaker: '',
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
            Resource Speaker (optional)
          </label>
          <Input
            type="text"
            name="resourceSpeaker"
            value={formData.resourceSpeaker}
            onChange={handleChange}
            placeholder="e.g., Dr. John Smith"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topics / Agenda (optional)
          </label>
          <p className="text-xs text-gray-600 mb-3">Add one or more agenda topics. Each topic will appear on a separate line in the PDF export.</p>
          
          <div className="space-y-3">
            {formData.topics.map((topic, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => {
                    const newTopics = [...formData.topics];
                    newTopics[index] = e.target.value;
                    setFormData((prev) => ({ ...prev, topics: newTopics }));
                  }}
                  placeholder={`Topic ${index + 1}...`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                {formData.topics.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newTopics = formData.topics.filter((_, i) => i !== index);
                      setFormData((prev) => ({ ...prev, topics: newTopics }));
                    }}
                    className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium text-sm transition"
                    disabled={isLoading}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, topics: [...prev.topics, ''] }));
            }}
            className="mt-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium text-sm transition"
            disabled={isLoading}
          >
            + Add Topic
          </button>
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
