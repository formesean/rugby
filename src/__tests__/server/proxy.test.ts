import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { proxy } from "@/proxy";

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

afterEach(() => {
  vi.stubEnv("NODE_ENV", ORIGINAL_NODE_ENV ?? "test");
  vi.unstubAllEnvs();
});

const ORIGIN = "https://example.com";

function makeRequest(pathname: string, cookie?: string): NextRequest {
  const headers = new Headers();
  if (cookie) headers.set("cookie", cookie);
  const url = `${ORIGIN}${pathname}`;
  return {
    nextUrl: { pathname },
    headers,
    url,
    cookies: { has: () => !!cookie },
  } as unknown as NextRequest;
}

function redirectLocation(res: Response): URL {
  const location = res.headers.get("location");
  if (!location) throw new Error("expected a redirect Location header");
  return new URL(location);
}

describe("proxy middleware", () => {
  describe("protected routes", () => {
    it("redirects to /login with no session cookie", () => {
      const res = proxy(makeRequest("/lab"));
      expect(res.status).toBe(307);
      const location = redirectLocation(res);
      expect(location.pathname).toBe("/login");
      expect(location.searchParams.get("callbackUrl")).toBe("/lab");
    });

    it("allows access with a plain session cookie", () => {
      const res = proxy(makeRequest("/lab", "lab-forms.session_token=tok.sig"));
      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
    });

    it("allows access with a __Secure-prefixed session cookie", () => {
      const res = proxy(makeRequest("/lab", "__Secure-lab-forms.session_token=tok.sig"));
      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
    });

    it("ignores an unrelated cookie and redirects", () => {
      const res = proxy(makeRequest("/dashboard", "some-other-cookie=value"));
      expect(res.status).toBe(307);
      expect(redirectLocation(res).pathname).toBe("/login");
    });
  });

  describe("auth routes", () => {
    it("redirects an authenticated user away from /login", () => {
      const res = proxy(makeRequest("/login", "__Secure-lab-forms.session_token=tok.sig"));
      expect(res.status).toBe(307);
      expect(redirectLocation(res).pathname).toBe("/");
    });

    it("allows an unauthenticated user to reach /login", () => {
      const res = proxy(makeRequest("/login"));
      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
    });
  });

  describe("public routes", () => {
    it("sets x-pathname, x-nonce, and a CSP header", () => {
      const res = proxy(makeRequest("/"));
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Security-Policy")).toContain("default-src 'none'");
    });

    it("omits upgrade-insecure-requests in development", () => {
      vi.stubEnv("NODE_ENV", "development");
      const res = proxy(makeRequest("/"));
      const csp = res.headers.get("Content-Security-Policy") ?? "";
      expect(csp).not.toContain("upgrade-insecure-requests");
    });

    it("includes upgrade-insecure-requests in production", () => {
      vi.stubEnv("NODE_ENV", "production");
      const res = proxy(makeRequest("/"));
      const csp = res.headers.get("Content-Security-Policy") ?? "";
      expect(csp).toContain("upgrade-insecure-requests");
    });
  });
});
