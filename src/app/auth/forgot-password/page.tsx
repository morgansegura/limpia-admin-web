"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 text-green-600 rounded-full p-3">
                <CheckCircle className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-center">
              We&apos;ve sent a password reset link to your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                If you don&apos;t see the email in your inbox, check your spam
                folder.
              </p>
              <p className="mt-2">The reset link will expire in 1 hour.</p>
            </div>

            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail("");
                  setError("");
                }}
                variant="outline"
                className="w-full"
              >
                Send another email
              </Button>

              <Link href="/auth/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary text-primary-foreground rounded-lg p-3">
              <span className="text-2xl font-bold">L</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we&apos;ll send you a link to reset
            your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <div className="flex items-center justify-center text-sm">
              <Link
                href="/auth/login"
                className="flex items-center text-primary hover:underline"
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                Back to sign in
              </Link>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Remember your password?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
