'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/Button';
import { Card, Input } from '@/components/FormElements';
import { SignaturePad } from '@/components/SignaturePad';

function RoleSelectForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uid = searchParams.get('uid');

  const [role, setRole] = useState<'hr' | 'attendee'>('attendee');
  const [formData, setFormData] = useState({ 
    department: '', 
    position: '',
    digitalSignature: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!uid) {
      router.push('/auth/login');
    }
  }, [uid, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const userData: any = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || 'User',
        role,
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isActive: true,
      };

      if (role === 'attendee') {
        userData.department = formData.department;
        userData.position = formData.position;
        userData.digitalSignature = formData.digitalSignature;
      }

      await setDoc(doc(db, 'users', user.uid), userData);

      if (role === 'hr') {
        router.push('/dashboard');
      } else {
        router.push('/meetings');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Your Role</h1>
          <p className="text-gray-600">Choose how you&apos;ll use this system</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label
              className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition"
              style={{ borderColor: role === 'hr' ? '#2563eb' : '#e5e7eb' }}
            >
              <input
                type="radio"
                name="role"
                value="hr"
                checked={role === 'hr'}
                onChange={() => setRole('hr')}
                className="w-4 h-4 cursor-pointer"
              />
              <div className="ml-4">
                <p className="font-semibold text-gray-900">HR Manager</p>
                <p className="text-sm text-gray-600">Manage meetings and track attendance</p>
              </div>
            </label>

            <label
              className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition"
              style={{ borderColor: role === 'attendee' ? '#2563eb' : '#e5e7eb' }}
            >
              <input
                type="radio"
                name="role"
                value="attendee"
                checked={role === 'attendee'}
                onChange={() => setRole('attendee')}
                className="w-4 h-4 cursor-pointer"
              />
              <div className="ml-4">
                <p className="font-semibold text-gray-900">Attendee</p>
                <p className="text-sm text-gray-600">Check in to meetings using QR codes</p>
              </div>
            </label>
          </div>

          {role === 'attendee' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <Input
                label="Department"
                placeholder="e.g., Water Quality"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
              <Input
                label="Position"
                placeholder="e.g., Technician"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Digital Signature *
                </label>
                <p className="text-xs text-gray-600 mb-3">Draw your signature in the box below</p>
                <SignaturePad
                  onSignatureChange={(sig) => setFormData({ ...formData, digitalSignature: sig })}
                  onClear={() => setFormData({ ...formData, digitalSignature: '' })}
                />
              </div>
            </div>
          )}

          <Button type="submit" isLoading={loading} className="w-full">
            Continue
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function RoleSelectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RoleSelectForm />
    </Suspense>
  );
}
