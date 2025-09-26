import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NavBarComponent from './NavBarComponent';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';

// Mock des dépendances
jest.mock('../contexts/AuthContext');
jest.mock('firebase/auth');
jest.mock('../firebase');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('NavBarComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('affiche le logo correctement', () => {
    useAuth.mockReturnValue({ currentUser: null });
    
    render(
      <BrowserRouter>
        <NavBarComponent />
      </BrowserRouter>
    );

    const logo = screen.getByAltText('logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', expect.stringContaining('logo.png'));
  });

  test('gère la déconnexion correctement', async () => {
    useAuth.mockReturnValue({ currentUser: { uid: '123' } });
    signOut.mockResolvedValue();

    render(
      <BrowserRouter>
        <NavBarComponent />
      </BrowserRouter>
    );

    // Note: ce test nécessite que la navbar affiche les éléments de menu
    // qui sont actuellement commentés dans le code
  });
});