import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Login from '../Login';

// Mock axios
jest.mock('axios');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Wrapper component to provide router context
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form with all elements', () => {
    renderWithRouter(<Login setIsLoggedIn={() => {}} />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('updates form fields when user types', () => {
    renderWithRouter(<Login setIsLoggedIn={() => {}} />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    
    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('testpass');
  });

  test('handles successful login', async () => {
    const mockSetIsLoggedIn = jest.fn();
    const mockResponse = {
      data: {
        access_token: 'fake-token',
        role: 'user'
      }
    };
    
    axios.post.mockResolvedValueOnce(mockResponse);
    
    renderWithRouter(<Login setIsLoggedIn={mockSetIsLoggedIn} />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/auth/login',
        {
          username: 'testuser',
          password: 'testpass'
        }
      );
    });
    
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
    expect(localStorage.setItem).toHaveBeenCalledWith('isAdmin', 'false');
    expect(mockSetIsLoggedIn).toHaveBeenCalledWith(true);
    expect(screen.getByText('Login successful!')).toBeInTheDocument();
  });

  test('handles admin login', async () => {
    const mockSetIsLoggedIn = jest.fn();
    const mockResponse = {
      data: {
        access_token: 'fake-token',
        role: 'admin'
      }
    };
    
    axios.post.mockResolvedValueOnce(mockResponse);
    
    renderWithRouter(<Login setIsLoggedIn={mockSetIsLoggedIn} />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'adminpass' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('isAdmin', 'true');
    });
  });

  test('handles login error', async () => {
    axios.post.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    renderWithRouter(<Login setIsLoggedIn={() => {}} />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials or server error.')).toBeInTheDocument();
    });
  });

  test('requires username and password', () => {
    renderWithRouter(<Login setIsLoggedIn={() => {}} />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    // Test that inputs are required
    expect(usernameInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  test('clears error message on new submission', async () => {
    // First, trigger an error
    axios.post.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    renderWithRouter(<Login setIsLoggedIn={() => {}} />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials or server error.')).toBeInTheDocument();
    });
    
    // Then trigger success
    axios.post.mockResolvedValueOnce({
      data: { access_token: 'fake-token', role: 'user' }
    });
    
    fireEvent.change(usernameInput, { target: { value: 'correctuser' } });
    fireEvent.change(passwordInput, { target: { value: 'correctpass' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Invalid credentials or server error.')).not.toBeInTheDocument();
    });
  });
}); 