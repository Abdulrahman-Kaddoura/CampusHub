import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loginUser,
  registerUser,
  logoutUser,
  fetchCurrentUser,
  verifyEmailCode,
  resendVerificationEmail,
} from '../api/auth.jsx';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Helper: build a successful JSON Response
const okJson = (data) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

// Helper: build an error JSON Response
const errorJson = (status, message) =>
  new Response(JSON.stringify({ message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('loginUser', () => {
  beforeEach(() => mockFetch.mockReset());

  it('sends POST to /api/auth/login with credentials', async () => {
    mockFetch.mockResolvedValue(okJson({ token: 'abc123' }));

    await loginUser({ email: 'user@aub.edu', password: 'pass' });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'user@aub.edu', password: 'pass' }),
      })
    );
  });

  it('returns parsed response on success', async () => {
    mockFetch.mockResolvedValue(okJson({ token: 'abc123', userId: '1' }));

    const result = await loginUser({ email: 'u@aub.edu', password: 'pw' });

    expect(result).toEqual({ token: 'abc123', userId: '1' });
  });

  it('throws on 401 Unauthorized', async () => {
    mockFetch.mockResolvedValue(errorJson(401, 'Invalid credentials'));

    await expect(loginUser({ email: 'x@aub.edu', password: 'wrong' })).rejects.toThrow(
      'Invalid credentials'
    );
  });

  it('throws on 403 if account is not verified', async () => {
    mockFetch.mockResolvedValue(errorJson(403, 'Email not verified'));

    await expect(loginUser({ email: 'x@aub.edu', password: 'pw' })).rejects.toThrow();
  });
});

describe('registerUser', () => {
  beforeEach(() => mockFetch.mockReset());

  it('sends POST to /api/auth/register', async () => {
    mockFetch.mockResolvedValue(okJson({ id: '1' }));

    const payload = { email: 'new@aub.edu', password: 'pass', username: 'newuser' };
    await registerUser(payload);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/register'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) })
    );
  });

  it('returns the created user data on success', async () => {
    const userData = { id: '42', email: 'new@aub.edu' };
    mockFetch.mockResolvedValue(okJson(userData));

    const result = await registerUser({ email: 'new@aub.edu', password: 'pass' });

    expect(result).toEqual(userData);
  });

  it('throws on 409 when email already exists', async () => {
    mockFetch.mockResolvedValue(errorJson(409, 'Email already exists'));

    await expect(
      registerUser({ email: 'taken@aub.edu', password: 'pass' })
    ).rejects.toThrow('Email already exists');
  });
});

describe('logoutUser', () => {
  beforeEach(() => mockFetch.mockReset());

  it('sends POST to /api/auth/logout', async () => {
    mockFetch.mockResolvedValue(new Response('', { status: 200 }));

    await logoutUser();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/logout'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('resolves successfully on 200', async () => {
    mockFetch.mockResolvedValue(new Response('', { status: 200 }));

    await expect(logoutUser()).resolves.not.toThrow();
  });
});

describe('fetchCurrentUser', () => {
  beforeEach(() => mockFetch.mockReset());

  it('sends GET to /api/auth/me', async () => {
    const user = { id: '1', email: 'u@aub.edu' };
    mockFetch.mockResolvedValue(okJson(user));

    await fetchCurrentUser('my-token');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/me'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('includes Authorization header with provided token', async () => {
    mockFetch.mockResolvedValue(okJson({ id: '1' }));

    await fetchCurrentUser('my-token');

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers).toHaveProperty('Authorization', 'Bearer my-token');
  });

  it('returns user data on success', async () => {
    const user = { id: '1', email: 'u@aub.edu', username: 'testuser' };
    mockFetch.mockResolvedValue(okJson(user));

    const result = await fetchCurrentUser('tok');

    expect(result).toEqual(user);
  });

  it('throws on 401', async () => {
    mockFetch.mockResolvedValue(errorJson(401, 'Unauthorized'));

    await expect(fetchCurrentUser('bad-token')).rejects.toThrow();
  });
});

describe('verifyEmailCode', () => {
  beforeEach(() => mockFetch.mockReset());

  it('sends POST to /api/auth/verify-email', async () => {
    mockFetch.mockResolvedValue(okJson({ verified: true }));

    const payload = { email: 'u@aub.edu', code: '123456' };
    await verifyEmailCode(payload);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/verify-email'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) })
    );
  });

  it('throws on 400 when code is invalid', async () => {
    mockFetch.mockResolvedValue(errorJson(400, 'Verification token is invalid'));

    await expect(verifyEmailCode({ email: 'u@aub.edu', code: 'wrong' })).rejects.toThrow(
      'Verification token is invalid'
    );
  });
});

describe('resendVerificationEmail', () => {
  beforeEach(() => mockFetch.mockReset());

  it('sends POST to /api/auth/resend-verification', async () => {
    mockFetch.mockResolvedValue(new Response('', { status: 200 }));

    await resendVerificationEmail({ email: 'u@aub.edu' });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/resend-verification'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});
