'use client';

import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/route-guard';
import { Card } from '@/components/FormElements';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-2">View and manage your account information</p>
            </div>
            <Link href="/profile/edit">
              <Button>Edit Profile</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 mt-1">{profile?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900 mt-1">{profile?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <p className="text-gray-900 mt-1 capitalize">
                    {profile?.role === 'hr' ? 'HR Manager' : 'Attendee'}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <p className="text-gray-900 mt-1">{profile?.department || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Position</label>
                  <p className="text-gray-900 mt-1">{profile?.position || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Account Created</label>
                  <p className="text-gray-900 mt-1">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : 'Unknown'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {profile?.role === 'attendee' && (
            <Card className="mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Digital Signature</h2>
              <div className="flex flex-col items-center">
                {profile?.digitalSignature ? (
                  <div className="w-full flex flex-col items-center">
                    <img
                      src={profile.digitalSignature}
                      alt="Digital Signature"
                      className="border-2 border-gray-300 rounded-lg p-4 bg-white"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                    <p className="text-xs text-gray-500 mt-3">Your signature as captured during account setup</p>
                  </div>
                ) : (
                  <p className="text-gray-600">No signature on file</p>
                )}
              </div>
            </Card>
          )}

          <Card className="mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Account Status</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Current Status</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {profile?.isActive !== false ? '✓ Active' : '✗ Inactive'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Last Login</p>
                <p className="text-gray-900 mt-2">
                  {profile?.lastLoginAt
                    ? new Date(profile.lastLoginAt).toLocaleString()
                    : 'Just now'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
