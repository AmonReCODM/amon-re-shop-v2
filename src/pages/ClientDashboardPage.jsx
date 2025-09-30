import React, { useState } from 'react';
import OrderForm from '../components/OrderForm';
import OrderHistory from '../components/OrderHistory';

export default function ClientDashboardPage({ user, onSignOut }) {
  // Clé pour forcer le rafraîchissement de l'historique des commandes
  const [orderHistoryKey, setOrderHistoryKey] = useState(0);

  const handleNewOrder = () => {
    // On change la clé pour déclencher le useEffect dans OrderHistory
    setOrderHistoryKey(prevKey => prevKey + 1);
  };

  return (
    <div className="text-white text-center bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mon Espace Client</h1>
        <button
          onClick={onSignOut}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Se Déconnecter
        </button>
      </div>
      <p className="mb-8">
        Bienvenue, <span className="font-bold">{user.email}</span>.
      </p>

      <div className="text-left">
        <h2 className="text-2xl font-semibold mb-4">Passer une nouvelle commande</h2>
        <OrderForm userId={user.id} onNewOrder={handleNewOrder} />

        <h2 className="text-2xl font-semibold mt-8 mb-4">Historique de mes commandes</h2>
        <OrderHistory userId={user.id} refreshKey={orderHistoryKey} />
      </div>
    </div>
  );
}