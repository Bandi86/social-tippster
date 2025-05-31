import AdminLayout from '@/components/layout/admin-layout';
import { AdminGuard } from '@/components/auth/AdminGuard';

export default function AdminLayoutPage({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}
