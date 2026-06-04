"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";

// ─── useAuth ──────────────────────────────────────────────────────────────────
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((d) => {
        console.log("User loaded from API D:", d);
        if (d?.data) setUser(d.data);
        console.log("User loaded:", d?.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}

// ─── useFetch ─────────────────────────────────────────────────────────────────
export function useFetch(url, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    try {
      const json = await api.get(url);
      setData(json);
      setError(null);
    } catch (err) {
      const msg =
        err.response?.data?.error || err.message || "Erreur de chargement";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    refetch();
  }, [refetch, ...deps]);

  return { data, loading, error, refetch };
}

// ─── useApi — mutations ───────────────────────────────────────────────────────
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api[method](url, data);
      return result?.data ?? result;
    } catch (err) {
      const msg = err.response?.data?.details
        ? err.response.data.details.join(", ")
        : err.response?.data?.error || err.message || "Erreur";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    get: (url) => request("get", url),
    post: (url, body) => request("post", url, body),
    put: (url, body) => request("put", url, body),
    del: (url) => request("delete", url),
  };
}

// ─── usePagination ────────────────────────────────────────────────────────────
export function usePagination(initialPage = 1, initialLimit = 20) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  return {
    page,
    limit,
    setPage,
    setLimit,
    reset: () => setPage(1),
    queryString: `page=${page}&limit=${limit}`,
  };
}

// ─── useDebounce ──────────────────────────────────────────────────────────────
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
