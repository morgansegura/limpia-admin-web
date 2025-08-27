"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

import "@/styles/auth-screen.css";

import { FormItem } from "@/components/ui/form";
import { LogoText } from "@/components/logo/logo";

export default function LoginPage() {
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    tenantSlug: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login({
        email: formData.email,
        password: formData.password,
        tenantSlug: formData.tenantSlug || undefined,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth-screen">
      <Card className="card-display">
        <div className="logo-block">
          <LogoText />
        </div>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormItem>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@company.com"
                required
                disabled={isLoading}
              />
            </FormItem>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenantSlug">Business ID (Optional)</Label>
              <Input
                id="tenantSlug"
                name="tenantSlug"
                type="text"
                value={formData.tenantSlug}
                onChange={handleInputChange}
                placeholder="my-business"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty if you&apos;re unsure
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign-in to your account"
              )}
            </Button>

            <div className="flex items-center justify-center text-sm">
              <Link
                href="/auth/forgot-password"
                className="text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </form>
        </CardContent>

        {/* Development demo credentials - only show in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-center text-xs text-yellow-800">
              <p className="font-medium mb-2">Development Demo Accounts:</p>
              <div className="space-y-1">
                <p>
                  <strong>CEO:</strong> admin@limpia.com / admin123
                </p>
                <p>
                  <strong>Owner:</strong> owner@limpia.com / franchise123
                  (miami)
                </p>
                <p>
                  <strong>Manager:</strong> salesmanager@limpia.com / sales123
                  (miami)
                </p>
                <p>
                  <strong>Sales Rep:</strong> sales@limpia.com / sales123
                  (miami)
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
