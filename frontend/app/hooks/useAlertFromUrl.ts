'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAlert } from '@/app/providers/alert-provider';

const errorMessages: Record<string, string> = {
  login_cancelled: 'You cancelled the login process.',
  auth_failed: 'Authentication failed. Please try again.',
  missing_code: 'Missing authentication code. Please try again.',
  session_expired: 'Your session expired. Please log in again.',
  board_not_found: 'Board not found.',
  unauthorized: 'You are not authorized to perform this action.',
};

const successMessages: Record<string, string> = {
  logout: 'You have been logged out successfully.',
  login: 'Logged in successfully!',
  board_created: 'Board created successfully!',
  board_updated: 'Board updated successfully!',
  board_deleted: 'Board deleted successfully!',
};

export function useAlertFromUrl() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showAlert } = useAlert();

  useEffect(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('success');
    const cleanURL = () => {
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    };
    if (error) {
      showAlert('error', errorMessages[error] || 'An error occurred.');
      cleanURL();
    }

    if (success) {
      showAlert('success', successMessages[success] || 'Success!');
      cleanURL();
    }
  }, [searchParams, router, showAlert]);
}
