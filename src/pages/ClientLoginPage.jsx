import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';
import PasswordInput from '../components/PasswordInput';
import { signIn } from '../api/api'; // On importe notre fonction de connexion

export default function ClientLoginPage({ setView }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: signInError } = await signIn(formData.email, formData.password);
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
    }
    // Si la connexion réussit, le "chef d'orchestre" (App.jsx) nous enverra
    // automatiquement vers le tableau de bord, nous n'avons rien à faire ici.
  };

  return (
    <AuthForm
      title="Espace Client"
      buttonText={loading ? "Connexion..." : "Se connecter"}
      onSubmit={handleSubmit}
      error={error}
      footerLink={
        <button onClick={() => setView('clientSignUp')} className="text-sm text-yellow-600 hover:underline">
          Pas de compte ? S'inscrire
        </button>
      }
    >
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500" required />
      </div>
      <div className="mb-6">
        <PasswordInput name="password" id="password" value={formData.password} onChange={handleChange} label="Mot de passe" />
      </div>
    </AuthForm>
  );
}

