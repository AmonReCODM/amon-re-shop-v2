import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';
import PasswordInput from '../components/PasswordInput';
import { signUp } from '../api/api';

export default function ClientSignUpPage({ setView }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { error: signUpError } = await signUp(formData.email, formData.password);
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
      // On pourrait rediriger automatiquement après quelques secondes,
      // mais pour l'instant, on laisse l'utilisateur cliquer.
    }
  };

  return (
    <AuthForm
      title="Créer un compte"
      buttonText={loading ? "Création..." : "S'inscrire"}
      onSubmit={handleSubmit}
      error={error}
      success={success}
      footerLink={
        <button onClick={() => setView('clientLogin')} className="text-sm text-yellow-600 hover:underline">
          Déjà un compte ? Se connecter
        </button>
      }
    >
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          required
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 mb-2" htmlFor="password">Mot de passe</label>
        <PasswordInput
          name="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>
    </AuthForm>
  );
}