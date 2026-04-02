import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('FEATURE_FLAGS', () => {
  let FEATURE_FLAGS;

  beforeEach(async () => {
    vi.resetModules();
    ({ FEATURE_FLAGS } = await import('../config/features.js'));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('exports an object with all expected feature keys', () => {
    expect(FEATURE_FLAGS).toHaveProperty('auth');
    expect(FEATURE_FLAGS).toHaveProperty('housing');
    expect(FEATURE_FLAGS).toHaveProperty('tutoring');
    expect(FEATURE_FLAGS).toHaveProperty('courseExchange');
    expect(FEATURE_FLAGS).toHaveProperty('mockData');
    expect(FEATURE_FLAGS).toHaveProperty('chat');
  });

  it('auth defaults to true when env var is not set', () => {
    expect(FEATURE_FLAGS.auth).toBe(true);
  });

  it('housing defaults to true when env var is not set', () => {
    expect(FEATURE_FLAGS.housing).toBe(true);
  });

  it('tutoring defaults to true when env var is not set', () => {
    expect(FEATURE_FLAGS.tutoring).toBe(true);
  });

  it('courseExchange defaults to true when env var is not set', () => {
    expect(FEATURE_FLAGS.courseExchange).toBe(true);
  });

  it('chat defaults to true when env var is not set', () => {
    expect(FEATURE_FLAGS.chat).toBe(true);
  });

  it('mockData defaults to false when env var is not set', () => {
    expect(FEATURE_FLAGS.mockData).toBe(false);
  });

  it('auth is false when VITE_ENABLE_AUTH is "false"', async () => {
    vi.stubEnv('VITE_ENABLE_AUTH', 'false');
    vi.resetModules();
    const { FEATURE_FLAGS: flags } = await import('../config/features.js');
    expect(flags.auth).toBe(false);
  });

  it('housing is false when VITE_ENABLE_HOUSING is "false"', async () => {
    vi.stubEnv('VITE_ENABLE_HOUSING', 'false');
    vi.resetModules();
    const { FEATURE_FLAGS: flags } = await import('../config/features.js');
    expect(flags.housing).toBe(false);
  });

  it('tutoring is false when VITE_ENABLE_TUTORING is "false"', async () => {
    vi.stubEnv('VITE_ENABLE_TUTORING', 'false');
    vi.resetModules();
    const { FEATURE_FLAGS: flags } = await import('../config/features.js');
    expect(flags.tutoring).toBe(false);
  });

  it('mockData is true when VITE_USE_MOCK_DATA is "true"', async () => {
    vi.stubEnv('VITE_USE_MOCK_DATA', 'true');
    vi.resetModules();
    const { FEATURE_FLAGS: flags } = await import('../config/features.js');
    expect(flags.mockData).toBe(true);
  });
});
