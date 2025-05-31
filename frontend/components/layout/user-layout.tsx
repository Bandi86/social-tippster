'use client';

import { usePathname } from 'next/navigation';
import UserNavbar from '../layout/Navbar';

const UserLayout = () => {
  const pathname = usePathname();

  // Don't show UserNavbar on admin routes
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      <UserNavbar />
    </>
  );
};

export default UserLayout;
