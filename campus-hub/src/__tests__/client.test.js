import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  buildApiUrl,
  buildJsonHeaders,
  buildAuthHeaders,
  parseApiResponse,
} from '../api/client.js';

describe('buildApiUrl', () => {
  it('returns path unchanged when no base URL is configured', () => {
    const url = buildApiUrl('/listings');
    expect(url).toContain('/listings');
  });

  it('handles paths with leading slash', () => {
    const url = buildApiUrl('/api/listings');
    expect(url).toMatch(/\/api\/listings$/);
  });

  it('handles paths without leading slash', () => {
    const url = buildApiUrl('listings');
    expect(url).toContain('listings');
  });

  it('returns a string', () => {
    expect(typeof buildApiUrl('/test')).toBe('string');
  });
});

describe('buildAuthHeaders', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty object when no token is available', () => {
    const headers = buildAuthHeaders(undefined);
    expect(headers).toEqual({});
  });

  it('includes Authorization header when token is provided directly', () => {
    const headers = buildAuthHeaders('my-token');
    expect(headers).toHaveProperty('Authorization', 'Bearer my-token');
  });

  it('reads token from localStorage when no token argument is given', () => {
    localStorage.setItem('campusHubAuthToken', 'stored-token');
    const headers = buildAuthHeaders();
    expect(headers).toHaveProperty('Authorization', 'Bearer stored-token');
  });
});

describe('buildJsonHeaders', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('always includes Content-Type application/json', () => {
    const headers = buildJsonHeaders();
    expect(headers).toHaveProperty('Content-Type', 'application/json');
  });

  it('includes Authorization header when token is provided', () => {
    const headers = buildJsonHeaders('test-token');
    expect(headers).toHaveProperty('Authorization', 'Bearer test-token');
    expect(headers).toHaveProperty('Content-Type', 'application/json');
  });

  it('does not include Authorization when no token is available', () => {
    const headers = buildJsonHeaders();
    expect(headers).not.toHaveProperty('Authorization');
    expect(headers).toHaveProperty('Content-Type', 'application/json');
  });
});

describe('parseApiResponse', () => {
  it('returns parsed JSON body on 200 OK with JSON content-type', async () => {
    const data = { id: 1, name: 'Test Listing' };
    const response = new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await parseApiResponse(response, 'Fallback error');
    expect(result).toEqual(data);
  });

  it('returns text body on 200 OK with text content-type', async () => {
    const response = new Response('success', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });

    const result = await parseApiResponse(response, 'Fallback error');
    expect(result).toBe('success');
  });

  it('throws an Error on 404 response using body message', async () => {
    const response = new Response(JSON.stringify({ message: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });

    await expect(parseApiResponse(response, 'Fallback')).rejects.toThrow('Not found');
  });

  it('throws an Error on 500 response', async () => {
    const response = new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });

    await expect(parseApiResponse(response, 'Server error')).rejects.toThrow();
  });

  it('uses fallback message when JSON body has no message field', async () => {
    const response = new Response(JSON.stringify({ code: 400 }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

    await expect(parseApiResponse(response, 'Fallback message')).rejects.toThrow(
      'Fallback message'
    );
  });

  it('uses fallback message when text body is empty', async () => {
    const response = new Response('', {
      status: 401,
      headers: { 'Content-Type': 'text/plain' },
    });

    await expect(parseApiResponse(response, 'Unauthorized')).rejects.toThrow('Unauthorized');
  });

  it('uses error field from JSON when message is absent', async () => {
    const response = new Response(JSON.stringify({ error: 'Access denied' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });

    await expect(parseApiResponse(response, 'Fallback')).rejects.toThrow('Access denied');
  });
});
