import { createClient } from 'npm:@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialisation de l'API Gemini
const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order_id, new_status } = await req.json();
    if (!order_id || !new_status) throw new Error("ID de commande ou nouveau statut manquant.");

    // Initialisation du client Supabase Admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer les détails de la commande pour la personnalisation
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`game_pseudo, packs ( name )`)
      .eq('id', order_id)
      .single();

    if (orderError || !order) throw new Error(`Commande non trouvée: ${orderError?.message}`);

    // Définir le contexte de la notification en fonction du statut
    let context;
    switch (new_status) {
      case 'processing':
        context = `La commande pour le pack "${order.packs.name}" est maintenant en cours de traitement.`;
        break;
      case 'completed':
        context = `Bonne nouvelle ! La commande pour le pack "${order.packs.name}" est terminée. Les points ont été livrés au compte de "${order.game_pseudo}".`;
        break;
      case 'refused':
        context = `Il y a un problème avec la commande pour le pack "${order.packs.name}". Elle a été refusée.`;
        break;
      default:
        throw new Error("Statut de notification non valide.");
    }

    // Construire le prompt pour Gemini
    const prompt = `
      Tu es un assistant de service client pour "Amon Re Shop", une boutique de points pour le jeu Call of Duty Mobile.
      Rédige un court message de notification (pas plus de 2-3 phrases) pour un client, basé sur le contexte suivant.
      Sois amical, professionnel et rassurant. Termine en remerciant le client pour sa patience ou sa confiance.

      Contexte: ${context}
    `;

    // Appeler l'API Gemini pour générer le message
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const notificationMessage = response.text();

    // Pour l'instant, on renvoie juste le message.
    // Plus tard, on pourrait l'envoyer par email ou WhatsApp.
    return new Response(
      JSON.stringify({ success: true, message: notificationMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});