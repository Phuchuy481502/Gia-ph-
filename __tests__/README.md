# Jest Testing Infrastructure

This directory contains the comprehensive test suite for Giapha OS.

## Setup

### Installation

Jest and testing dependencies have been added to `package.json`. Install them:

```bash
npm install
```

### Configuration

- **jest.config.js** - Main Jest configuration
  - Preset: ts-jest (TypeScript support)
  - Environment: Node.js
  - Module path aliases (@/, @/components, etc.)
  - Coverage thresholds: 70% for all metrics
  - Test timeout: 10 seconds

- **setup.ts** - Setup file (runs before all tests)
  - Initializes mock environment variables
  - Suppresses console output during tests
  - Sets global test timeout

- **utils.ts** - Shared test utilities
  - `createMockRequest()` - Creates mock Next.js requests
  - `createMockSupabaseClient()` - Creates mock Supabase client
  - `createMockJWT()` - Creates mock JWT tokens
  - `createTestUser()` - Creates test user objects
  - `createTestPerson()` - Creates test person objects
  - `waitFor()` - Async waiting utility
  - `mockFetch()` - Creates mock fetch responses

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

### Debug tests
```bash
npm run test:debug
```

## Test Structure

### Directory Organization

```
__tests__/
├── api/
│   ├── v1/
│   │   ├── auth.test.ts           # Authentication endpoints
│   │   ├── sync.test.ts           # Sync endpoint tests
│   │   └── permission-system.test.ts  # Permission system tests
│   └── notifications/
│       └── send.test.ts           # Notification delivery tests
├── components/
│   ├── VerticalText.test.tsx      # Vertical text rendering
│   └── PersonCard.test.tsx        # Person card component
├── utils/
│   ├── auth.test.ts               # Auth utilities
│   └── format.test.ts             # Formatting utilities
├── setup.ts                       # Jest setup file
├── utils.ts                       # Shared test utilities
└── README.md                      # This file
```

## Writing Tests

### Basic Test Template

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createMockRequest, createTestUser } from '../utils';

describe('Feature Name', () => {
  beforeAll(() => {
    // Setup before all tests
  });

  afterAll(() => {
    // Cleanup after all tests
  });

  it('should do something', () => {
    const user = createTestUser({ role: 'admin' });
    expect(user.role).toBe('admin');
  });
});
```

### Testing API Endpoints

```typescript
import { describe, it, expect } from '@jest/globals';
import { createMockRequest } from '../utils';

describe('POST /api/v1/auth/login', () => {
  it('should return access token for valid credentials', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    });

    // Mock your route handler
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.access_token).toBeDefined();
  });
});
```

### Testing Components

```typescript
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import VerticalText from '@/components/VerticalText';

describe('VerticalText Component', () => {
  it('should render text vertically', () => {
    render(<VerticalText text="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Testing with Mocks

```typescript
import { describe, it, expect, jest } from '@jest/globals';
import { createMockSupabaseClient } from '../utils';

describe('Data Fetching', () => {
  it('should handle Supabase errors', async () => {
    const supabase = createMockSupabaseClient();
    
    supabase.from().select().single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found' }
    });

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .single();

    expect(error).toBeDefined();
    expect(data).toBeNull();
  });
});
```

## Test Suites

### 1. Permission System Tests
**File:** `api/v1/permission-system.test.ts` (50+ tests)

Tests all security fixes:
- Field name correction (user_role → role)
- Account suspension validation
- Role-based data filtering
- Sync API rate limiting
- Permission matrix integration
- Security edge cases
- Regression tests

**Run:**
```bash
npm test -- __tests__/api/v1/permission-system.test.ts
```

### 2. Authentication Tests
**File:** `api/v1/auth.test.ts`

Tests JWT token generation:
- Login endpoint functionality
- Token refresh logic
- Rate limiting
- Input validation
- Error handling

**Run:**
```bash
npm test -- __tests__/api/v1/auth.test.ts
```

### 3. Sync Endpoint Tests
**File:** `api/v1/sync.test.ts`

Tests incremental sync:
- Delta detection with updated_at
- Role-based filtering
- Branch isolation
- Conflict resolution
- Rate limiting

**Run:**
```bash
npm test -- __tests__/api/v1/sync.test.ts
```

### 4. Component Tests
Tests UI components:
- VerticalText rendering
- PersonCard display
- Form submissions
- State management

**Run:**
```bash
npm test -- __tests__/components/
```

## Coverage Reports

Generate coverage report:

```bash
npm run test:coverage
```

This creates an `coverage/` directory with HTML report.

Open in browser:
```bash
open coverage/lcov-report/index.html
```

### Coverage Thresholds

Current thresholds (in jest.config.js):
- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

To update thresholds, edit `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 75,  // Increase from 70
    functions: 75,
    lines: 75,
    statements: 75
  }
}
```

## Debugging

### Run Single Test
```bash
npm test -- __tests__/api/v1/auth.test.ts --testNamePattern="should return access token"
```

### Run Tests in Debug Mode
```bash
npm run test:debug
```

Then open `chrome://inspect` in Chrome DevTools.

### View Console Output
Tests suppress console output by default. To enable for specific test:

```typescript
describe('Feature', () => {
  it('should log something', () => {
    console.log('This will appear in output');
    // restore original console temporarily
    jest.restoreAllMocks();
    console.log('This will appear');
  });
});
```

## Common Issues

### "Cannot find module" errors

**Solution:** Check that module path aliases in jest.config.js match tsconfig.json.

### Tests hanging

**Solution:** Check for missing `await` on async operations or increase timeout:

```typescript
it('should handle slow operation', async () => {
  // ...
}, 30000); // 30 second timeout
```

### Mock not working

**Solution:** Ensure mocks are set up before imports:

```typescript
jest.mock('@/utils/supabase/api'); // Before import
import { getUser } from '@/utils/supabase/api';
```

## Best Practices

1. **Use descriptive test names**
   ```typescript
   it('should return 403 when user is suspended', () => { /* ... */ });
   ```

2. **Test behavior, not implementation**
   ```typescript
   // Good
   expect(response.status).toBe(403);
   
   // Bad (testing implementation details)
   expect(component.state.isLoading).toBe(false);
   ```

3. **Keep tests focused**
   - One concept per test
   - Arrange, Act, Assert pattern

4. **Use test utilities**
   - Reuse `createMockRequest()`, `createTestUser()`, etc.
   - Reduces duplication

5. **Test edge cases**
   - Empty inputs
   - Null/undefined values
   - Invalid data types
   - Boundary conditions

## Adding New Tests

When adding new tests:

1. Create test file in appropriate directory under `__tests__/`
2. Follow naming convention: `feature.test.ts`
3. Use test utilities from `utils.ts`
4. Add to this README if new category
5. Run `npm test` to verify
6. Run `npm run test:coverage` to check coverage

## Continuous Integration

In CI/CD pipeline:

```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: npm test -- --coverage

- name: Check Coverage
  run: npm test -- --coverage --bail

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library Documentation](https://testing-library.com/)
- [ts-jest Configuration](https://kulshekhar.github.io/ts-jest/)
- [TypeScript Testing Guide](https://www.typescriptlang.org/docs/handbook/testing.html)

---

**Last Updated:** March 7, 2026  
**Maintainer:** Development Team
