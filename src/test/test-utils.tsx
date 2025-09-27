import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { vi } from 'vitest'

// Mock user data for testing
export const mockUsers = {
  admin: {
    id: 'admin',
    name: 'Dr. Rajesh Kumar',
    email: 'admin@bluecarbon.org',
    role: 'ADMIN' as const,
    organization: 'NCCR',
    isEmailVerified: true,
    createdAt: new Date().toISOString()
  },
  auditor: {
    id: 'auditor',
    name: 'Dr. Michael Chen',
    email: 'auditor@coastal.org',
    role: 'AUDITOR' as const,
    organization: 'Global Audit Partners',
    isEmailVerified: true,
    createdAt: new Date().toISOString()
  },
  ngo: {
    id: 'ngo',
    name: 'Anjali Patel',
    email: 'ngo@ocean.org',
    role: 'NGO' as const,
    organization: 'Ocean Conservation NGO',
    isEmailVerified: true,
    createdAt: new Date().toISOString()
  },
  buyer: {
    id: 'buyer',
    name: 'Sarah Johnson',
    email: 'buyer@corp.com',
    role: 'BUYER' as const,
    organization: 'ClimateCorp Industries',
    isEmailVerified: true,
    createdAt: new Date().toISOString()
  }
}

// Mock projects data
export const mockProjects = [
  {
    id: 'PRJ-1',
    title: 'Sundarbans Mangrove Restoration',
    description: 'Large-scale mangrove restoration project.',
    ecosystem: 'MANGROVE',
    location: 'West Bengal, India',
    coordinates: { latitude: 21.9497, longitude: 88.2636 },
    area: 150,
    carbonCreditsEstimated: 2500,
    carbonCreditsIssued: 2500,
    status: 'VERIFIED' as const,
    submitterId: 'ngo',
    submitterName: 'Ocean Conservation NGO',
    submitterOrganization: 'Ocean Conservation NGO',
    evidenceFiles: [],
    submissionDate: '2024-01-15T00:00:00Z',
    lastUpdated: '2024-09-15T00:00:00Z'
  }
]

// Mock API responses
export const mockApiResponses = {
  login: (user: typeof mockUsers.admin) => ({
    user,
    token: 'mock-token-' + user.id
  }),
  projects: {
    projects: mockProjects,
    total: mockProjects.length
  },
  marketplaceListings: {
    listings: [],
    marketStats: {
      totalVolume: 0,
      averagePrice: 0,
      activeListings: 0,
      dailyChange: '+0%'
    }
  },
  health: {
    status: 'OK',
    timestamp: new Date().toISOString(),
    projects: 0,
    users: 4
  }
}

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0
    },
    mutations: {
      retry: false
    }
  }
})

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
  user?: typeof mockUsers.admin | null
}

export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries = ['/'],
    user = null,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  const testQueryClient = createTestQueryClient()

  function Wrapper({ children }: { children: React.ReactNode }) {
    // Mock AuthContext value
    const mockAuthValue = {
      user,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      error: null
    }

    // Create a mock AuthProvider that uses the mock value
    const MockAuthProvider = ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mock-auth-provider">
        {React.cloneElement(children as ReactElement, {}, 
          React.Children.map((children as ReactElement).props.children, (child: ReactElement) =>
            React.cloneElement(child, { ...mockAuthValue })
          )
        )}
      </div>
    )

    return (
      <QueryClientProvider client={testQueryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <MockAuthProvider>
              {children}
              <Toaster />
            </MockAuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    testQueryClient
  }
}

// Mock fetch helper
export const mockFetch = (response: any, ok = true) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 400,
    json: () => Promise.resolve(response),
  })
}

// Mock API service
export const mockApiService = {
  login: vi.fn(),
  getProfile: vi.fn(),
  getProjects: vi.fn(),
  getProject: vi.fn(),
  submitProject: vi.fn(),
  updateProjectStatus: vi.fn(),
  getPendingVerifications: vi.fn(),
  getAdminStats: vi.fn(),
  getAdminUsers: vi.fn(),
  getMarketplaceListings: vi.fn(),
  purchaseCredits: vi.fn(),
  getTransactions: vi.fn(),
  retireCredits: vi.fn(),
  uploadFile: vi.fn(),
  healthCheck: vi.fn(),
}

// Utility functions for testing
export const waitForLoadingToFinish = async () => {
  const { waitForElementToBeRemoved } = await import('@testing-library/react')
  await waitForElementToBeRemoved(() => document.querySelector('[data-testid="loading"]'))
}

export const mockGeolocation = (latitude = 40.7128, longitude = -74.0060) => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn().mockImplementation((success) => {
      success({
        coords: {
          latitude,
          longitude,
          accuracy: 1
        }
      })
    }),
    watchPosition: vi.fn(),
    clearWatch: vi.fn()
  }

  Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true
  })

  return mockGeolocation
}

export const mockMediaDevices = () => {
  const mockStream = {
    getTracks: () => [{ stop: vi.fn() }],
    getVideoTracks: () => [{ stop: vi.fn() }]
  }

  const mockMediaDevices = {
    getUserMedia: vi.fn().mockResolvedValue(mockStream),
    enumerateDevices: vi.fn().mockResolvedValue([])
  }

  Object.defineProperty(navigator, 'mediaDevices', {
    value: mockMediaDevices,
    writable: true
  })

  return { mockMediaDevices, mockStream }
}

export const createMockFile = (name = 'test.jpg', type = 'image/jpeg', size = 1024) => {
  const file = new File(['dummy content'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'