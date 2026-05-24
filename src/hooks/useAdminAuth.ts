import { useState, useEffect, useCallback, useRef } from "react";
import {
  getAdminKey,
  setAdminKey,
  removeAdminKey,
  getLastActivity,
  setLastActivity,
  removeLastActivity,
} from "../lib/adminAuthStorage";

// Admin password from environment variable (set at build time)
// NO fallback — if env is missing, admin login is disabled
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD?.trim();

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const MAX_LOADING_MS = 300; // Max time to spend in "loading" state

export function useAdminAuth() {
  const [adminKey, setAdminKeyState] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Session timeout check
  const checkSessionTimeout = useCallback(() => {
    const lastActivity = getLastActivity();
    if (!lastActivity) return;

    const elapsed = Date.now() - parseInt(lastActivity, 10);
    if (elapsed > SESSION_TIMEOUT_MS) {
      removeAdminKey();
      removeLastActivity();
      setAdminKeyState(null);
      setIsAuthenticated(false);
      window.location.hash = "#/admin/login";
    }
  }, []);

  // Activity tracking
  const updateActivity = useCallback(() => {
    if (isAuthenticated) {
      setLastActivity(Date.now().toString());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Fast auth check from storage (sessionStorage first, localStorage fallback)
    const stored = getAdminKey();
    if (stored) {
      setAdminKeyState(stored);
      setIsAuthenticated(true);
      setLastActivity(Date.now().toString());
    }
    // Always exit loading state within MAX_LOADING_MS — never hang
    loadTimerRef.current = setTimeout(() => {
      setIsLoading(false);
    }, MAX_LOADING_MS);

    return () => {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    };
  }, []);

  // Inactivity monitoring
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => document.addEventListener(e, updateActivity));
    timerRef.current = setInterval(checkSessionTimeout, 60_000);

    return () => {
      events.forEach((e) => document.removeEventListener(e, updateActivity));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAuthenticated, updateActivity, checkSessionTimeout]);

  const login = useCallback((key: string): boolean => {
    const expected = ADMIN_PASSWORD;
    // Reject if admin password is not configured
    if (!expected) {
      console.error("[AdminAuth] VITE_ADMIN_PASSWORD is not configured");
      return false;
    }
    // Constant-time comparison to prevent timing attacks
    if (key.length !== expected.length) return false;

    let match = true;
    for (let i = 0; i < expected.length; i++) {
      if (key[i] !== expected[i]) match = false;
    }

    if (match) {
      setAdminKey(key);
      setLastActivity(Date.now().toString());
      setAdminKeyState(key);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    removeAdminKey();
    removeLastActivity();
    setAdminKeyState(null);
    setIsAuthenticated(false);
    window.location.hash = "#/admin/login";
  }, []);

  return {
    adminKey,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
