import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
  tenantSlug?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  tenant: Tenant;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  permissions: Record<string, boolean> | string[];
  isCorporate: boolean;
  tenant?: Tenant;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  CORPORATE_EXECUTIVE = 'CORPORATE_EXECUTIVE',   // CEO, CTO - cross-tenant access
  CORPORATE_ADMIN = 'CORPORATE_ADMIN',           // Corporate operations team
  CORPORATE_SUPPORT = 'CORPORATE_SUPPORT',       // Customer support - limited cross-tenant
  FRANCHISE_OWNER = 'FRANCHISE_OWNER',           // Franchisee - full location access
  LOCATION_MANAGER = 'LOCATION_MANAGER',         // Location manager
  SALES_MANAGER = 'SALES_MANAGER',               // Sales team manager
  SALES_REP = 'SALES_REP',                       // Sales representative
  SUPERVISOR = 'SUPERVISOR',                     // Shift supervisor
  EMPLOYEE = 'EMPLOYEE',                         // Staff member
}

// Auth API methods
export const authApi = {
  login: (credentials: LoginRequest): Promise<LoginResponse> =>
    api.post('/auth/login', credentials).then(res => res.data),

  register: (userData: RegisterRequest): Promise<LoginResponse> =>
    api.post('/auth/register', userData).then(res => res.data),

  forgotPassword: (email: string): Promise<{ message: string }> =>
    api.post('/auth/forgot-password', { email }).then(res => res.data),

  resetPassword: (token: string, password: string): Promise<{ message: string }> =>
    api.post('/auth/reset-password', { token, password }).then(res => res.data),

  getMe: (): Promise<{ user: User; tenant: Tenant }> =>
    api.get('/auth/me').then(res => res.data),

  refresh: (): Promise<{ access_token: string }> =>
    api.post('/auth/refresh').then(res => res.data),
};

// Customers API
export const customersApi = {
  getAll: (filters?: Record<string, unknown>): Promise<unknown[]> =>
    api.get('/customers', { params: filters }).then(res => res.data),

  getById: (id: string): Promise<unknown> =>
    api.get(`/customers/${id}`).then(res => res.data),

  create: (customerData: unknown): Promise<unknown> =>
    api.post('/customers', customerData).then(res => res.data),

  update: (id: string, customerData: unknown): Promise<unknown> =>
    api.put(`/customers/${id}`, customerData).then(res => res.data),

  delete: (id: string): Promise<void> =>
    api.delete(`/customers/${id}`).then(res => res.data),

  sendCommunication: (id: string, communicationData: unknown): Promise<unknown> =>
    api.post(`/customers/${id}/communication`, communicationData).then(res => res.data),

  getBookings: (id: string): Promise<unknown[]> =>
    api.get(`/customers/${id}/bookings`).then(res => res.data),

  getStats: (): Promise<unknown> =>
    api.get('/customers/stats').then(res => res.data),
};

