import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../api/api';
import { supabase } from '../supabaseClient';

// Le même badge de statut que pour le client, mais avec plus d'options
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

// Composant pour les actions de changement de statut
const OrderActions = ({ order, onStatusChange }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleChangeStatus = async (newStatus) => {
    if (window.confirm(`Voulez-vous vraiment changer le statut à "${newStatus}" ?`)) {
      setIsLoading(true);
      await onStatusChange(order.id, newStatus);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex space-x-2">
      {order.status !== 'completed' && (
        <button onClick={() => handleChangeStatus('completed')} disabled={isLoading} className="text-xs bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded disabled:bg-gray-500">
          Terminer
        </button>
      )}
      {order.status !== 'processing' && order.status !== 'completed' && (
         <button onClick={() => handleChangeStatus('processing')} disabled={isLoading} className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded disabled:bg-gray-500">
          Traiter
        </button>
      )}
      {order.status !== 'refused' && (
        <button onClick={() => handleChangeStatus('refused')} disabled={isLoading} className="text-xs bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded disabled:bg-gray-500">
          Refuser
        </button>
      )}
    </div>
  );
};


export default function AdminOrderList() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true); // Affiche le loader pendant le rechargement
    const { data, error } = await getAllOrders();
    if (error) {
      setError("Impossible de charger les commandes.");
      console.error("Erreur de chargement des commandes:", error);
    } else {
      setOrders(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    // 1. Mettre à jour le statut de la commande
    const { error: statusError } = await updateOrderStatus(orderId, newStatus);
    if (statusError) {
      alert(`Erreur lors de la mise à jour du statut: ${statusError.message}`);
      return;
    }

    // 2. Tenter de générer une notification via l'IA
    try {
      console.log(`Génération d'une notification pour la commande ${orderId} avec le statut ${newStatus}...`);
      const { data: notifData, error: notifError } = await supabase.functions.invoke('send-notification', {
        body: { order_id: orderId, new_status: newStatus },
      });
      if (notifError) throw notifError;

      // Pour l'instant, on affiche le message dans la console.
      console.log("Message généré par l'IA:", notifData.message);
      alert(`Notification pour le client (voir console):\n"${notifData.message}"`);

    } catch (e) {
      alert(`Le statut a été mis à jour, mais la notification a échoué: ${e.message}`);
    }

    // 3. Si le statut est "terminé", déclencher la génération du reçu
    if (newStatus === 'completed') {
      try {
        const { error: receiptError } = await supabase.functions.invoke('generate-receipt', {
          body: { order_id: orderId },
        });
        if (receiptError) throw receiptError;
      } catch (e) {
        alert(`La génération du reçu a échoué: ${e.message}`);
      }
    }

    // 4. Rafraîchir la liste pour afficher tous les changements
    fetchOrders();
  };

  // Fonction générique pour obtenir une URL publique depuis le stockage Supabase
  const getStorageUrl = (bucket, fileName) => {
    if (!fileName) return null;
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  }

  const handleAnalyzeProof = async (orderId) => {
    alert("L'analyse par l'IA est en cours... Cela peut prendre quelques secondes.");
    try {
      const { data, error } = await supabase.functions.invoke('analyze-payment-proof', {
        body: { order_id: orderId },
      });
      if (error) throw error;

      // On affiche l'analyse de l'IA dans une alerte pour l'admin
      alert(`--- Analyse de l'IA ---\n\n${data.analysis}`);

    } catch (e) {
      alert(`L'analyse a échoué: ${e.message}`);
    }
  };

  if (isLoading) return <p className="text-gray-400">Chargement des commandes...</p>;
  if (error) return <p className="text-red-400">{error}</p>;
  if (orders.length === 0) return <p className="text-gray-400">Aucune commande à afficher.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left text-gray-300">
        <thead className="bg-gray-800 text-xs uppercase">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Pseudo / Pack</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3">Documents & IA</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="bg-gray-700 border-b border-gray-600 hover:bg-gray-600">
              <td className="px-4 py-4">{new Date(order.created_at).toLocaleString('fr-FR')}</td>
              <td className="px-4 py-4">{order.profiles.email}</td>
              <td className="px-4 py-4">
                <div className="font-bold">{order.game_pseudo}</div>
                <div className="text-xs text-gray-400">{order.packs.name}</div>
              </td>
              <td className="px-4 py-4"><StatusBadge status={order.status} /></td>
              <td className="px-4 py-4">
                <div className="flex flex-col space-y-1">
                  {order.payment_proof_url ? (
                    <div className="flex items-center space-x-2">
                      <a href={getStorageUrl('payment-proofs', order.payment_proof_url)} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline">
                        Voir Preuve
                      </a>
                      <button onClick={() => handleAnalyzeProof(order.id)} className="text-xs text-purple-400 hover:underline p-0 m-0 bg-transparent border-none">
                        (Analyser IA)
                      </button>
                    </div>
                  ) : null}
                  {order.receipt_url ? (
                    <a href={getStorageUrl('receipts', order.receipt_url)} target="_blank" rel="noopener noreferrer" className="text-xs text-green-400 hover:underline mt-1">
                      Voir Reçu
                    </a>
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-4">
                <OrderActions order={order} onStatusChange={handleStatusChange} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}