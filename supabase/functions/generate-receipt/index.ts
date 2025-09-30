import { createClient } from 'npm:@supabase/supabase-js@2';
import { jsPDF } from 'npm:jspdf@2.5.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Récupérer les détails complets de la commande
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        created_at,
        profiles ( email ),
        packs ( name, price_in_eur )
      `)
      .eq('id', order_id)
      .single();

    if (orderError || !order) throw new Error(`Commande non trouvée: ${orderError?.message}`);

    // Création du document PDF
    const doc = new jsPDF();

    // --- Contenu du PDF ---
    doc.setFontSize(20);
    doc.text("Amon Re Shop - Reçu de votre commande", 20, 20);

    doc.setFontSize(12);
    doc.text(`Commande #: ${order.id}`, 20, 40);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('fr-FR')}`, 20, 47);
    doc.text(`Client: ${order.profiles.email}`, 20, 54);

    doc.line(20, 65, 190, 65); // Ligne de séparation

    doc.setFontSize(14);
    doc.text("Détails de l'article", 20, 75);
    doc.setFontSize(12);
    doc.text(`- ${order.packs.name}`, 25, 85);
    doc.text(`${order.packs.price_in_eur.toFixed(2)} EUR`, 160, 85);

    doc.line(20, 95, 190, 95); // Ligne de séparation

    doc.setFontSize(16);
    doc.text(`Total Payé: ${order.packs.price_in_eur.toFixed(2)} EUR`, 130, 105);

    doc.setFontSize(10);
    doc.text("Merci pour votre confiance !", 20, 120);
    doc.text("L'équipe Amon Re Shop", 20, 125);
    // --- Fin du contenu ---

    // Générer le PDF sous forme de buffer
    const pdfOutput = doc.output('arraybuffer');

    // Nom du fichier pour le stockage
    const receiptFileName = `receipt-${order.id}.pdf`;

    // Téléverser le PDF dans le bucket "receipts"
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('receipts')
      .upload(receiptFileName, pdfOutput, {
        contentType: 'application/pdf',
        upsert: true, // Écrase le fichier s'il existe déjà
      });

    if (uploadError) throw new Error(`Erreur d'upload du PDF: ${uploadError.message}`);

    // Mettre à jour la commande avec l'URL du reçu
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ receipt_url: receiptFileName })
      .eq('id', order.id);

    if (updateError) throw new Error(`Erreur de mise à jour de la commande: ${updateError.message}`);

    return new Response(
      JSON.stringify({ success: true, receipt_url: receiptFileName }),
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