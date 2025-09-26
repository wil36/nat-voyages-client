import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Utilitaire pour wrapper les composants avec les providers nécessaires
export function renderWithProviders(ui, options = {}) {
  const { initialUser = null, ...renderOptions } = options;

  // Mock du hook useAuth pour les tests
  const mockAuthValue = {
    user: initialUser,
    loading: false,
  };

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <AuthProvider value={mockAuthValue}>
          {children}
        </AuthProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Données de test communes
export const mockUser = {
  uid: '123',
  email: 'test@example.com',
  displayName: 'Test User',
};

export const mockVoyage = {
  id: '1',
  titre: 'Voyage à Paris',
  description: 'Un magnifique voyage à Paris',
  prix: 500,
  duree: 7,
  destination: 'Paris',
};