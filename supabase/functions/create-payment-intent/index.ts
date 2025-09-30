// Import des librairies nécessaires
import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@^14.0.0'; // Import de Stripe

// Headers CORS pour autoriser les requêtes depuis le navigateur
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialisation de Stripe avec la clé secrète (à définir dans les secrets Supabase)
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  // apiVersion: '2023-10-16', // Spécifier une version d'API est une bonne pratique
  httpClient: Stripe.createFetchHttpClient(), // Important pour Deno
});

Deno.serve(async (req) => {
  // Gérer la requête CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Récupérer l'ID du pack depuis le corps de la requête
    const { pack_id } = await req.json();
    if (!pack_id) {
      throw new Error("L'ID du pack est manquant.");
    }

    // 2. Créer un client Supabase avec les droits d'administration pour lire les données
    // Les variables d'environnement sont automatiquement disponibles dans les Edge Functions
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 3. Récupérer les informations du pack depuis la base de données
    const { data: pack, error: packError } = await supabaseAdmin
      .from('packs')
      .select('price_in_eur')
      .eq('id', pack_id)
      .single();

    if (packError || !pack) {
      throw new Error(`Pack non trouvé ou erreur de base de données: ${packError?.message}`);
    }

    const amount = pack.price_in_eur;
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error("Le prix du pack est invalide.");
    }

    // 4. Créer une intention de paiement avec Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe attend un montant en centimes (entier)
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
    });

    // 5. Renvoyer le client_secret au frontend
    return new Response(
      JSON.stringify({ client_secret: paymentIntent.client_secret }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    // Gérer les erreurs
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});