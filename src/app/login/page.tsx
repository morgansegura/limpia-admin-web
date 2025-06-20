"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { loginUser } from "@/lib/api/login";
import { useAuth } from "@/context/auth-context";

import "./login.css";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { user, loading, refetchUser } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await loginUser(email, password);
      await refetchUser();
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Login failed");
      }
    }
  };

  if (loading) return null;

  return (
    <div className="login" id="login">
      <h2 className="login-title">Sign In</h2>
      {error && <p className="login-error">{error}</p>}
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email"
          className="login-input"
          autoComplete="true"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          name="email"
        />
        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          name="password"
        />
        <button type="submit" className="login-button">
          Sign In
        </button>
      </form>
      <div className="login-form-footer">
        <Link href="/request-reset-password">Forgot Password</Link>
      </div>
    </div>
  );
}
