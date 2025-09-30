"use client"

import { useState } from 'react';

// Données fictives pour les packs de CP. Celles-ci viendront probablement d'une base de données plus tard.
const cpPacks = [
  { id: 1, name: '500 CP', price: '5.00€' },
  { id: 2, name: '1100 CP', price: '10.00€' },
  { id: 3, name: '2400 CP', price: '20.00€' },
  { id: 4, name: '5000 CP', price: '40.00€' },
  { id: 5, name: '13000 CP', price: '100.00€' },
];

export default function OrderForm() {
  const [platform, setPlatform] = useState('activision');
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    pseudo: '',
    twoFactorCode: '',
  });
  const [selectedPack, setSelectedPack] = useState(cpPacks[0].id);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Logique de soumission à implémenter ici.
    // Pour l'instant, nous allons juste simuler un délai.
    console.log({
      platform,
      credentials,
      selectedPack,
      paymentProof,
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    alert('Commande soumise (simulation) !');
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto bg-background/20 p-8 rounded-lg shadow-lg space-y-6">
      {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-md text-center">{error}</p>}

      {/* Platform Selection */}
      <div>
        <label className="block text-foreground/80 mb-2">Plateforme de connexion</label>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setPlatform('activision')} className={`py-2 px-4 rounded-md w-full font-semibold ${platform === 'activision' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}>
            Activision
          </button>
          <button type="button" onClick={() => setPlatform('facebook')} className={`py-2 px-4 rounded-md w-full font-semibold ${platform === 'facebook' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}>
            Facebook
          </button>
        </div>
      </div>

      {/* Credentials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground/80" htmlFor="pseudo">Pseudo in-game</label>
          <input id="pseudo" name="pseudo" type="text" value={credentials.pseudo} onChange={handleCredentialChange} className="w-full px-4 py-2 border rounded-md bg-inherit focus:outline-none focus:ring-2 focus:ring-yellow-500" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground/80" htmlFor="email">Email du compte</label>
          <input id="email" name="email" type="email" value={credentials.email} onChange={handleCredentialChange} className="w-full px-4 py-2 border rounded-md bg-inherit focus:outline-none focus:ring-2 focus:ring-yellow-500" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground/80" htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" value={credentials.password} onChange={handleCredentialChange} className="w-full px-4 py-2 border rounded-md bg-inherit focus:outline-none focus:ring-2 focus:ring-yellow-500" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground/80" htmlFor="twoFactorCode">Code de secours 2FA (si activé)</label>
          <input id="twoFactorCode" name="twoFactorCode" type="text" value={credentials.twoFactorCode} onChange={handleCredentialChange} className="w-full px-4 py-2 border rounded-md bg-inherit focus:outline-none focus:ring-2 focus:ring-yellow-500" />
        </div>
      </div>

      {/* CP Pack Selection */}
      <div>
        <label className="block text-foreground/80 mb-2">Choisissez un pack de CP</label>
        <select value={selectedPack} onChange={(e) => setSelectedPack(Number(e.target.value))} className="w-full px-4 py-2 border rounded-md bg-inherit focus:outline-none focus:ring-2 focus:ring-yellow-500">
          {cpPacks.map(pack => (
            <option key={pack.id} value={pack.id}>{pack.name} - {pack.price}</option>
          ))}
        </select>
      </div>

      {/* Payment Proof Upload */}
      <div>
        <label className="block text-foreground/80 mb-2" htmlFor="paymentProof">Preuve de paiement</label>
        <input id="paymentProof" name="paymentProof" type="file" onChange={handleFileChange} className="w-full text-sm text-foreground/80 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-gray-900 hover:file:bg-yellow-600" required />
        <p className="text-xs text-foreground/60 mt-1">Veuillez téléverser une capture d'écran de votre paiement.</p>
      </div>

      {/* Submit Button */}
      <button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:opacity-50">
        {loading ? 'Envoi en cours...' : 'Passer la commande'}
      </button>
    </form>
  );
}