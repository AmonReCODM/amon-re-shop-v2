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