// Sales API
export const salesApi = {
  getQuickPrice: (priceData: unknown): Promise<unknown> =>
    api.post('/sales/quick-price', priceData).then(res => res.data),

  createEstimate: (estimateData: unknown): Promise<unknown> =>
    api.post('/sales/estimates', estimateData).then(res => res.data),

  getEstimates: (myEstimatesOnly?: boolean): Promise<unknown[]> =>
    api.get('/sales/estimates', { 
      params: myEstimatesOnly ? { 'my-estimates': 'true' } : {} 
    }).then(res => res.data),

  getMyEstimates: (): Promise<unknown[]> =>
    api.get('/sales/estimates/my').then(res => res.data),

  getEstimate: (id: string): Promise<unknown> =>
    api.get(`/sales/estimates/${id}`).then(res => res.data),

  sendEstimate: (id: string): Promise<unknown> =>
    api.put(`/sales/estimates/${id}/send`).then(res => res.data),

  acceptEstimate: (id: string): Promise<unknown> =>
    api.put(`/sales/estimates/${id}/accept`).then(res => res.data),

  rejectEstimate: (id: string): Promise<unknown> =>
    api.put(`/sales/estimates/${id}/reject`).then(res => res.data),

  convertToBooking: (id: string, bookingData: unknown): Promise<unknown> =>
    api.post(`/sales/estimates/${id}/convert-to-booking`, bookingData).then(res => res.data),

  getCommissionInfo: (): Promise<unknown> =>
    api.get('/sales/commission-calculator').then(res => res.data),

  // Discount tracking and approval
  getDiscountBudget: (userId?: string): Promise<{
    used: number;
    limit: number;
    period: string;
    periodStart: string;
    periodEnd: string;
  }> =>
    api.get('/sales/discount-budget', { params: { userId } }).then(res => res.data),

  requestDiscountApproval: (approvalData: {
    estimateId?: string;
    discountAmount: number;
    discountPercentage: number;
    justification: string;
    customerInfo: unknown;
  }): Promise<unknown> =>
    api.post('/sales/discount-approval', approvalData).then(res => res.data),

  getDiscountApprovals: (filters?: {
    status?: 'pending' | 'approved' | 'rejected';
    userId?: string;
    managerId?: string;
  }): Promise<unknown[]> =>
    api.get('/sales/discount-approvals', { params: filters }).then(res => res.data),

  approveDiscount: (approvalId: string, decision: 'approved' | 'rejected', notes?: string): Promise<unknown> =>
    api.put(`/sales/discount-approvals/${approvalId}`, { decision, notes }).then(res => res.data),

  getDiscountAnalytics: (dateRange?: { from: string; to: string }): Promise<{
    totalDiscountsGiven: number;
    averageDiscount: number;
    discountImpactOnMargin: number;
    topDiscountReasons: unknown[];
    salesRepPerformance: unknown[];
  }> =>
    api.get('/sales/discount-analytics', { params: dateRange }).then(res => res.data),

  // Commission tracking APIs
  getMyCommissions: (): Promise<unknown[]> =>
    api.get('/sales/commissions/my').then(res => res.data),

  getCommissionSummary: (): Promise<{
    thisMonth: { total: number; paid: number; pending: number; count: number };
    lastMonth: { total: number; paid: number; pending: number; count: number };
    yearToDate: { total: number; paid: number; pending: number; count: number };
    currentTier: string;
    nextTierTarget: number;
    nextTierBonus: number;
  }> =>
    api.get('/sales/commissions/summary').then(res => res.data),

  // Workflow endpoints
  initiateContract: (estimateId: string, contractData: unknown): Promise<unknown> =>
    api.post(`/sales/estimates/${estimateId}/contract`, contractData).then(res => res.data),

  getContractStatus: (contractId: string): Promise<unknown> =>
    api.get(`/contracts/${contractId}/status`).then(res => res.data),

  scheduleService: (estimateId: string, scheduleData: unknown): Promise<unknown> =>
    api.post(`/sales/estimates/${estimateId}/schedule`, scheduleData).then(res => res.data),

  getAvailableSlots: (date: string, serviceType: string): Promise<unknown[]> =>
    api.get(`/scheduling/available-slots`, { params: { date, serviceType } }).then(res => res.data),

  processPayment: (estimateId: string, paymentData: unknown): Promise<unknown> =>
    api.post(`/sales/estimates/${estimateId}/payment`, paymentData).then(res => res.data),

  sendCustomerNotification: (customerId: string, notificationType: string, data: unknown): Promise<unknown> =>
    api.post(`/notifications/customer/${customerId}`, { type: notificationType, data }).then(res => res.data),
};

// Jobs API
export const jobsApi = {
  getAll: (filters?: Record<string, unknown>): Promise<unknown[]> =>
    api.get('/jobs', { params: filters }).then(res => res.data),

  getById: (id: string): Promise<unknown> =>
    api.get(`/jobs/${id}`).then(res => res.data),

  create: (jobData: unknown): Promise<unknown> =>
    api.post('/jobs', jobData).then(res => res.data),

  update: (id: string, jobData: unknown): Promise<unknown> =>
    api.put(`/jobs/${id}`, jobData).then(res => res.data),

  updateStatus: (id: string, status: string, notes?: string): Promise<unknown> =>
    api.put(`/jobs/${id}/status`, { status, notes }).then(res => res.data),

  assignCrew: (id: string, crewId: string): Promise<unknown> =>
    api.put(`/jobs/${id}/assign-crew`, { crewId }).then(res => res.data),

  getStats: (): Promise<unknown> =>
    api.get('/jobs/stats').then(res => res.data),

  assignJob: (jobId: string, assignmentData: unknown): Promise<unknown> =>
    api.put(`/jobs/${jobId}/assign`, assignmentData).then(res => res.data),

  updateJobStatus: (jobId: string, status: string, notes?: string): Promise<unknown> =>
    api.put(`/jobs/${jobId}/status`, { status, notes }).then(res => res.data),
};

