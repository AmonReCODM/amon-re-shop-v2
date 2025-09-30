import { supabase } from '../supabaseClient';

// --- Fonctions d'Authentification ---

/**
 * Tente d'inscrire un nouvel utilisateur.
 * @param {string} email - L'email de l'utilisateur.
 * @param {string} password - Le mot de passe de l'utilisateur.
 * @returns {Promise} La promesse de l'opération d'inscription de Supabase.
 */
export const signUp = (email, password) => {
  return supabase.auth.signUp({ email, password });
};

/**
 * Tente de connecter un utilisateur existant.
 * @param {string} email - L'email de l'utilisateur.
 * @param {string} password - Le mot de passe de l'utilisateur.
 * @returns {Promise} La promesse de l'opération de connexion de Supabase.
 */
export const signIn = (email, password) => {
  return supabase.auth.signInWithPassword({ email, password });
};

/**
 * Récupère la session utilisateur actuelle.
 * @returns {Promise} La session utilisateur si elle existe.
 */
export const getSession = () => {
    return supabase.auth.getSession();
}

/**
 * Met en place un écouteur pour les changements d'état d'authentification.
 * @param {function} callback - La fonction à exécuter lors d'un changement.
 * @returns {object} L'objet d'écoute pour se désinscrire plus tard.
 */
export const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange(callback);
}

/**
 * Déconnecte l'utilisateur actuel.
 * @returns {Promise} La promesse de l'opération de déconnexion.
 */
export const signOut = () => {
    return supabase.auth.signOut();
}

// --- Fonctions de l'Application (Données) ---

/**
 * Récupère tous les packs de CP depuis la base de données.
 * @returns {Promise} La liste des packs.
 */
export const getPacks = () => {
  return supabase
    .from('packs')
    .select('*')
    .order('price_in_eur', { ascending: true });
};

/**
 * Téléverse un fichier de preuve de paiement dans le bucket "payment-proofs".
 * @param {File} file - Le fichier à téléverser.
 * @param {string} fileName - Le nom unique du fichier.
 * @returns {Promise} Le résultat de l'opération de téléversement.
 */
export const uploadPaymentProof = (file, fileName) => {
  return supabase
    .storage
    .from('payment-proofs')
    .upload(fileName, file);
};

/**
 * Crée une nouvelle commande dans la base de données.
 * @param {object} orderDetails - Les détails de la commande.
 * @returns {Promise} Le résultat de l'opération d'insertion.
 */
export const createOrder = (orderDetails) => {
  return supabase
    .from('orders')
    .insert([orderDetails]);
};

/**
 * Récupère les commandes d'un utilisateur spécifique.
 * @param {string} userId - L'ID de l'utilisateur.
 * @returns {Promise} La liste des commandes de l'utilisateur.
 */
export const getUserOrders = (userId) => {
  return supabase
    .from('orders')
    .select(`
      id,
      created_at,
      status,
      packs ( name, price_in_eur )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
};

/**
 * Récupère le profil d'un utilisateur, y compris son rôle.
 * @param {string} userId - L'ID de l'utilisateur.
 * @returns {Promise} Le profil de l'utilisateur.
 */
export const getProfile = (userId) => {
  return supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single(); // On s'attend à un seul profil par utilisateur
};

/**
 * [Admin] Récupère toutes les commandes de tous les utilisateurs.
 * @returns {Promise} La liste de toutes les commandes.
 */
export const getAllOrders = () => {
  return supabase
    .from('orders')
    .select(`
      id,
      created_at,
      status,
      platform,
      game_pseudo,
      payment_proof_url,
      receipt_url,
      packs ( name, price_in_eur ),
      profiles ( email )
    `)
    .order('created_at', { ascending: false });
};

/**
 * [Admin] Met à jour le statut d'une commande.
 * @param {string} orderId - L'ID de la commande à mettre à jour.
 * @param {string} status - Le nouveau statut de la commande.
 * @returns {Promise} Le résultat de l'opération de mise à jour.
 */
export const updateOrderStatus = (orderId, status) => {
  return supabase
    .from('orders')
    .update({ status: status, updated_at: new Date() })
    .eq('id', orderId);
};
