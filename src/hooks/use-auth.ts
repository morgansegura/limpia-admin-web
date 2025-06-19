import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export function useAuth() {
  const [user, setUser] = useState<null | { id: string; role: string }>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      setUser({
        id: decoded.sub,
        role: decoded.role,
      });
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, []);

  return { user, isAuthenticated: !!user };
}
