import AdminLayout from '@/components/admin/admin-layout';
import { AdminGuard } from '@/components/auth/AdminGuard';

export default function AdminLayoutPage({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}
