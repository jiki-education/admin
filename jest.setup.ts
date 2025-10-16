import '@testing-library/jest-dom'
import React from 'react'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useParams() {
    return {}
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock auth store globally
jest.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    hasCheckedAuth: true,
    checkAuth: jest.fn(),
    user: null,
    token: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}))

// Mock common page components to focus on logic
jest.mock('@/components/common/PageBreadCrumb', () => {
  return function MockPageBreadcrumb({ pageTitle }: { pageTitle: string }) {
    return React.createElement('div', { 'data-testid': 'page-breadcrumb' }, pageTitle)
  }
})

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()
})

// Suppress console errors during tests unless they're expected
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})