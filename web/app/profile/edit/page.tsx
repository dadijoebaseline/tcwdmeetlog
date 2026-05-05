'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/route-guard';
import { Card, Input } from '@/components/FormElements';
import { Button } from '@/components/Button';
import { SignaturePad } from '@/components/SignaturePad';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function EditProfilePage() {
  const { user, profile, loading, updateProfile } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    department: profile?.department || '',
    position: profile?.position || '',
    digitalSignature: profile?.digitalSignature || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (loading) return <LoadingSpinner />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile({
        name: formData.name,
        department: formData.department,
        position: formData.position,
        digitalSignature: formData.digitalSignature,
      });

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8">Edit Profile</h1>

          <Card>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email"
                type="email"
                value={profile?.email || ''}
                disabled
                helperText="Email cannot be changed"
              />

              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Water Quality"
              />

              <Input
                label="Position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g., Technician"
              />

              {(profile?.role === 'attendee' || profile?.role === 'hr') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Digital Signature
                  </label>
                  <p className="text-xs text-gray-600 mb-3">{profile?.role === 'hr' ? 'Set your signature for approval documents by drawing in the box below' : 'Update your signature by drawing in the box below'}</p>
                  <SignaturePad
                    onSignatureChange={(sig) => setFormData({ ...formData, digitalSignature: sig })}
                    onClear={() => setFormData({ ...formData, digitalSignature: '' })}
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button type="submit" isLoading={saving} className="flex-1 sm:flex-none">
                  Save Changes
                </Button>
                <Link href="/profile" className="flex-1 sm:flex-none">
                  <Button variant="secondary" className="w-full">Cancel</Button>
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
