"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Lock } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary text-primary-foreground rounded-lg p-3">
              <span className="text-2xl font-bold">L</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Registration Disabled</CardTitle>
          <CardDescription className="text-center">
            Account registration is currently not available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              New account registration has been disabled. Please contact your administrator if you need access to the system.
            </AlertDescription>
          </Alert>

          <div className="mt-6 flex items-center justify-center text-sm">
            <Link
              href="/auth/login"
              className="flex items-center text-primary hover:underline"
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Back to sign in
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Button asChild variant="default" className="w-full">
              <Link href="/auth/login">Go to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
