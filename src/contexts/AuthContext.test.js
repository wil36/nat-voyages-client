import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { onAuthStateChanged } from 'firebase/auth';

// Mock Firebase
jest.mock('firebase/auth');
jest.mock('../firebase');

// Composant de test pour utiliser le hook
function TestComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (user) return <div>User: {user.uid}</div>;
  return <div>No user</div>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('affiche loading initialement', () => {
    const mockUnsubscribe = jest.fn();
    onAuthStateChanged.mockReturnValue(mockUnsubscribe);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('met à jour le state quand l\'utilisateur change', async () => {
    let authStateCallback;
    const mockUnsubscribe = jest.fn();
    
    onAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback;
      return mockUnsubscribe;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Simuler une connexion utilisateur
    const mockUser = { uid: '123', email: 'test@test.com' };
    authStateCallback(mockUser);

    await waitFor(() => {
      expect(screen.getByText('User: 123')).toBeInTheDocument();
    });
  });

  test('gère la déconnexion', async () => {
    let authStateCallback;
    const mockUnsubscribe = jest.fn();
    
    onAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback;
      return mockUnsubscribe;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Simuler une déconnexion
    authStateCallback(null);

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });
  });
});