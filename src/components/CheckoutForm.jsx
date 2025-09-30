import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

export default function CheckoutForm({ onPaymentSuccess, onPaymentError }) {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js n'a pas encore été chargé.
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    // La méthode confirmPayment renvoie un objet contenant `paymentIntent` et `error`.
    const { paymentIntent, error } = await stripe.confirmPayment({
      elements,
      // On désactive la redirection pour gérer le résultat ici-même.
      redirect: 'if_required',
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Une erreur inattendue est survenue.");
      }
      onPaymentError(error); // On remonte l'erreur au composant parent.
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Le paiement a réussi. On passe l'intention de paiement au parent.
      onPaymentSuccess(paymentIntent);
    } else {
      // Cas inattendu (ex: paiement en attente de confirmation manuelle)
      setErrorMessage("Le statut du paiement est inattendu. Veuillez contacter le support.");
      onPaymentError({ message: `Statut de paiement inattendu: ${paymentIntent?.status}` });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <PaymentElement />
      <button
        disabled={isLoading || !stripe || !elements}
        className="w-full py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-500"
      >
        {isLoading ? "Paiement en cours..." : "Payer"}
      </button>

      {errorMessage && <div className="text-red-400 text-center text-sm mt-2">{errorMessage}</div>}
    </form>
  );
}