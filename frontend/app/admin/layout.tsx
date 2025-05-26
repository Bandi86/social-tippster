import { AdminGuard } from '@/components/auth/AdminGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className='min-h-screen bg-black'>{children}</div>
    </AdminGuard>
  );
}
