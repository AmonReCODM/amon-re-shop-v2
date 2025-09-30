import React, { useState, useEffect } from 'react';
import { getSession, onAuthStateChange, signOut, getProfile } from './api/api';

// On importe toutes nos pages
import LandingPage from './pages/LandingPage';
import ClientLoginPage from './pages/ClientLoginPage';
import ClientSignUpPage from './pages/ClientSignUpPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  const [view, setView] = useState('landing');
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange est appelé au chargement initial ET à chaque changement de connexion.
    // C'est la seule source de vérité pour l'état de l'authentification.
    const { data: authListener } = onAuthStateChange(async (_event, session) => {
      setIsLoading(true);
      setSession(session);
      setUserProfile(null); // On réinitialise le profil à chaque changement

      if (session) {
        // Si l'utilisateur est connecté, on récupère son profil.
        const { data: profile, error } = await getProfile(session.user.id);

        if (error) {
          console.error("Erreur de récupération du profil:", error);
          await signOut(); // On déconnecte en cas de problème
        } else {
          setUserProfile(profile);
        }
      }
      setIsLoading(false); // Le chargement est terminé une fois la session et le profil traités.
    });

    return () => {
      // On nettoie l'écouteur quand le composant est démonté.
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const handleSignOut = async () => {
    await signOut();
    setView('landing');
  };

  // La fonction qui décide quoi afficher, maintenant plus robuste.
  const renderView = () => {
    if (isLoading) {
      return <div className="text-white">Chargement...</div>;
    }

    if (session && userProfile) {
      // Si la session et le profil sont chargés, on affiche le bon tableau de bord.
      if (userProfile.role === 'admin') {
        return <AdminDashboardPage user={session.user} onSignOut={handleSignOut} />;
      }
      return <ClientDashboardPage user={session.user} onSignOut={handleSignOut} />;
    }

    // Si aucune session n'est active, on affiche les pages publiques.
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
      {renderView()}
    </main>
  );
}

