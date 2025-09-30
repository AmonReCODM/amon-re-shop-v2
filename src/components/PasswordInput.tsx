"use client"; // Indique à Next.js que c'est un Client Component

import React, { useState } from 'react';

// Icônes simples pour l'œil. Nous pourrons les remplacer par de vraies icônes SVG plus tard.
const EyeIcon = () => <span>👁️</span>;
const EyeOffIcon = () => <span>🙈</span>;

interface PasswordInputProps {
  name: string;
  id: string;
  label: string;
}

// Ce composant gère la logique d'affichage et de masquage du mot de passe.
// Il est maintenant "non contrôlé" pour fonctionner avec les Server Actions.
export default function PasswordInput({ name, id, label }: PasswordInputProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative">
            <label className="block text-gray-700 mb-2" htmlFor={id}>{label}</label>
            <input
                type={isVisible ? 'text' : 'password'}
                name={name}
                id={id}
                className="w-full px-4 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
            />
            <button
                type="button"
                onClick={() => setIsVisible(v => !v)}
                className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500"
                aria-label="Afficher ou masquer le mot de passe"
            >
                {isVisible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
        </div>
    );
};