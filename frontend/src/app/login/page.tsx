import LoginForm from '@/components/auth/login-form';
import BaseLayout from '@/components/layout/base-layout';

export default function LoginPage() {
  return (
    <BaseLayout>
      <div className='flex justify-center items-center py-12'>
        <LoginForm />
      </div>
    </BaseLayout>
  );
}
