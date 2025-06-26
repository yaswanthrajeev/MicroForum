import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Signup from '../Signup';

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

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders signup form with all elements', () => {
    renderWithRouter(<Signup />);
    
    expect(screen.getByText('Signup')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signup/i })).toBeInTheDocument();
  });

  test('updates form fields when user types', () => {
    renderWithRouter(<Signup />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    
    expect(usernameInput.value).toBe('testuser');
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('testpass');
  });

  test('handles successful signup', async () => {
    const mockResponse = {
      data: {
        access_token: 'fake-token',
        role: 'user'
      }
    };
    
    axios.post.mockResolvedValueOnce(mockResponse);
    
    renderWithRouter(<Signup />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /signup/i });
    
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'newpass' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/auth/signup',
        {
          username: 'newuser',
          email: 'new@example.com',
          password: 'newpass'
        }
      );
    });
    
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
    expect(screen.getByText('Signup successful!')).toBeInTheDocument();
    
    // Check navigation after success
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 2000 });
  });

  test('handles signup error', async () => {
    axios.post.mockRejectedValueOnce(new Error('Username already exists'));
    
    renderWithRouter(<Signup />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /signup/i });
    
    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Signup failed. Username or email may already be taken.')).toBeInTheDocument();
    });
  });

  test('validates required fields', () => {
    renderWithRouter(<Signup />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    // Test that inputs are required
    expect(usernameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  test('validates email format', () => {
    renderWithRouter(<Signup />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    
    // Test that email input has email type
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('clears form after successful signup', async () => {
    const mockResponse = {
      data: {
        access_token: 'fake-token',
        role: 'user'
      }
    };
    
    axios.post.mockResolvedValueOnce(mockResponse);
    
    renderWithRouter(<Signup />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /signup/i });
    
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'newpass' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(usernameInput.value).toBe('');
      expect(emailInput.value).toBe('');
      expect(passwordInput.value).toBe('');
    });
  });

  test('clears error message on new submission', async () => {
    // First, trigger an error
    axios.post.mockRejectedValueOnce(new Error('Username exists'));
    
    renderWithRouter(<Signup />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /signup/i });
    
    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Signup failed. Username or email may already be taken.')).toBeInTheDocument();
    });
    
    // Then trigger success
    axios.post.mockResolvedValueOnce({
      data: { access_token: 'fake-token', role: 'user' }
    });
    
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'newpass' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Signup failed. Username or email may already be taken.')).not.toBeInTheDocument();
    });
  });
}); 