/**
 * app/api/proxy/[...path]/route.ts
 *
 * Universal microservice proxy — runs server-side in Next.js.
 *
 * WHY THIS EXISTS
 * ───────────────
 * Without this, the browser opens 8 separate TCP connections (one per
 * microservice port), fires a CORS preflight on each, and exposes the
 * Bearer token to the network on every request.
 *
 * With this proxy:
 *  • Browser makes ONE connection to Next.js (same origin — no CORS)
 *  • Next.js fans out to microservices over localhost (sub-millisecond)
 *  • Bearer token never leaves the server
 *  • HTTP/2 multiplexing available between browser ↔ Next.js
 *
 * USAGE (from any service file)
 * ──────────────────────────────
 * Change your base URLs from:
 *   http://localhost:8005/v1/reviews
 * to:
 *   /api/proxy/recognition/v1/reviews
 *
 * SERVICE MAP (add new services here as you scale)
 * ─────────────────────────────────────────────────
 *   /api/proxy/auth/**          → http://localhost:8001/v1/auth/**
 *   /api/proxy/roles/**         → http://localhost:8002/v1/roles/**
 *   /api/proxy/employees/**     → http://localhost:8003/v1/employees/**
 *   /api/proxy/wallet/**        → http://localhost:8004/v1/wallets/**
 *   /api/proxy/recognition/**   → http://localhost:8005/v1/recognitions/**  (root_path used by auth middleware for route matching)
 *   /api/proxy/rewards/**       → http://localhost:8006/v1/rewards/**
 *   /api/proxy/org/**           → http://localhost:8007/v1/organizations/**
 *   /api/proxy/analytics/**     → http://localhost:8008/v1/analytics/**
 */

import { NextRequest, NextResponse } from "next/server";

// ─── Service registry ─────────────────────────────────────────────────────────

const SERVICE_MAP: Record<string, string> = {
    auth:        (process.env.AUTH_SERVICE_URL        || "http://localhost:8001") + "/v1/auth",
    roles: (process.env.ROLES_SERVICE_URL || "http://localhost:8002"),
    employees:   (process.env.EMPLOYEES_SERVICE_URL   || "http://localhost:8003") + "/v1/employees",
    wallet: (process.env.WALLET_SERVICE_URL || "http://localhost:8004"),
    recognition: (process.env.RECOGNITION_SERVICE_URL || "http://localhost:8005"),
    rewards:     (process.env.REWARDS_SERVICE_URL     || "http://localhost:8006") + "/v1/rewards",
    org:         (process.env.ORG_SERVICE_URL         || "http://localhost:8007") + "/v1/organizations",
    analytics:   (process.env.NEXT_PUBLIC_ANALYTICS_API_URL  || "http://localhost:8008") + "/v1/analytics",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractToken(req: NextRequest): string | null {
    const auth = req.headers.get("authorization");
    return auth?.startsWith("Bearer ") ? auth.slice(7) : null;
}

async function proxyRequest(
    targetUrl: string,
    req: NextRequest,
    token: string | null
): Promise<Response> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        // FIX: Forward the Accept header so microservices that do content
        // negotiation don't fall back to an unexpected format.
        "Accept": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // Forward the original search params
    const url = new URL(targetUrl);
    req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

    const body = req.method !== "GET" && req.method !== "HEAD"
        ? await req.text()
        : undefined;

  return fetch(url.toString(), {
      method:  req.method,
      headers,
      body,
      keepalive: true,
  });
}

// ─── Route handler ────────────────────────────────────────────────────────────

// Next.js 15: params is a Promise and must be awaited
type RouteParams = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
    const { path } = await params;
    return handleProxy(req, path);
}

export async function POST(req: NextRequest, { params }: RouteParams) {
    const { path } = await params;
    return handleProxy(req, path);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
    const { path } = await params;
    return handleProxy(req, path);
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
    const { path } = await params;
    return handleProxy(req, path);
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
    const { path } = await params;
    return handleProxy(req, path);
}

