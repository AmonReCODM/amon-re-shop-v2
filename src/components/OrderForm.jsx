import React, { useState, useEffect } from 'react';
import { getPacks, uploadPaymentProof, createOrder } from '../api/api';
import { supabase } from '../supabaseClient';
import PasswordInput from './PasswordInput';

// Imports pour Stripe
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

// On charge Stripe en dehors du render pour éviter de le recharger à chaque fois.
// La clé est chargée depuis les variables d'environnement Vite.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function OrderForm({ userId, onNewOrder }) {
  // --- États du formulaire ---
  const [platform, setPlatform] = useState('activision');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [selectedPack, setSelectedPack] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  // --- États de la logique ---
  const [packs, setPacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // --- États pour Stripe ---
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    const fetchPacks = async () => {
      const { data, error } = await getPacks();
      if (error) {
        setError("Impossible de charger les packs.");
      } else {
        setPacks(data);
        if (data.length > 0) setSelectedPack(data[0].id);
      }
    };
    fetchPacks();
  }, []);

  const resetForm = () => {
    // ... (la fonction resetForm reste la même)
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Le fichier doit être une image.');
        e.target.value = '';
        return;
      }
      setError('');
      setPaymentProof(file);
    }
  };

  // Étape 1: Le client clique sur "Valider et Payer"
  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    setClientSecret(null);

    if (paymentMethod === 'stripe') {
      try {
        const { data, error } = await supabase.functions.invoke('create-payment-intent', {
          body: { pack_id: selectedPack },
        });

        if (error) throw error;

        setClientSecret(data.client_secret);
      } catch (err) {
        setError("Impossible d'initier le paiement. Veuillez réessayer.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Logique pour d'autres méthodes de paiement (ex: Mobile Money)
      // Pour l'instant, on lance directement la création de commande
      await handleCreateOrder();
    }
  };

  // Étape 2 (pour Stripe): Le paiement a réussi, on crée la commande
  const handleCreateOrder = async (paymentIntentId = null) => {
    setIsLoading(true); // On affiche à nouveau un loader
    setError('');

    try {
      let proofUrl = null;
      if (paymentProof) {
        const fileExtension = paymentProof.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExtension}`;
        const { error: uploadError } = await uploadPaymentProof(paymentProof, fileName);
        if (uploadError) throw new Error("Erreur d'upload de l'image.");
        proofUrl = fileName;
      }

      const orderDetails = {
        user_id: userId,
        pack_id: selectedPack,
        platform, game_email: email, game_password: password, game_pseudo: pseudo, two_factor_code: twoFactorCode,
        payment_proof_url: proofUrl,
        status: paymentMethod === 'stripe' ? 'processing' : 'pending', // Statut différent si payé
        payment_intent_id: paymentIntentId, // On stocke l'ID de la transaction Stripe
      };

      const { error: createOrderError } = await createOrder(orderDetails);
      if (createOrderError) throw new Error("Erreur lors de la création de la commande.");

      setSuccess('Votre commande a été passée avec succès !');
      resetForm();
      if (onNewOrder) onNewOrder();
      setClientSecret(null); // On cache le formulaire Stripe

    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (clientSecret) {
    return (
      <div className="p-6 bg-gray-700 rounded-lg mt-6">
        <h3 className="text-xl font-semibold text-white mb-4">Finalisez votre paiement</h3>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            onPaymentSuccess={(paymentIntent) => handleCreateOrder(paymentIntent.id)}
            onPaymentError={(error) => setError(`Paiement échoué: ${error.message}`)}
          />
        </Elements>
        <button onClick={() => setClientSecret(null)} className="text-gray-400 text-sm mt-4 hover:text-white">
          Annuler et revenir au formulaire
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleInitiatePayment} className="space-y-4 text-left p-6 bg-gray-700 rounded-lg mt-6">
      {/* --- Section: Informations du compte --- */}
      <h3 className="text-xl font-semibold text-white border-b border-gray-600 pb-2 mb-4">1. Vos informations de jeu</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">Plateforme</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full p-2.5 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500">
            <option value="activision">Activision</option>
            <option value="facebook">Facebook</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">Pseudo en jeu</label>
          <input type="text" value={pseudo} onChange={(e) => setPseudo(e.target.value)} className="w-full p-2.5 bg-gray-600 border border-gray-500 rounded-lg text-white" required />
        </div>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-300">Email du compte {platform === 'activision' ? 'Activision' : 'Facebook'}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 bg-gray-600 border border-gray-500 rounded-lg text-white" required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">Mot de passe</label>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">Code de secours 2FA</label>
          <input type="text" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} className="w-full p-2.5 bg-gray-600 border border-gray-500 rounded-lg text-white" placeholder="Un code à 8 chiffres" required />
        </div>
      </div>

      {/* --- Section: Sélection de la commande --- */}
      <h3 className="text-xl font-semibold text-white border-b border-gray-600 pb-2 mt-6 mb-4">2. Votre commande</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">Choisissez un pack</label>
          <select value={selectedPack} onChange={(e) => setSelectedPack(e.target.value)} className="w-full p-2.5 bg-gray-600 border border-gray-500 rounded-lg text-white" required disabled={packs.length === 0}>
            {packs.length === 0 ? (
              <option>Chargement...</option>
            ) : (
              packs.map(pack => (
                <option key={pack.id} value={pack.id}>
                  {pack.name} ({pack.price_in_eur}€)
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">Méthode de paiement</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full p-2.5 bg-gray-600 border border-gray-500 rounded-lg text-white">
            <option value="stripe">Carte Bancaire (Stripe)</option>
            <option value="manual" disabled>Mobile Money (Preuve manuelle)</option>
          </select>
        </div>
      </div>

      {paymentMethod === 'manual' && (
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">Téléversez votre preuve de paiement</label>
          <input type="file" onChange={handleFileChange} accept="image/*" className="w-full" required />
        </div>
      )}

      {/* --- Soumission --- */}
      <div className="pt-4">
        <button type="submit" disabled={isLoading || packs.length === 0} className="w-full py-3 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-gray-500">
          {isLoading ? 'Chargement...' : 'Valider et Payer'}
        </button>
      </div>

      {error && <p className="text-red-400 text-center text-sm mt-4">{error}</p>}
      {success && <p className="text-green-400 text-center text-sm mt-4">{success}</p>}
    </form>
  );
}