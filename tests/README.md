# AI-Powered Clinical Canvas Test Suite

Comprehensive test suite for the Clinical Canvas application components and functionality.

## 🚀 Quick Start

### Install Dependencies
```bash
cd frontend
npm install
```

### Run Tests
```bash
# Run all tests
npm test

# Run tests with UI dashboard
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run specific test files
npm test SOAPGeneratorNode
npm test PatientTimelineNode
npm test canvas-integration
```

## 📁 Test Structure

```
tests/
├── components/           # Component unit tests
│   ├── SOAPGeneratorNode.test.tsx
│   ├── PatientTimelineNode.test.tsx
│   └── PatientSummaryNode.test.tsx
├── hooks/               # Custom hook tests
│   └── useSOAPNotes.test.ts
├── integration/         # Integration tests
│   └── canvas-integration.test.tsx
├── api/                # API endpoint tests
│   └── endpoints.test.ts
├── validation.md       # Test validation checklist
└── README.md          # This file

frontend/src/
├── mocks/              # Test mocks and fixtures
│   ├── server.ts       # MSW server setup
│   ├── handlers.ts     # API request handlers
│   └── fixtures.ts     # Mock data fixtures
├── test-utils.tsx      # Custom testing utilities
├── test-setup.ts       # Global test setup
└── vitest.config.ts    # Vitest configuration
```

## 🧪 Test Categories

### Component Tests
- **SOAPGeneratorNode**: SOAP note generation, editing, and saving
- **PatientTimelineNode**: Timeline visualization and event filtering  
- **PatientSummaryNode**: Enhanced patient summary with alerts and trends

### Hook Tests
- **useSOAPNotes**: SOAP note CRUD operations with React Query

### Integration Tests
- **Canvas Integration**: Complete canvas system integration
- **Data Flow**: End-to-end data flow validation

### API Tests
- **Endpoints**: All backend API endpoint functionality
- **Error Handling**: Network errors and edge cases

## 🔧 Test Configuration

### Vitest Config (`vitest.config.ts`)
- **Environment**: JSDOM for DOM testing
- **Coverage**: V8 provider with HTML reports
- **Setup Files**: Global test setup and mocks

### Test Setup (`test-setup.ts`)
- **DOM Testing**: @testing-library/jest-dom matchers
- **API Mocking**: MSW server lifecycle
- **Global Mocks**: ResizeObserver, IntersectionObserver, matchMedia

### Test Utilities (`test-utils.tsx`)
- **Custom Render**: Includes React Query and ReactFlow providers
- **Mock Helpers**: Standardized mock data generators
- **Canvas Utilities**: Canvas-specific testing helpers

## 📊 Coverage Reports

### View Coverage
```bash
npm run test:coverage
```

Coverage reports are generated in `frontend/coverage/`:
- `index.html` - Interactive HTML report
- `coverage-summary.json` - Machine-readable summary
- `lcov.info` - LCOV format for CI integration

### Coverage Targets
- **Line Coverage**: >90%
- **Branch Coverage**: >85%
- **Function Coverage**: >95%
- **Statement Coverage**: >90%

## 🎯 Mock Data

### Patient Data (`fixtures.ts`)
- **mockPatientData**: Complete patient records with canvas layouts
- **mockSOAPNotes**: Sample SOAP notes for testing
- **mockTimelineEvents**: Timeline events with different types and urgencies
- **Generator Functions**: Create custom mock data for specific tests

### API Mocking (`handlers.ts`)
MSW handlers for all API endpoints:
- Patient data retrieval
- SOAP note generation and saving
- AI Q&A functionality
- Error scenarios and edge cases

## 🔍 Writing Tests

### Component Testing Pattern
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../frontend/src/test-utils'
import Component from '../../frontend/src/components/Component'

describe('Component', () => {
  const defaultProps = {
    // ... component props
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<Component {...defaultProps} />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Hook Testing Pattern
```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCustomHook } from '../../frontend/src/hooks/useCustomHook'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useCustomHook', () => {
  it('works correctly', async () => {
    const { result } = renderHook(() => useCustomHook(), { wrapper: createWrapper() })
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })
  })
})
```

## 🐛 Debugging Tests

### Common Issues
1. **Async Operations**: Use `waitFor` for async state changes
2. **Mock Timing**: Ensure mocks are cleared between tests
3. **Provider Context**: Use custom render with providers
4. **Canvas Testing**: Use test utilities for React Flow components

### Debug Tools
```bash
# Run tests in debug mode
npm test -- --inspect-brk

# Run single test file
npm test -- PatientTimelineNode

# Run tests matching pattern
npm test -- --grep "timeline"

# Watch mode for development
npm test -- --watch
```

## 🔄 Continuous Integration

### GitHub Actions Setup
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm test
      - run: cd frontend && npm run test:coverage
```

### Coverage Integration
- Upload coverage reports to Codecov/Coveralls
- Fail CI if coverage drops below thresholds
- Generate coverage badges for README

## 📈 Test Maintenance

### Adding New Tests
1. Create test file in appropriate directory
2. Follow existing naming conventions
3. Use provided utilities and fixtures
4. Update validation checklist
5. Run tests to ensure they pass

### Updating Mock Data
1. Modify fixtures in `frontend/src/mocks/fixtures.ts`
2. Update handlers in `frontend/src/mocks/handlers.ts`
3. Run all tests to verify changes
4. Update related test expectations

### Refactoring Tests
1. Keep test structure consistent
2. Extract common patterns to utilities
3. Maintain clear test descriptions
4. Update documentation as needed

## 🎯 Test Quality Guidelines

### Best Practices
- **Descriptive Names**: Clear test and describe block names
- **Single Responsibility**: One assertion per test when possible
- **Arrange-Act-Assert**: Clear test structure
- **Mock Isolation**: Avoid test interdependencies
- **User-Centric**: Test from user perspective

### Performance
- Use `beforeEach` for test setup
- Clean up mocks and state between tests
- Avoid unnecessary API calls in tests
- Use efficient selectors and queries

## 📚 Resources

### Documentation
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Tools
- **Vitest**: Fast unit test framework
- **React Testing Library**: Component testing utilities
- **MSW**: API mocking for network requests
- **jsdom**: DOM environment for Node.js testing

## 🏆 Test Status

Current test suite status: ✅ **ALL TESTS PASSING**

- ✅ Component Tests: 3/3 passing
- ✅ Hook Tests: 1/1 passing  
- ✅ Integration Tests: 1/1 passing
- ✅ API Tests: 1/1 passing
- ✅ Coverage: Above target thresholds

For detailed test results, see [validation.md](./validation.md).