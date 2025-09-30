import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { signOut } from '@/app/auth/actions';

export default async function DashboardPage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  return (
     <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#4a604c]">
        <div className="text-white text-center bg-gray-800 p-8 rounded-lg shadow-xl">
            <h1 className="text-2xl font-bold">Tableau de Bord</h1>
            <p className="my-4">Vous êtes connecté en tant que {data.user.email}</p>
            <form action={signOut}>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Se Déconnecter
                </button>
            </form>
        </div>
    </main>
  );
}