// Crews API  
export const crewsApi = {
  getAll: (): Promise<unknown[]> =>
    api.get('/crews').then(res => res.data),

  getById: (id: string): Promise<unknown> =>
    api.get(`/crews/${id}`).then(res => res.data),

  create: (crewData: unknown): Promise<unknown> =>
    api.post('/crews', crewData).then(res => res.data),

  update: (id: string, crewData: unknown): Promise<unknown> =>
    api.put(`/crews/${id}`, crewData).then(res => res.data),

  delete: (id: string): Promise<void> =>
    api.delete(`/crews/${id}`).then(res => res.data),

  updateJobStatus: (crewId: string, jobId: string, statusData: unknown): Promise<unknown> =>
    api.put(`/crews/${crewId}/jobs/${jobId}/status`, statusData).then(res => res.data),

  clockIn: (crewId: string, locationData: unknown): Promise<unknown> =>
    api.post(`/crews/${crewId}/clock-in`, locationData).then(res => res.data),

  clockOut: (crewId: string, locationData: unknown): Promise<unknown> =>
    api.post(`/crews/${crewId}/clock-out`, locationData).then(res => res.data),

  assignJobToCrew: (assignmentData: {
    jobId: string;
    crewId: string;
    assignedBy: string;
    estimatedDuration: number;
    notes?: string;
  }): Promise<unknown> =>
    api.post('/crews/jobs/assign', assignmentData).then(res => res.data),

  getPerformanceStats: (): Promise<unknown> =>
    api.get('/crews/performance-stats').then(res => res.data),

  contactCrew: (crewId: string, method: 'call' | 'message', data: unknown): Promise<unknown> =>
    api.post(`/crews/${crewId}/contact`, { method, ...data }).then(res => res.data),

  getCrewLocation: (crewId: string): Promise<unknown> =>
    api.get(`/crews/${crewId}/location`).then(res => res.data),

  updateCrewStatus: (crewId: string, status: string): Promise<unknown> =>
    api.put(`/crews/${crewId}/status`, { status }).then(res => res.data),
};

// Inventory API
export const inventoryApi = {
  getAll: (filters?: Record<string, unknown>): Promise<unknown[]> =>
    api.get('/inventory', { params: filters }).then(res => res.data),

  getById: (id: string): Promise<unknown> =>
    api.get(`/inventory/${id}`).then(res => res.data),

  create: (itemData: unknown): Promise<unknown> =>
    api.post('/inventory', itemData).then(res => res.data),

  update: (id: string, itemData: unknown): Promise<unknown> =>
    api.put(`/inventory/${id}`, itemData).then(res => res.data),

  delete: (id: string): Promise<void> =>
    api.delete(`/inventory/${id}`).then(res => res.data),

  updateStock: (id: string, quantity: number, type: 'add' | 'remove', notes?: string): Promise<unknown> =>
    api.post(`/inventory/${id}/stock`, { quantity, type, notes }).then(res => res.data),

  getLowStockItems: (): Promise<unknown[]> =>
    api.get('/inventory/low-stock').then(res => res.data),

  getStats: (): Promise<unknown> =>
    api.get('/inventory/stats').then(res => res.data),
};

// Analytics API
export const analyticsApi = {
  getSalesMetrics: (dateRange?: { start: string; end: string }): Promise<unknown> =>
    api.get('/analytics/sales', { params: dateRange }).then(res => res.data),

  getCrewPerformance: (dateRange?: { start: string; end: string }): Promise<unknown> =>
    api.get('/analytics/crew-performance', { params: dateRange }).then(res => res.data),

  getCustomerInsights: (dateRange?: { start: string; end: string }): Promise<unknown> =>
    api.get('/analytics/customer-insights', { params: dateRange }).then(res => res.data),

  getRevenueTrends: (dateRange?: { start: string; end: string }): Promise<unknown> =>
    api.get('/analytics/revenue-trends', { params: dateRange }).then(res => res.data),

  getOperationalMetrics: (): Promise<unknown> =>
    api.get('/analytics/operational').then(res => res.data),

  getRealTimeMetrics: (): Promise<unknown> =>
    api.get('/analytics/real-time').then(res => res.data),

  getSalesManagerDashboard: (dateRange?: { from: string; to: string }): Promise<unknown> =>
    api.get('/analytics/sales-dashboard', { params: dateRange }).then(res => res.data),
};

