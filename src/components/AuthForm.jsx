import React from 'react';

// Ce composant est un "moule" pour nos formulaires de connexion et d'inscription.
// Il gère la structure générale, le titre, le bouton, et l'affichage des erreurs.
export default function AuthForm({ title, buttonText, onSubmit, error, children, footerLink }) {
  return (
    <div className="w-full max-w-sm mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">{title}</h2>
      <form onSubmit={onSubmit}>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
        {children}
        <button
          type="submit"
          className="w-full text-gray-900 font-bold py-2 px-4 rounded-md transition duration-300 mt-4 bg-yellow-500 hover:bg-yellow-600"
        >
          {buttonText}
        </button>
        <div className="text-center mt-6">
          {footerLink}
        </div>
      </form>
    </div>
  );
}
