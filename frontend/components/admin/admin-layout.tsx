'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <SidebarProvider defaultOpen>
      <AdminSidebar />
      <SidebarInset className='bg-black'>
        <div className='flex-1 space-y-4 p-4 md:p-8'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
