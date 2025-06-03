import { z } from 'zod';

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Felhasználónév legalább 3 karakter hosszú')
      .max(50, 'Felhasználónév legfeljebb 50 karakter hosszú')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Felhasználónév csak betűket, számokat, aláhúzásokat és kötőjeleket tartalmazhat',
      ),
    email: z.string().email('Kérjük, adjon meg egy érvényes e-mail címet'),
    firstName: z
      .string()
      .min(1, 'Keresztnév megadása kötelező')
      .max(50, 'Keresztnév legfeljebb 50 karakter hosszú'),
    lastName: z
      .string()
      .min(1, 'Vezetéknév megadása kötelező')
      .max(50, 'Vezetéknév legfeljebb 50 karakter hosszú'),
    password: z
      .string()
      .min(8, 'Jelszónak legalább 8 karakter hosszúnak kell lennie')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'A jelszónak tartalmaznia kell legalább egy nagybetűt, egy kisbetűt és egy számot',
      ),
    confirmPassword: z.string(),
    acceptTerms: z
      .boolean()
      .refine(val => val === true, 'El kell fogadnia a feltételeket'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "A jelszavak nem egyeznek",
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export default registerSchema;
