'use client';

import { Card } from '@/components/FormElements';
import { Button } from '@/components/Button';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4">
      <Card className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don't have permission to access this page</p>
        </div>

        <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg text-sm text-gray-600">
          <p>This page requires a specific role or permission level that you don't currently have.</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/" className="block">
            <Button className="w-full">Go Home</Button>
          </Link>
          <Link href="/profile" className="block">
            <Button variant="secondary" className="w-full">
              View Profile
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