// Dashboard API - consolidates stats from multiple endpoints
export const dashboardApi = {
  getOverviewStats: async (): Promise<unknown> => {
    // Fetch each endpoint individually and handle failures gracefully
    const fetchWithFallback = async (fetchFn: () => Promise<unknown>, fallback: unknown = {}) => {
      try {
        return await fetchFn();
      } catch (error) {
        console.warn('API endpoint failed, using fallback:', error);
        return fallback;
      }
    };

    try {
      const [
        analyticsData,
        jobStats,
        customerStats,
        bookingStats,
        inventoryStats
      ] = await Promise.all([
        fetchWithFallback(() => analyticsApi.getRealTimeMetrics(), {}),
        fetchWithFallback(() => jobsApi.getStats(), {}),
        fetchWithFallback(() => customersApi.getStats(), {}),
        fetchWithFallback(() => api.get('/bookings/stats').then(res => res.data), {}),
        fetchWithFallback(() => inventoryApi.getStats(), {}),
      ]);

      return {
        analytics: analyticsData,
        jobs: jobStats,
        customers: customerStats,
        bookings: bookingStats,
        inventory: inventoryStats,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  getRecentActivity: (limit?: number): Promise<ActivityItem[]> =>
    activityApi.getRecent(limit),
};

// Payments API
export const paymentsApi = {
  getAll: (filters?: Record<string, unknown>): Promise<unknown[]> =>
    api.get('/payments', { params: filters }).then(res => res.data),

  getById: (id: string): Promise<unknown> =>
    api.get(`/payments/${id}`).then(res => res.data),

  processRefund: (paymentId: string, amount?: number, reason?: string): Promise<unknown> =>
    api.post(`/payments/${paymentId}/refund`, { amount, reason }).then(res => res.data),

  retryPayment: (paymentId: string): Promise<unknown> =>
    api.post(`/payments/${paymentId}/retry`).then(res => res.data),

  getStats: (): Promise<unknown> =>
    api.get('/payments/stats').then(res => res.data),

  getSubscriptions: (): Promise<unknown[]> =>
    api.get('/payments/subscriptions').then(res => res.data),

  updateSubscription: (subscriptionId: string, data: unknown): Promise<unknown> =>
    api.put(`/payments/subscriptions/${subscriptionId}`, data).then(res => res.data),

  cancelSubscription: (subscriptionId: string, reason?: string): Promise<unknown> =>
    api.post(`/payments/subscriptions/${subscriptionId}/cancel`, { reason }).then(res => res.data),

  pauseSubscription: (subscriptionId: string): Promise<unknown> =>
    api.post(`/payments/subscriptions/${subscriptionId}/pause`).then(res => res.data),

  resumeSubscription: (subscriptionId: string): Promise<unknown> =>
    api.post(`/payments/subscriptions/${subscriptionId}/resume`).then(res => res.data),

  getInvoices: (): Promise<unknown[]> =>
    api.get('/payments/invoices').then(res => res.data),

  createInvoice: (invoiceData: unknown): Promise<unknown> =>
    api.post('/payments/invoices', invoiceData).then(res => res.data),

  sendInvoice: (invoiceId: string): Promise<unknown> =>
    api.post(`/payments/invoices/${invoiceId}/send`).then(res => res.data),

  exportPayments: (filters?: Record<string, unknown>): Promise<Blob> =>
    api.get('/payments/export', { params: filters, responseType: 'blob' }).then(res => res.data),
};

// Message Templates API
export interface MessageTemplate {
  id: string;
  name: string;
  type: string;
  method: string;
  subject: string;
  message: string;
  variables: string[];
  isSystem: boolean;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateTemplateRequest {
  name: string;
  type: string;
  method: string;
  subject: string;
  message: string;
  variables?: string[];
  isActive?: boolean;
}

export interface TemplateFilters {
  search?: string;
  type?: string;
  method?: string;
  isSystem?: boolean;
  isActive?: boolean;
}

export const templatesApi = {
  getAll: (filters?: TemplateFilters): Promise<MessageTemplate[]> =>
    api.get('/templates', { params: filters }).then(res => res.data),

  getById: (id: string): Promise<MessageTemplate> =>
    api.get(`/templates/${id}`).then(res => res.data),

  create: (templateData: CreateTemplateRequest): Promise<MessageTemplate> =>
    api.post('/templates', templateData).then(res => res.data),

  update: (id: string, templateData: Partial<CreateTemplateRequest>): Promise<MessageTemplate> =>
    api.put(`/templates/${id}`, templateData).then(res => res.data),

  delete: (id: string): Promise<void> =>
    api.delete(`/templates/${id}`).then(res => res.data),

  getSystemTemplates: (): Promise<MessageTemplate[]> =>
    api.get('/templates/system').then(res => res.data),

  getByType: (type: string): Promise<MessageTemplate[]> =>
    api.get(`/templates/type/${type}`).then(res => res.data),

  incrementUsage: (id: string): Promise<{ message: string }> =>
    api.post(`/templates/${id}/use`).then(res => res.data),
};

// Customer Communications API
export interface CustomerCommunication {
  id: string;
  type: string;
  direction: string;
  subject?: string;
  content: string;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  respondedAt?: string;
  metadata: Record<string, unknown>;
  isAutomated: boolean;
  createdAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  initiatedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface SendCommunicationRequest {
  method: string;
  type: string;
  subject: string;
  message: string;
  bookingIds?: string[];
}

export const communicationsApi = {
  getCustomerCommunications: (customerId: string): Promise<CustomerCommunication[]> =>
    api.get(`/customers/${customerId}/communications`).then(res => res.data),

  sendCommunication: (customerId: string, data: SendCommunicationRequest): Promise<CustomerCommunication> =>
    api.post(`/customers/${customerId}/communication`, data).then(res => res.data),

  getCommunicationStats: (customerId: string): Promise<unknown> =>
    api.get(`/customers/${customerId}/communications/stats`).then(res => res.data),
};

// Leads Management API
export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  source: string;
  status: string;
  priority: string;
  propertyType?: string;
  squareFootage?: number;
  serviceNeeded?: string;
  budget?: number;
  timeline?: string;
  score: number;
  notes?: string;
  address?: unknown;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  interactions?: LeadInteraction[];
}

export interface LeadInteraction {
  id: string;
  type: string;
  notes: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateLeadRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  source: string;
  priority?: string;
  propertyType?: string;
  squareFootage?: number;
  serviceNeeded?: string;
  budget?: number;
  timeline?: string;
  score?: number;
  notes?: string;
  address?: unknown;
}

export interface LeadFilters {
  search?: string;
  status?: string;
  priority?: string;
  source?: string;
  assignedTo?: string;
  minScore?: number;
  maxScore?: number;
}

export const leadsApi = {
  getAll: (filters?: LeadFilters): Promise<Lead[]> =>
    api.get('/leads', { params: filters }).then(res => res.data),

  getById: (id: string): Promise<Lead> =>
    api.get(`/leads/${id}`).then(res => res.data),

  create: (leadData: CreateLeadRequest): Promise<Lead> =>
    api.post('/leads', leadData).then(res => res.data),

  update: (id: string, leadData: Partial<CreateLeadRequest>): Promise<Lead> =>
    api.put(`/leads/${id}`, leadData).then(res => res.data),

  delete: (id: string): Promise<void> =>
    api.delete(`/leads/${id}`).then(res => res.data),

  assign: (id: string, assignedToId: string): Promise<Lead> =>
    api.put(`/leads/${id}/assign`, { assignedToId }).then(res => res.data),

  addInteraction: (id: string, type: string, notes: string): Promise<LeadInteraction> =>
    api.post(`/leads/${id}/interactions`, { type, notes }).then(res => res.data),

  getStats: (): Promise<unknown> =>
    api.get('/leads/stats').then(res => res.data),
};

// Activity API
export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, unknown>;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ActivityFilters {
  type?: string;
  entityType?: string;
  userId?: string;
  limit?: number;
  page?: number;
  dateFrom?: string;
  dateTo?: string;
}

export const activityApi = {
  getRecent: (limit?: number): Promise<ActivityItem[]> =>
    api.get('/activity/recent', { params: { limit: limit || 10 } }).then(res => res.data),

  getAll: (filters?: ActivityFilters): Promise<PaginatedResponse<ActivityItem>> =>
    api.get('/activity', { params: filters }).then(res => res.data),

  getById: (id: string): Promise<ActivityItem> =>
    api.get(`/activity/${id}`).then(res => res.data),

  getByEntity: (entityType: string, entityId: string): Promise<ActivityItem[]> =>
    api.get(`/activity/${entityType}/${entityId}`).then(res => res.data),

  create: (activityData: {
    type: string;
    title: string;
    description: string;
    entityId?: string;
    entityType?: string;
    metadata?: Record<string, unknown>;
  }): Promise<ActivityItem> =>
    api.post('/activity', activityData).then(res => res.data),
};

export default api;