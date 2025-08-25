# Limpia Dashboard

A comprehensive web-based management interface for cleaning service businesses, built with Next.js 15 and modern React patterns.

## 🚀 Features

- **Business Management** - Complete dashboard for service operations
- **Authentication** - Secure JWT-based login with role-based access
- **Customer Management** - CRM functionality for client relationships
- **Job Scheduling** - Advanced booking and scheduling system
- **Crew Management** - Team coordination and time tracking
- **Sales Pipeline** - Estimate creation and conversion tracking
- **Analytics Dashboard** - Real-time business insights and reporting
- **Responsive Design** - Mobile-first UI that works on all devices
- **Dark/Light Mode** - User preference theme switching

## 📋 Prerequisites

- Node.js 18+
- npm or pnpm
- Backend API running (see ../backend/README.md)

## ⚙️ Installation

1. **Navigate to dashboard directory**
   ```bash
   cd dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env.local` file:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   
   # Environment
   NEXT_PUBLIC_ENVIRONMENT=development
   
   # App Configuration
   NEXT_PUBLIC_APP_NAME=Limpia Dashboard
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

## 🚦 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

The dashboard will be available at http://localhost:3000

## 🔐 Authentication

### Test Credentials
After seeding the backend database, use these credentials:

**Admin Login:**
- Email: `admin@limpia.com`
- Password: `admin123`
- Tenant: `limpia`

**Employee Login:**
- Email: `employee@limpia.com`
- Password: `admin123`
- Tenant: `limpia`

### Login Process
1. Navigate to http://localhost:3000
2. If not authenticated, you'll be redirected to `/auth/login`
3. Enter credentials and tenant slug
4. Upon successful login, you'll be redirected to the dashboard

## 🏗️ Application Structure

### Core Features

- **Dashboard Overview** - Key metrics and quick actions
- **Customer Management** - Client profiles, communication history
- **Service Catalog** - Service definitions and pricing
- **Bookings** - Job scheduling and management
- **Crew Management** - Team coordination and assignments
- **Sales Pipeline** - Estimates, quotes, and conversions
- **Analytics** - Business intelligence and reporting
- **User Management** - Team member profiles and permissions

### User Roles & Access

- **FRANCHISE_OWNER** - Full access to all features
- **LOCATION_MANAGER** - Location-specific management
- **SUPERVISOR** - Crew and job oversight
- **EMPLOYEE** - Limited access to assigned tasks

## 📁 Project Structure

```
dashboard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── customers/         # Customer management
│   │   ├── bookings/          # Job scheduling
│   │   ├── crews/             # Team management
│   │   ├── sales/             # Sales pipeline
│   │   └── analytics/         # Reporting
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components
│   │   ├── auth/             # Authentication components
│   │   ├── dashboard/        # Dashboard widgets
│   │   ├── forms/            # Form components
│   │   └── layout/           # Layout components
│   ├── lib/                  # Utilities and configurations
│   │   ├── api.ts           # API client and endpoints
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── utils.ts         # General utilities
│   │   └── validations.ts   # Form validation schemas
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   └── styles/              # Global styles and Tailwind
├── public/                  # Static assets
└── docs/                   # Component documentation
```

## 🎨 UI Components

Built with:
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide Icons** - Beautiful icon library
- **Shadcn/UI** - High-quality component library

### Key Components

- **AppLayout** - Main dashboard layout with sidebar
- **ProtectedRoute** - Authentication wrapper
- **DataTable** - Advanced table with sorting/filtering
- **FormBuilder** - Dynamic form generation
- **Modal** - Reusable modal dialogs
- **LoadingStates** - Consistent loading indicators

## 🔌 API Integration

### API Client Configuration
```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Automatic token management
// CORS support for development
// Error handling and retry logic
```

### Available API Modules
- `authApi` - Authentication and user management
- `customersApi` - Customer relationship management
- `salesApi` - Estimates and sales pipeline
- `jobsApi` - Job and booking management
- `crewsApi` - Team and crew management
- `analyticsApi` - Business intelligence

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # TypeScript type checking

# Testing
npm run test            # Run Jest tests
npm run test:e2e        # Run Playwright E2E tests
```

## 🎯 Key Features Walkthrough

### 1. Dashboard Overview
- Real-time business metrics
- Quick action buttons
- Recent activity feed
- Performance indicators

### 2. Customer Management
- Customer profiles and contact info
- Communication history tracking
- Booking history and preferences
- Customer lifecycle analytics

### 3. Job Scheduling
- Calendar-based scheduling interface
- Crew assignment and optimization
- Service customization and pricing
- Status tracking and updates

### 4. Sales Pipeline
- Estimate creation and management
- Quote generation and sending
- Conversion tracking and analytics
- Customer communication tools

### 5. Analytics & Reporting
- Revenue and profit tracking
- Crew performance metrics
- Customer satisfaction scores
- Business trend analysis

## 🔧 Configuration

### Environment Variables
```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_ENVIRONMENT=development

# Optional
NEXT_PUBLIC_APP_NAME=Limpia Dashboard
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Theme Configuration
```typescript
// tailwind.config.js
// Customize colors, fonts, and spacing
// Dark mode support
// Responsive breakpoints
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker Deployment
```bash
# Build image
docker build -t limpia-dashboard .

# Run container
docker run -p 3000:3000 limpia-dashboard
```

### Environment Variables for Production
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
NEXT_PUBLIC_ENVIRONMENT=production
```

## 🔗 Integration

### Backend API
- Ensure backend is running on port 8000
- CORS configured for localhost:3000
- JWT tokens automatically managed

### Mobile Apps
- Shared design system
- Consistent API endpoints
- Cross-platform user experience

## 🤝 Contributing

1. Follow the component structure in `/components`
2. Use TypeScript for type safety
3. Write tests for new features
4. Follow the established coding patterns
5. Update documentation for new features

## 📞 Support

### Troubleshooting
1. **Login Issues**: Check backend API is running
2. **CORS Errors**: Verify API URL in environment variables
3. **Build Errors**: Clear `.next` cache and reinstall dependencies

### Common Commands
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check API connectivity
curl http://localhost:8000/api/v1/health
```

## 🔗 Related Applications

- **Backend API**: Core business logic and database
- **Customer App**: Customer-facing booking interface
- **Mobile Apps**: iOS/Android applications for field teams
