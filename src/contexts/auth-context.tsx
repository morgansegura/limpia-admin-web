"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, User, Tenant, LoginRequest, RegisterRequest } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      const storedTenant = localStorage.getItem('tenant');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Try to use stored user data first for faster loading
      if (storedUser && storedTenant) {
        try {
          setUser(JSON.parse(storedUser));
          setTenant(JSON.parse(storedTenant));
        } catch (parseError) {
          console.error('Failed to parse stored user data:', parseError);
        }
      }

      // Verify token and get fresh user info
      try {
        const response = await authApi.getMe();
        setUser(response.user);
        
        // Extract tenant from user object if nested, otherwise use direct tenant
        const tenant = response.user?.tenant || response.tenant;
        if (tenant) {
          setTenant(tenant);
          localStorage.setItem('tenant', JSON.stringify(tenant));
        }
        
        // Update stored data
        localStorage.setItem('user', JSON.stringify(response.user));
      } catch (apiError) {
        console.error('Failed to refresh user data:', apiError);
        // If API call fails but we have stored data, continue with stored data
        if (!storedUser || !storedTenant) {
          throw apiError;
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      // Clear invalid token
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);
      
      // Store tokens and user data
      localStorage.setItem('access_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Extract tenant from user object if nested, otherwise use direct tenant
      const tenant = response.user?.tenant || response.tenant;
      if (tenant) {
        localStorage.setItem('tenant', JSON.stringify(tenant));
        setTenant(tenant);
      }
      
      setUser(response.user);
      
      // Redirect to dashboard
      router.push('/');
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(userData);
      
      // Store tokens and user data
      localStorage.setItem('access_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Extract tenant from user object if nested, otherwise use direct tenant
      const tenant = response.user?.tenant || response.tenant;
      if (tenant) {
        localStorage.setItem('tenant', JSON.stringify(tenant));
        setTenant(tenant);
      }
      
      setUser(response.user);
      
      // Redirect to dashboard
      router.push('/');
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');
    
    // Clear state
    setUser(null);
    setTenant(null);
    
    // Redirect to login
    router.push('/auth/login');
  };

  const forgotPassword = async (email: string) => {
    try {
      await authApi.forgotPassword(email);
    } catch (error: any) {
      console.error('Forgot password failed:', error);
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      await authApi.resetPassword(token, password);
    } catch (error: any) {
      console.error('Reset password failed:', error);
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getMe();
      setUser(response.user);
      
      // Extract tenant from user object if nested, otherwise use direct tenant
      const tenant = response.user?.tenant || response.tenant;
      if (tenant) {
        setTenant(tenant);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    tenant,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Role-based access control hook
export function usePermissions() {
  const { user } = useAuth();

  const hasRole = (requiredRoles: string | string[]) => {
    if (!user) return false;
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(user.role);
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    
    // Handle both array and object permissions format
    if (Array.isArray(user.permissions)) {
      return user.permissions.includes(permission);
    } else if (typeof user.permissions === 'object' && user.permissions !== null) {
      return user.permissions[permission] === true;
    }
    
    return false;
  };

  const canAccessFeature = (feature: string) => {
    if (!user) return false;

    // Define feature access based on roles
    const featureAccess: Record<string, string[]> = {
      'sales': ['FRANCHISE_OWNER', 'LOCATION_MANAGER', 'SUPERVISOR', 'SALES_REP', 'SALES_MANAGER', 'CORPORATE_EXECUTIVE', 'CORPORATE_ADMIN', 'CORPORATE_SUPPORT'],
      'customers': ['FRANCHISE_OWNER', 'LOCATION_MANAGER', 'SUPERVISOR', 'EMPLOYEE', 'SALES_REP', 'SALES_MANAGER', 'CORPORATE_EXECUTIVE', 'CORPORATE_ADMIN', 'CORPORATE_SUPPORT'],
      'crews': ['FRANCHISE_OWNER', 'LOCATION_MANAGER', 'SUPERVISOR', 'CORPORATE_EXECUTIVE', 'CORPORATE_ADMIN'],
      'jobs': ['FRANCHISE_OWNER', 'LOCATION_MANAGER', 'SUPERVISOR', 'EMPLOYEE', 'CORPORATE_EXECUTIVE', 'CORPORATE_ADMIN', 'CORPORATE_SUPPORT'],
      'inventory': ['FRANCHISE_OWNER', 'LOCATION_MANAGER', 'SUPERVISOR', 'CORPORATE_EXECUTIVE', 'CORPORATE_ADMIN'],
      'analytics': ['FRANCHISE_OWNER', 'LOCATION_MANAGER', 'CORPORATE_EXECUTIVE', 'CORPORATE_ADMIN', 'CORPORATE_SUPPORT'],
      'admin': ['FRANCHISE_OWNER', 'CORPORATE_EXECUTIVE', 'CORPORATE_ADMIN'],
      'corporate': ['CORPORATE_EXECUTIVE', 'CORPORATE_ADMIN'], // Multi-tenant oversight, franchise management
      'franchiseOversight': ['CORPORATE_EXECUTIVE', 'CORPORATE_ADMIN'], // View all franchises
      'systemAdmin': ['CORPORATE_EXECUTIVE'], // CEO-level system administration
    };

    const allowedRoles = featureAccess[feature];
    return allowedRoles ? hasRole(allowedRoles) : false;
  };

  return {
    hasRole,
    hasPermission,
    canAccessFeature,
    user,
  };
}