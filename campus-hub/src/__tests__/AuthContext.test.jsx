import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext.jsx';

// Mock fetch globally — AuthContext calls /api/auth/me on mount
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Helper to make fetch reject (simulates 401/network error)
const rejectFetch = () => {
  mockFetch.mockResolvedValue(
    new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  );
};

// Component that reads auth context values for assertions
function AuthConsumer({ onRender }) {
  const auth = useAuth();
  onRender(auth);
  return <div>consumer</div>;
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    mockFetch.mockReset();
    rejectFetch();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders children without crashing', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <div>child content</div>
        </AuthProvider>
      );
    });

    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('provides the expected context shape', async () => {
    let capturedAuth;

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer onRender={(auth) => { capturedAuth = auth; }} />
        </AuthProvider>
      );
    });

    expect(capturedAuth).toHaveProperty('currentUser');
    expect(capturedAuth).toHaveProperty('token');
    expect(capturedAuth).toHaveProperty('isAuthenticated');
    expect(capturedAuth).toHaveProperty('authLoading');
    expect(capturedAuth).toHaveProperty('login');
    expect(capturedAuth).toHaveProperty('logout');
    expect(capturedAuth).toHaveProperty('register');
    expect(capturedAuth).toHaveProperty('verifyEmail');
    expect(capturedAuth).toHaveProperty('resendVerification');
    expect(capturedAuth).toHaveProperty('updateProfile');
  });

  it('starts with isAuthenticated false and currentUser null', async () => {
    let capturedAuth;

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer onRender={(auth) => { capturedAuth = auth; }} />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(capturedAuth.authLoading).toBe(false);
    });

    expect(capturedAuth.isAuthenticated).toBe(false);
    expect(capturedAuth.currentUser).toBeNull();
  });

  it('starts with token as empty string when localStorage is empty', async () => {
    let capturedAuth;

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer onRender={(auth) => { capturedAuth = auth; }} />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(capturedAuth.authLoading).toBe(false);
    });

    expect(capturedAuth.token).toBe('');
  });

  it('logout clears the token from localStorage', async () => {
    localStorage.setItem('campusHubAuthToken', 'existing-token');

    // Mock fetch: first call returns 401 (fetchCurrentUser on mount)
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    let capturedAuth;

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer onRender={(auth) => { capturedAuth = auth; }} />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(capturedAuth.authLoading).toBe(false);
    });

    // Mock the logout POST call
    mockFetch.mockResolvedValueOnce(
      new Response('', { status: 200 })
    );

    await act(async () => {
      await capturedAuth.logout();
    });

    expect(localStorage.getItem('campusHubAuthToken')).toBeNull();
    expect(capturedAuth.isAuthenticated).toBe(false);
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    // Suppress the React error boundary console output
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    function Rogue() {
      useAuth();
      return null;
    }

    expect(() => render(<Rogue />)).toThrow('useAuth must be used within an AuthProvider');

    consoleError.mockRestore();
  });
});
