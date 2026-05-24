import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../api/router";
import type { ReactNode } from "react";
import { getAdminKey } from "../lib/adminAuthStorage";

export const trpc = createTRPCReact<AppRouter>();

// Global fetch timeout wrapper
function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = 3000
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error(`Fetch timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    globalThis
      .fetch(input, {
        ...(init ?? {}),
        signal: controller.signal,
        credentials: "include",
      })
      .then((res) => {
        clearTimeout(timeoutId);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // All queries: 3s stale time, don't retry on failure
      staleTime: 30_000,
      retry: false,
      refetchOnWindowFocus: false,
      // If query fails, don't throw — return previous data or empty
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      retry: false,
    },
  },
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson as any,
      headers() {
        try {
          const adminKey = getAdminKey();
          return adminKey ? { "x-admin-key": adminKey } : {};
        } catch {
          return {};
        }
      },
      fetch(input, init) {
        return fetchWithTimeout(input, init, 15000);
      },
    }),
  ],
});

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
