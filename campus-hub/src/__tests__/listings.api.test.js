import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  fetchListings,
  createListing,
  buyListing,
  deleteListing,
  createStripeCheckoutSession,
  fetchAiListingMatches,
} from '../api/listings.jsx';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const okJson = (data) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const errorJson = (status, message) =>
  new Response(JSON.stringify({ message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('fetchListings', () => {
  beforeEach(() => mockFetch.mockReset());

  it('sends GET to /api/listings/get-listings', async () => {
    mockFetch.mockResolvedValue(okJson([]));

    await fetchListings();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/listings/get-listings'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('returns array of listings on success', async () => {
    const listings = [{ id: '1', title: 'Calculus Textbook' }, { id: '2', title: 'Desk Chair' }];
    mockFetch.mockResolvedValue(okJson(listings));

    const result = await fetchListings();

    expect(result).toEqual(listings);
    expect(result).toHaveLength(2);
  });

  it('throws on non-OK response', async () => {
    mockFetch.mockResolvedValue(errorJson(403, 'Forbidden'));

    await expect(fetchListings()).rejects.toThrow();
  });
});

describe('createListing', () => {
  beforeEach(() => mockFetch.mockReset());

  it('sends POST to /api/listings/create-listing', async () => {
    const listing = { title: 'Physics Book', price: 20 };
    mockFetch.mockResolvedValue(okJson({ id: '1', ...listing }));

    await createListing(listing, 'my-token');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/listings/create-listing'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('includes Authorization header with provided token', async () => {
    mockFetch.mockResolvedValue(okJson({ id: '1' }));

    await createListing({ title: 'Book' }, 'auth-tok');

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers).toHaveProperty('Authorization', 'Bearer auth-tok');
  });

  it('sends listing data as JSON body', async () => {
    const payload = { title: 'Lamp', price: 15, category: 'furniture' };
    mockFetch.mockResolvedValue(okJson({ id: '3', ...payload }));

    await createListing(payload, 'tok');

    const [, options] = mockFetch.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual(payload);
  });

  it('returns created listing on success', async () => {
    const created = { id: '42', title: 'Backpack', price: 30 };
    mockFetch.mockResolvedValue(okJson(created));

    const result = await createListing({ title: 'Backpack', price: 30 }, 'tok');

    expect(result).toEqual(created);
  });

  it('throws on 401 when not authenticated', async () => {
    mockFetch.mockResolvedValue(errorJson(401, 'Unauthorized'));

    await expect(createListing({ title: 'x' }, 'bad-token')).rejects.toThrow();
  });
});

describe('deleteListing', () => {
  beforeEach(() => mockFetch.mockReset());

  it('sends DELETE to /api/listings/delete-listing/<id>', async () => {
    const id = 'listing-uuid-123';
    mockFetch.mockResolvedValue(okJson({ deleted: true }));

    await deleteListing(id, 'tok');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/listings/delete-listing/${id}`),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('includes Authorization header', async () => {
    mockFetch.mockResolvedValue(okJson({}));

    await deleteListing('id-1', 'delete-token');

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers).toHaveProperty('Authorization', 'Bearer delete-token');
  });

  it('throws on 403 when user does not own the listing', async () => {
    mockFetch.mockResolvedValue(errorJson(403, 'You can only delete your own listings'));

    await expect(deleteListing('id-1', 'tok')).rejects.toThrow();
  });
});

describe('buyListing', () => {
  beforeEach(() => mockFetch.mockReset());

  it('sends PUT to /api/listings/buy-listing/<id>', async () => {
    const id = 'listing-uuid-456';
    mockFetch.mockResolvedValue(okJson({ status: 'SOLD' }));

    await buyListing(id, 'tok');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/listings/buy-listing/${id}`),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('includes Authorization header', async () => {
    mockFetch.mockResolvedValue(okJson({}));

    await buyListing('id-1', 'buy-token');

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers).toHaveProperty('Authorization', 'Bearer buy-token');
  });

  it('throws on 409 when listing is already sold', async () => {
    mockFetch.mockResolvedValue(errorJson(409, 'Listing is not available for purchase'));

    await expect(buyListing('id-1', 'tok')).rejects.toThrow();
  });
});

describe('createStripeCheckoutSession', () => {
  beforeEach(() => mockFetch.mockReset());

  it('throws immediately when token is null', async () => {
    await expect(
      createStripeCheckoutSession('listing-id', {}, null)
    ).rejects.toThrow('You need to log in again before starting Stripe checkout.');
  });

  it('throws immediately when token is undefined', async () => {
    await expect(
      createStripeCheckoutSession('listing-id', {}, undefined)
    ).rejects.toThrow();
  });

  it('sends POST to /api/listings/create-checkout-session/<id> when token is provided', async () => {
    const id = 'listing-uuid-789';
    mockFetch.mockResolvedValue(okJson({ checkoutUrl: 'https://stripe.com/checkout/abc' }));

    await createStripeCheckoutSession(id, { successUrl: '/success', cancelUrl: '/cancel' }, 'tok');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/listings/create-checkout-session/${id}`),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('includes Authorization header with token', async () => {
    mockFetch.mockResolvedValue(okJson({ checkoutUrl: 'https://stripe.com/x' }));

    await createStripeCheckoutSession('id-1', {}, 'stripe-token');

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers).toHaveProperty('Authorization', 'Bearer stripe-token');
  });

  it('returns checkout URL on success', async () => {
    const stripeResponse = { checkoutUrl: 'https://stripe.com/checkout/session123' };
    mockFetch.mockResolvedValue(okJson(stripeResponse));

    const result = await createStripeCheckoutSession(
      'listing-id',
      { successUrl: '/success', cancelUrl: '/cancel' },
      'tok'
    );

    expect(result).toEqual(stripeResponse);
  });
});

describe('fetchAiListingMatches', () => {
  beforeEach(() => mockFetch.mockReset());

  it('sends GET to /api/listings/ai-search with query params', async () => {
    mockFetch.mockResolvedValue(okJson([]));

    await fetchAiListingMatches('calculus textbook');

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/listings/ai-search');
    expect(url).toContain('q=calculus+textbook');
    expect(url).toContain('limit=25');
  });

  it('uses default limit of 25', async () => {
    mockFetch.mockResolvedValue(okJson([]));

    await fetchAiListingMatches('chair');

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('limit=25');
  });

  it('accepts a custom limit', async () => {
    mockFetch.mockResolvedValue(okJson([]));

    await fetchAiListingMatches('desk', 10);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('limit=10');
  });

  it('returns list of matched listings', async () => {
    const matches = [{ id: '1', title: 'Calculus Textbook', score: 0.95 }];
    mockFetch.mockResolvedValue(okJson(matches));

    const result = await fetchAiListingMatches('calculus');

    expect(result).toEqual(matches);
  });

  it('throws when AI search endpoint returns an error', async () => {
    mockFetch.mockResolvedValue(errorJson(500, 'AI service unavailable'));

    await expect(fetchAiListingMatches('test')).rejects.toThrow();
  });
});
