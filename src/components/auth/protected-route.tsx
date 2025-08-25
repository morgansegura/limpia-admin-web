"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, usePermissions } from '@/contexts/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredFeature?: string;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRoles,
  requiredFeature,
  requiredPermissions,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasRole, hasPermission, canAccessFeature } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Check role-based access
  if (requiredRoles && !hasRole(requiredRoles)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h3 className="mt-4 text-lg font-semibold">Access Denied</h3>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              You don&apos;t have the required permissions to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check feature-based access
  if (requiredFeature && !canAccessFeature(requiredFeature)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h3 className="mt-4 text-lg font-semibold">Feature Unavailable</h3>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              This feature is not available for your account type.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check permission-based access
  if (requiredPermissions && !requiredPermissions.every(permission => hasPermission(permission))) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h3 className="mt-4 text-lg font-semibold">Insufficient Permissions</h3>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              You need additional permissions to access this feature.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    requiredRoles?: string[];
    requiredFeature?: string;
    requiredPermissions?: string[];
  }
) {
  const AuthenticatedComponent = (props: P) => {
    return (
      <ProtectedRoute
        requiredRoles={options?.requiredRoles}
        requiredFeature={options?.requiredFeature}
        requiredPermissions={options?.requiredPermissions}
      >
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return AuthenticatedComponent;
}