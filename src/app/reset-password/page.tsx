"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { resetPassword } from "@/lib/api/reset-password";

export default function ResetPasswordPage() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token]);

  if (!token) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Missing token");
      return;
    }

    try {
      await resetPassword(token, newPassword);
      setMessage("Password successsfully reset!");
      setTimeout(() => {
        router.replace("/login");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-md shadow">
      <h2 className="text-xl font-semibold mb-4">Reset Your Password</h2>

      {message && <p className="text-green-600">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="New Password"
          className="w-full border rounded px-3 py-2"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
