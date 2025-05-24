import RegisterForm from '@/components/auth/register-form';
import BaseLayout from '@/components/layout/base-layout';

export default function RegisterPage() {
  return (
    <BaseLayout>
      <div className='flex justify-center items-center py-12'>
        <RegisterForm />
      </div>
    </BaseLayout>
  );
}
