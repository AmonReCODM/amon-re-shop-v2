import React from 'react';
import AdminOrderList from '../components/AdminOrderList';

export default function AdminDashboardPage({ user, onSignOut }) {
  return (
    <div className="text-white bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tableau de Bord Administrateur</h1>
        <button
          onClick={onSignOut}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Se Déconnecter
        </button>
      </div>
      <p className="mb-8">
        Connecté en tant que: <span className="font-bold">{user.email}</span> (Admin)
      </p>

      <div className="text-left">
        <h2 className="text-2xl font-semibold mt-8 mb-4">Gestion des Commandes</h2>
        <AdminOrderList />
      </div>
    </div>
  );
}