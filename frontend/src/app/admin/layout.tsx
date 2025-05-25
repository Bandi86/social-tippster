import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminGuard } from '@/components/auth/admin-guard';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}
