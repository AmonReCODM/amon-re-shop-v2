import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#4a604c]">
      <div className="w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-2xl text-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-wider uppercase">
          Amon Re <span className="text-yellow-500">X</span> Shop
        </h1>
        <p className="text-gray-500 mt-2 mb-8">
          Votre source n°1 pour les points Call of Duty
        </p>
        <div className="space-y-4">
          <Link href="/login" passHref>
            <button
              className="w-full bg-yellow-500 text-gray-900 font-bold py-3 px-4 rounded-md transition duration-300 hover:bg-yellow-600"
            >
              Commander / Mon Compte
            </button>
          </Link>
          <Link href="/admin/login" passHref>
            <button
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded transition duration-300"
            >
              Accès Administrateur
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}