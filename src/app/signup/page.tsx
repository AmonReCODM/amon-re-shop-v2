import Link from 'next/link';
import { signup } from '@/app/auth/actions';
import AuthForm from '@/components/AuthForm';
import PasswordInput from '@/components/PasswordInput';

export default function SignupPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#4a604c]">
      <form action={signup} className="w-full max-w-sm">
        <AuthForm
          title="Créer un compte"
          buttonText="S'inscrire"
          error={searchParams?.message}
          footerLink={
            <Link href="/login" className="text-sm text-yellow-600 hover:underline">
              Déjà un compte ? Se connecter
            </Link>
          }
        >
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full px-4 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          <div className="mb-4">
            <PasswordInput
              id="password"
              name="password"
              label="Mot de passe"
            />
          </div>
           <div className="mb-6">
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              label="Confirmer le mot de passe"
            />
          </div>
        </AuthForm>
      </form>
    </main>
  );
}