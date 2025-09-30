import React, { useState, useEffect } from 'react';
import { getUserOrders } from '../api/api';

const StatusBadge = ({ status }) => {
  const baseClasses = "px-2 py-1 text-xs font-bold rounded-full";
  const statusStyles = {
    pending: "bg-yellow-500 text-gray-900",
    processing: "bg-blue-500 text-white",
    completed: "bg-green-500 text-white",
    refused: "bg-red-500 text-white",
  };
  const statusLabels = {
    pending: "En attente",
    processing: "En cours",
    completed: "Terminée",
    refused: "Refusée",
  };
  return (
    <span className={`${baseClasses} ${statusStyles[status] || "bg-gray-500 text-white"}`}>
      {statusLabels[status] || status}
    </span>
  );
};

export default function OrderHistory({ userId, refreshKey }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError('');
      const { data, error } = await getUserOrders(userId);
      if (error) {
        setError("Impossible de charger l'historique des commandes.");
        console.error("Erreur de chargement des commandes:", error);
      } else {
        setOrders(data);
      }
      setIsLoading(false);
    };

    fetchOrders();
  }, [userId, refreshKey]); // Se rafraîchit si l'ID utilisateur ou la clé de rafraîchissement change

  if (isLoading) {
    return <p className="text-gray-400">Chargement de l'historique...</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (orders.length === 0) {
    return <p className="text-gray-400">Vous n'avez aucune commande pour le moment.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left text-gray-300">
        <thead className="bg-gray-700 text-xs uppercase">
          <tr>
            <th scope="col" className="px-6 py-3">Date</th>
            <th scope="col" className="px-6 py-3">Pack</th>
            <th scope="col" className="px-6 py-3">Prix</th>
            <th scope="col" className="px-6 py-3">Statut</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
              <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
              <td className="px-6 py-4">{order.packs.name}</td>
              <td className="px-6 py-4">{order.packs.price_in_eur}€</td>
              <td className="px-6 py-4">
                <StatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}