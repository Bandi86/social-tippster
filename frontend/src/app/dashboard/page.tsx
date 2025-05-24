import AuthGuard from '@/components/auth/auth-guard';
import BaseLayout from '@/components/layout/base-layout';
import DashboardContent from '@/components/dashboard/dashboard-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your personal dashboard for managing posts and profile.',
};

export default function DashboardPage() {
  return (
    <AuthGuard>
      <BaseLayout>
        <DashboardContent />
      </BaseLayout>
    </AuthGuard>
  );
}
