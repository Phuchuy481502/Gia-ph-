/**
 * Test Utilities
 * Shared helpers for all tests
 */

export const createMockRequest = (options: {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  url?: string;
} = {}) => {
  return {
    method: options.method || 'GET',
    headers: new Map(Object.entries(options.headers || {})),
    json: async () => options.body || {},
    url: options.url || 'http://localhost:3000/api/test',
    nextUrl: new URL(options.url || 'http://localhost:3000/api/test'),
    ip: '127.0.0.1'
  };
};

export const createMockSupabaseClient = () => {
  return {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ data: null, error: null })
  };
};

export const createMockJWT = (payload: any) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = 'test-signature';
  return `${header}.${body}.${signature}`;
};

export const createTestUser = (overrides: any = {}) => {
  return {
    id: 'user-test-001',
    email: 'test@example.com',
    role: 'member',
    account_status: 'active',
    family_id: 'family-test-001',
    created_at: new Date().toISOString(),
    ...overrides
  };
};

export const createTestPerson = (overrides: any = {}) => {
  return {
    id: 'person-test-001',
    family_id: 'family-test-001',
    branch_id: 'branch-test-001',
    name: 'Test Person',
    is_public: false,
    created_by: 'user-test-001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };
};

export const waitFor = async (
  condition: () => boolean,
  timeout: number = 1000,
  interval: number = 50
): Promise<void> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (condition()) return;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Timeout waiting for condition');
};

export const mockFetch = (response: any = {}) => {
  const defaultResponse = {
    status: 200,
    json: async () => response,
    text: async () => JSON.stringify(response),
    headers: new Map(),
    ok: true
  };

  return jest.fn().mockResolvedValue(defaultResponse);
};
