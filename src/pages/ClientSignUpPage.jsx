import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';
import PasswordInput from '../components/PasswordInput';
import { signUp } from '../api/api'; // On importe la fonction d'inscription de notre fichier api.js

export default function ClientSignUpPage({ setView }) {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Met à jour l'état quand l'utilisateur tape dans un champ.
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Cette fonction est appelée quand l'utilisateur soumet le formulaire.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // On efface les anciennes erreurs.

    // On vérifie que les mots de passe correspondent.
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true); // On active l'indicateur de chargement.
    const { error: signUpError } = await signUp(formData.email, formData.password);
    setLoading(false); // On le désactive.

    if (signUpError) {
      // S'il y a une erreur de Supabase, on l'affiche.
      setError(signUpError.message);
    } else {
      // Si tout va bien, on prévient l'utilisateur et on le renvoie à la page de connexion.
      alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      setView('clientLogin');
    }
  };

  return (
    <AuthForm
      title="Créer un compte"
      buttonText={loading ? "Création en cours..." : "S'inscrire"}
      onSubmit={handleSubmit}
      error={error}
      footerLink={
        <button onClick={() => setView('clientLogin')} className="text-sm text-yellow-600 hover:underline">
          Déjà un compte ? Se connecter
        </button>
      }
    >
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500" required />
      </div>
      <div className="mb-4">
        <PasswordInput name="password" id="password" value={formData.password} onChange={handleChange} label="Mot de passe" />
      </div>
      <div className="mb-6">
        <PasswordInput name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} label="Confirmer le mot de passe" />
      </div>
    </AuthForm>
  );
}
