import React from 'react';

// Voici notre première page. Elle est simple : elle affiche un titre et deux boutons.
// La fonction `setView` est passée en "props" pour permettre de changer de page.
export default function LandingPage({ setView }) {
  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-2xl text-center">
      <h1 className="text-3xl font-bold text-gray-900 tracking-wider uppercase">
        Amon Re <span className="text-yellow-500">X</span> Shop
      </h1>
      <p className="text-gray-500 mt-2 mb-8">
        Votre source n°1 pour les points Call of Duty
      </p>
      <div className="space-y-4">
        <button
          onClick={() => setView('clientLogin')}
          className="w-full bg-yellow-500 text-gray-900 font-bold py-3 px-4 rounded-md transition duration-300 hover:bg-yellow-600"
        >
          Commander / Mon Compte
        </button>
        <button
          onClick={() => setView('clientLogin')}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded transition duration-300"
        >
          Accès Administrateur
        </button>
      </div>
    </div>
  );
}

