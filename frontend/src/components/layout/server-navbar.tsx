import { ClientNavbar } from './client-navbar';

// Server component for navbar - handles initial state
export default async function Navbar() {
  // In a real app, you'd verify the auth token here
  // For now, we'll delegate to client component for interactive features

  return <ClientNavbar />;
}
