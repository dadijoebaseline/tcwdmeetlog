'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/Button';
import { Card } from '@/components/FormElements';
import Link from 'next/link';

export default function SignupPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignUp = async () => {
    try {
      setError('');
      setLoading(true);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const userDocRef = doc(db, 'users', result.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        router.push(`/auth/role-select?uid=${result.user.uid}`);
      } else {
        const userData = userDocSnap.data();
        if (userData.role === 'hr') {
          router.push('/dashboard');
        } else {
          router.push('/meetings');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Sign up with your Gmail account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignUp}
            isLoading={loading}
            className="w-full flex items-center justify-center gap-2"
          >
            <span>🔐</span>
            Sign up with Google
          </Button>

          <p className="text-center text-gray-600 text-sm mt-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Log in
            </Link>
          </p>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold text-gray-900 mb-2">After sign up:</p>
          <p>• You&apos;ll be asked to select your role (HR Manager or Attendee)</p>
        </div>
      </Card>
    </div>
  );
}
