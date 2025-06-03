import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Sign In - SocialTippster',
  description: 'Sign in to your SocialTippster account',
};

export default function LoginPage() {
  redirect('/auth');
}
