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
  const forceRole = searchParams.get('forceRole');

  const [role, setRole] = useState<'hr' | 'attendee'>(forceRole === 'attendee' ? 'attendee' : 'attendee');
  const [formData, setFormData] = useState({ 
    department: '', 
    position: '',
    digitalSignature: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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

    // Validation for attendee role
    if (role === 'attendee') {
      if (!formData.department || !formData.position || !formData.digitalSignature) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      if (!agreedToTerms) {
        setError('Please agree to the User Agreement & Data Privacy Consent to continue');
        setLoading(false);
        return;
      }
    }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{forceRole === 'attendee' ? 'Complete Your Profile' : 'Select Your Role'}</h1>
          <p className="text-gray-600">{forceRole === 'attendee' ? 'Fill in your details to get started' : 'Choose how you\'ll use this system'}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!forceRole && (
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
          )}

          {role === 'attendee' && (
            <div className="space-y-6">
              {/* Data Privacy Statement */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <h3 className="font-semibold text-amber-900 mb-2">📋 Data Privacy Statement</h3>
                <p className="text-sm text-amber-800">
                  We value and respect the privacy of all attendees. Any data collected through this digital attendance system, including names, session details, and digital signatures, will be securely stored and protected.
                </p>
              </div>

              {/* Form Fields */}
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

              {/* User Agreement */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-3">✓ User Agreement & Data Privacy Consent</h3>
                <div className="text-sm text-gray-700 space-y-2 mb-4">
                  <p>Before signing up, please read and agree to the following:</p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>I understand that my personal information and digital signature will be collected solely for attendance and compliance purposes.</li>
                    <li>I acknowledge that all data will be securely stored in an encrypted database and protected against unauthorized access.</li>
                    <li>I agree that my signature provided via mobile device (finger input) will serve as my official attendance record.</li>
                    <li>I consent to the use of my data in accordance with organizational policies and applicable data protection regulations.</li>
                    <li>I understand that only authorized personnel may access attendance records, and my data will not be shared with third parties without my consent.</li>
                  </ul>
                  <p className="font-semibold mt-3">By clicking "Agree & Continue," I confirm that I have read, understood, and accepted the terms above.</p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    I agree to the User Agreement & Data Privacy Consent *
                  </span>
                </label>
              </div>
            </div>
          )}

          <Button type="submit" isLoading={loading} className="w-full">
            {role === 'attendee' ? 'Agree & Continue' : 'Continue'}
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