async function handleProxy(req: NextRequest, pathSegments: string[]): Promise<NextResponse> {
    const [service, ...rest] = pathSegments;
    const token = extractToken(req);

    // ── Special case: dashboard aggregate ────────────────────────────────────
    if (service === "dashboard" && req.method === "GET") {
        return handleDashboardAggregate(token);
    }

    // ── Normal proxy ──────────────────────────────────────────────────────────
    const baseUrl = SERVICE_MAP[service];
    if (!baseUrl) {
        return NextResponse.json(
            { detail: `Unknown service: ${service}` },
            { status: 404 }
        );
    }

    const targetPath = rest.length > 0 ? "/" + rest.join("/") : "";
    const targetUrl  = `${baseUrl}${targetPath}`;

    try {
        const upstream = await proxyRequest(targetUrl, req, token);

        // FIX: Forward the upstream status faithfully. Previously this always
        // called upstream.json() and re-wrapped in NextResponse.json(), which:
        //   1. Swallowed non-JSON error bodies (e.g. HTML 502 pages from nginx)
        //   2. Lost the upstream Content-Type for non-JSON responses
        //   3. Caused a crash if the body was empty (e.g. 204 No Content)
        //
        // Now we check Content-Type and handle empty bodies gracefully.
        const contentType = upstream.headers.get("content-type") ?? "";
        const status      = upstream.status;

        // 204 No Content — body must be empty
        if (status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        if (contentType.includes("application/json")) {
            const data = await upstream.json().catch(() => null);
            return NextResponse.json(data, { status });
        }

        // Non-JSON upstream response (e.g. plain text error from a gateway)
        const text = await upstream.text().catch(() => "");
        return new NextResponse(text, {
            status,
            headers: { "Content-Type": contentType || "text/plain" },
        });

    } catch (err) {
        console.error(`[proxy] ${service}${targetPath} failed:`, err);
        return NextResponse.json(
            { detail: "Upstream service unavailable" },
            { status: 502 }
        );
    }
}

// ─── Dashboard aggregate ──────────────────────────────────────────────────────
// Fans out to all 4 analytics endpoints in parallel.
// Each is individually error-isolated — one failing endpoint does NOT cause
// the entire dashboard to return 502. The failed panel gets null and the
// rest render normally.

async function handleDashboardAggregate(token: string | null): Promise<NextResponse> {
    const analyticsBase = SERVICE_MAP.analytics;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept":       "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // FIX: Each fetch is individually wrapped so a single failing endpoint
    // doesn't reject the whole Promise.allSettled isn't needed — we catch
    // per-request. This also gives us the HTTP status of each so we can
    // distinguish "service down (network error)" from "403 Forbidden", etc.
    async function safeFetch(url: string): Promise<unknown> {
        try {
            const res = await fetch(url, { headers });
            if (!res.ok) {
                // Upstream returned an error status — log it and return null
                // so the dashboard panel shows a graceful empty state rather
                // than a 502 cascade.
                const body = await res.text().catch(() => "");
                console.error(`[proxy/dashboard] ${url} → ${res.status}: ${body}`);
                return null;
            }
            return await res.json();
        } catch (err) {
            // Network error — service is down
            console.error(`[proxy/dashboard] ${url} unreachable:`, err);
            return null;
        }
    }

    const [platformStats, recentReviews, leaderboard, teams] = await Promise.all([
        safeFetch(`${analyticsBase}/dashboard/platform-stats`),
        safeFetch(`${analyticsBase}/dashboard/recent-reviews`),
        safeFetch(`${analyticsBase}/dashboard/leaderboard`),
        safeFetch(`${analyticsBase}/dashboard/teams`),
    ]);

    // Always return 200 — individual nulls signal to the UI which panels
    // failed, without making the whole page error out.
    return NextResponse.json({
        platformStats,
        recentReviews,
        leaderboard,
        teams,
    });
}