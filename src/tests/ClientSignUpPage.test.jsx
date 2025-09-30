import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ClientSignUpPage from '../pages/ClientSignUpPage';

// Mock the api module
vi.mock('../api/api', () => ({
  signUp: vi.fn(),
}));

// Mock window.alert
window.alert = vi.fn();

describe('ClientSignUpPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  it('should show an error message for weak passwords', async () => {
    const setView = vi.fn();
    render(<ClientSignUpPage setView={setView} />);

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText('Mot de passe'), 'weak');
    await user.type(screen.getByLabelText(/confirmer le mot de passe/i), 'weak');

    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    await waitFor(() => {
      expect(screen.getByText(/Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule et un chiffre./i)).toBeInTheDocument();
    });
  });

  it('should not show an error for strong passwords', async () => {
    const setView = vi.fn();
    const { signUp } = await import('../api/api');
    signUp.mockResolvedValue({ error: null });
    render(<ClientSignUpPage setView={setView} />);

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText('Mot de passe'), 'StrongP@ss1');
    await user.type(screen.getByLabelText(/confirmer le mot de passe/i), 'StrongP@ss1');

    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule et un chiffre./i)).not.toBeInTheDocument();
    });
  });
});