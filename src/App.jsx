import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { getSession, onAuthStateChange, signOut } from './api/api';

// On importe toutes nos pages
import LandingPage from './pages/LandingPage';
import ClientLoginPage from './pages/ClientLoginPage';
import ClientSignUpPage from './pages/ClientSignUpPage';
// Bientôt, nous ajouterons ClientDashboard ici

export default function App() {
  const [view, setView] = useState('landing');
  const [session, setSession] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Ce `useEffect` se lance une seule fois au démarrage de l'application
  useEffect(() => {
    // On vérifie s'il y a déjà une session active
    getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitialized(true);
    });

    // On met en place un "écouteur" qui réagit en temps réel
    // si l'utilisateur se connecte ou se déconnecte
    const { data: authListener } = onAuthStateChange((event, session) => {
      setSession(session);

      // On ne veut pas afficher de toast au chargement initial de la page,
      // seulement pour les actions de connexion et déconnexion explicites.
      if (isInitialized) {
        if (event === 'SIGNED_IN') {
          toast.success('Connexion réussie ! Bienvenue !');
        } else if (event === 'SIGNED_OUT') {
          toast('Vous avez été déconnecté.', { icon: '👋' });
        }
      }
    });

    // Quand l'application se ferme, on nettoie l'écouteur
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isInitialized]);

  // La fonction qui décide quoi afficher
  const renderView = () => {
    if (!isInitialized) {
        return <div className="text-white">Chargement...</div>;
    }

    // Si l'utilisateur est connecté (il y a une session)...
    if (session) {
        return (
            <div className="text-white text-center bg-gray-800 p-8 rounded-lg shadow-xl">
                <h1 className="text-2xl font-bold">Bienvenue !</h1>
                <p className="my-4">Vous êtes connecté en tant que {session.user.email}</p>
                <button
                  onClick={() => signOut()}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Se Déconnecter
                </button>
            </div>
        );
    }

    // Si l'utilisateur n'est PAS connecté, on affiche les pages publiques
    switch (view) {
      case 'clientLogin':
        return <ClientLoginPage setView={setView} />;
      case 'clientSignUp':
        return <ClientSignUpPage setView={setView} />;
      case 'landing':
      default:
        return <LandingPage setView={setView} />;
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#4a604c]">
      <Toaster position="top-center" reverseOrder={false} />
      {renderView()}
    </main>
  );
}
