'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'An error occurred';
  const code = searchParams.get('code') || '500';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-red-600 mb-4">{code}</h1>
        <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
        <p className="text-gray-600 mb-8">{message}</p>

        <div className="flex gap-4 justify-center">
          <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Go Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
