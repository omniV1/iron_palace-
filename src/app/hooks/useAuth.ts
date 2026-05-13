import { useCallback, useEffect, useState } from "react";
import { api } from "../api";

export function useAuth() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const { authenticated } = await api.me();
      setAuthenticated(authenticated);
    } catch (err) {
      setAuthenticated(false);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (password: string) => {
    setError(null);
    try {
      await api.login(password);
      setAuthenticated(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setAuthenticated(false);
    }
  }, []);

  return { authenticated, error, login, logout, refresh };
}
