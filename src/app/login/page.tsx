"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api/login";

import "./login.css";
import { requestResetPassword } from "@/lib/api/request-reset-password";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    try {
      await loginUser(email, password);
      setTimeout(() => {
        router.push("/dashboard");
      }, 100);
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="login">
      <h2 className="login-title">Sign In</h2>
      {error && <p className="login-error">{error}</p>}
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-button">
          Sign In
        </button>
      </form>
      <div className="login-form-footer">
        <Link href="/reset-password">Forgot Password</Link>
      </div>
    </div>
  );
}
