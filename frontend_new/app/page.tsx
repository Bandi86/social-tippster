
import Link from "next/link";

export default function Home() {
  return (
  <div>
    <Link href="/auth/login">Login</Link>
    <Link href="/auth/register">Register</Link>
    <h1>Welcome to the Application</h1>
  </div>
  );
}
