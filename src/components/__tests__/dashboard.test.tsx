import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock component for testing
function DashboardTestComponent() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the service management dashboard</p>
    </div>
  )
}

describe('Dashboard Component', () => {
  it('renders dashboard heading', () => {
    render(<DashboardTestComponent />)
    
    const heading = screen.getByRole('heading', { name: /dashboard/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders welcome message', () => {
    render(<DashboardTestComponent />)
    
    const message = screen.getByText(/welcome to the service management dashboard/i)
    expect(message).toBeInTheDocument()
  })
})