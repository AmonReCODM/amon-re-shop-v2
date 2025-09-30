import { createClient } from 'npm:@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@^0.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fonction pour convertir un ArrayBuffer en chaîne base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();
    if (!order_id) throw new Error("ID de commande manquant.");

    // Initialisation du client Supabase Admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Récupérer l'URL de la preuve de paiement depuis la commande
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('payment_proof_url, packs(price_in_eur)')
      .eq('id', order_id)
      .single();

    if (orderError || !order) throw new Error(`Commande non trouvée: ${orderError.message}`);
    if (!order.payment_proof_url) throw new Error("Cette commande n'a pas de preuve de paiement.");

    // 2. Télécharger l'image depuis Supabase Storage
    const { data: imageBlob, error: downloadError } = await supabaseAdmin
      .storage
      .from('payment-proofs')
      .download(order.payment_proof_url);

    if (downloadError) throw new Error(`Impossible de télécharger la preuve: ${downloadError.message}`);

    // 3. Préparer l'image pour l'API Gemini
    const imageBuffer = await imageBlob.arrayBuffer();
    const imageBase64 = arrayBufferToBase64(imageBuffer);
    const mimeType = imageBlob.type;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType,
      },
    };

    // 4. Construire le prompt pour Gemini Vision
    const prompt = `
      Analyse l'image suivante, qui est une preuve de paiement pour un achat sur "Amon Re Shop".
      Le montant attendu est de ${order.packs.price_in_eur} EUR.

      Ton rôle est d'agir comme un assistant de validation. Sois concis et direct.

      Fournis une analyse en 3 points :
      1.  **Validité :** L'image ressemble-t-elle à une preuve de paiement légitime (ex: capture d'écran de Mobile Money, reçu bancaire) ?
      2.  **Montant :** Le montant visible sur l'image correspond-il (même de loin) au montant attendu ? Mentionne le montant que tu vois si possible.
      3.  **Avis :** Donne un avis final : "semble fiable", "douteux" ou "illisible".
    `;

    // 5. Appeler l'API Gemini Vision
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const result = await model.generateContent([prompt, imagePart]);
    const analysis = await result.response.text();

    return new Response(
      JSON.stringify({ success: true, analysis: analysis }),
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