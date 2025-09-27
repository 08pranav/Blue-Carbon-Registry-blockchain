import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import SubmitProjectWizard from './SubmitProjectWizard'
import { fetchMock } from '@/test/setup'

// Mock the API service
vi.mock('@/services/api', () => ({
  apiService: {
    submitProject: vi.fn().mockResolvedValue({ success: true })
  }
}))

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}))

const mockUser = {
  id: 'ngo-user-1',
  name: 'Test NGO User',
  email: 'ngo@test.com',
  role: 'NGO' as const,
  organization: 'Test NGO',
  isEmailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('SubmitProjectWizard', () => {
  beforeEach(() => {
    // Mock localStorage to return the NGO user
    localStorage.setItem('auth-token', 'mock-token')
    localStorage.setItem('auth-user', JSON.stringify(mockUser))
    
    // Mock API responses
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('/api/auth/profile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: mockUser })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    })
  })

  it('renders the first step correctly', async () => {
    renderWithProviders(<SubmitProjectWizard />)
    
    await waitFor(() => {
      expect(screen.getByText('Submit New Project')).toBeInTheDocument()
      expect(screen.getByText('Step 1 of 5: Project Details')).toBeInTheDocument()
      expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    })
  })

  it('validates required fields on first step', async () => {
    renderWithProviders(<SubmitProjectWizard />)
    
    await waitFor(() => {
      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Project name is required')).toBeInTheDocument()
      expect(screen.getByText('Project description is required')).toBeInTheDocument()
      expect(screen.getByText('Select an ecosystem')).toBeInTheDocument()
    })
  })

  it('progresses to next step when first step is valid', async () => {
    renderWithProviders(<SubmitProjectWizard />)
    
    await waitFor(() => {
      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/Project Name/i), {
        target: { value: 'Test Mangrove Project' }
      })
      fireEvent.change(screen.getByLabelText(/Description/i), {
        target: { value: 'A test mangrove restoration project' }
      })
      fireEvent.change(screen.getByLabelText(/Area/i), {
        target: { value: '100' }
      })
    })

    // Select ecosystem
    const ecosystemSelect = screen.getByRole('combobox')
    fireEvent.click(ecosystemSelect)
    await waitFor(() => {
      const mangroveOption = screen.getByText('Mangrove')
      fireEvent.click(mangroveOption)
    })

    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Step 2 of 5: Location')).toBeInTheDocument()
    })
  })

  it('handles location capture', async () => {
    renderWithProviders(<SubmitProjectWizard />)
    
    // Navigate to location step
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Project Name/i), {
        target: { value: 'Test Project' }
      })
      fireEvent.change(screen.getByLabelText(/Description/i), {
        target: { value: 'Test description' }
      })
      fireEvent.change(screen.getByLabelText(/Area/i), {
        target: { value: '50' }
      })
    })

    // Go to step 2
    fireEvent.click(screen.getByText('Next'))

    await waitFor(() => {
      expect(screen.getByText('Step 2 of 5: Location')).toBeInTheDocument()
      
      // Fill location
      fireEvent.change(screen.getByLabelText(/Location/i), {
        target: { value: 'Test Location, India' }
      })

      // Click GPS capture button
      const gpsButton = screen.getByText('Use Current Location')
      fireEvent.click(gpsButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/Coordinates:/)).toBeInTheDocument()
    })
  })

  it('prevents non-NGO users from accessing', async () => {
    const adminUser = { ...mockUser, role: 'ADMIN' as const }
    localStorage.setItem('auth-user', JSON.stringify(adminUser))
    
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('/api/auth/profile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: adminUser })
        })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })

    renderWithProviders(<SubmitProjectWizard />)
    
    await waitFor(() => {
      expect(screen.getByText('Only NGO users can submit projects.')).toBeInTheDocument()
    })
  })

  it('handles camera functionality', async () => {
    renderWithProviders(<SubmitProjectWizard />)
    
    // Navigate to evidence step (step 3)
    await waitFor(() => {
      // Fill step 1
      fireEvent.change(screen.getByLabelText(/Project Name/i), {
        target: { value: 'Test Project' }
      })
      fireEvent.change(screen.getByLabelText(/Description/i), {
        target: { value: 'Test description' }
      })
      fireEvent.change(screen.getByLabelText(/Area/i), {
        target: { value: '50' }
      })
      fireEvent.click(screen.getByText('Next'))
    })

    await waitFor(() => {
      // Fill step 2
      fireEvent.change(screen.getByLabelText(/Location/i), {
        target: { value: 'Test Location' }
      })
      fireEvent.click(screen.getByText('Use Current Location'))
    })

    await waitFor(() => {
      fireEvent.click(screen.getByText('Next'))
    })

    await waitFor(() => {
      expect(screen.getByText('Step 3 of 5: Evidence')).toBeInTheDocument()
      
      // Test camera activation
      const startCameraButton = screen.getByText('Start Camera')
      fireEvent.click(startCameraButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Stop Camera')).toBeInTheDocument()
    })
  })
})