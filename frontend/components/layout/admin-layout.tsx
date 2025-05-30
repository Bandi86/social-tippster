'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <AdminSidebar />
      <SidebarInset className='bg-black min-h-screen'>
        <AdminNavbar />
        <main className='flex-1 space-y-4 p-4 md:p-8 transition-all duration-200'>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
