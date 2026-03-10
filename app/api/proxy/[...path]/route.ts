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
 *   /api/proxy/auth/**          → http://localhost:8001/**
 *   /api/proxy/roles/**         → http://localhost:8002/**
 *   /api/proxy/employees/**     → http://localhost:8003/**
 *   /api/proxy/wallet/**        → http://localhost:8004/**
 *   /api/proxy/recognition/**   → http://localhost:8005/**
 *   /api/proxy/rewards/**       → http://localhost:8006/**
 *   /api/proxy/org/**           → http://localhost:8007/**
 *   /api/proxy/analytics/**     → http://localhost:8008/**
 *
 * DASHBOARD PARALLEL FETCH
 * ─────────────────────────
 * Use /api/proxy/dashboard to fetch all 4 dashboard endpoints in a
 * single browser request (server fans them out in parallel):
 *   GET /api/proxy/dashboard
 *   → returns { platformStats, recentReviews, leaderboard, teams }
 */

import { NextRequest, NextResponse } from "next/server";

// ─── Service registry ─────────────────────────────────────────────────────────

const SERVICE_MAP: Record<string, string> = {
    auth:        process.env.AUTH_SERVICE_URL        || "http://localhost:8001",
    roles:       process.env.ROLES_SERVICE_URL       || "http://localhost:8002",
    employees:   process.env.EMPLOYEES_SERVICE_URL   || "http://localhost:8003",
    wallet:      process.env.WALLET_SERVICE_URL      || "http://localhost:8004",
    recognition: process.env.RECOGNITION_SERVICE_URL || "http://localhost:8005",
    rewards:     process.env.REWARDS_SERVICE_URL     || "http://localhost:8006",
    org:         process.env.ORG_SERVICE_URL         || "http://localhost:8007",
    analytics:   process.env.ANALYTICS_SERVICE_URL  || "http://localhost:8008",
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
        // Keep-alive so server-side connections to microservices are reused
        // @ts-expect-error — Node 18+ fetch supports this
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
    // GET /api/proxy/dashboard → fans out to all 4 analytics endpoints in
    // parallel and returns a single merged JSON response.
    // Saves 3 round-trips + 3 CORS preflights vs calling them individually.
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

    const targetPath = "/" + rest.join("/");
    const targetUrl  = `${baseUrl}${targetPath}`;

    try {
        const upstream = await proxyRequest(targetUrl, req, token);
        const data     = await upstream.json().catch(() => null);

        return NextResponse.json(data, { status: upstream.status });
    } catch (err) {
        console.error(`[proxy] ${service}${targetPath} failed:`, err);
        return NextResponse.json(
            { detail: "Upstream service unavailable" },
            { status: 502 }
        );
    }
}

// ─── Dashboard aggregate ──────────────────────────────────────────────────────

async function handleDashboardAggregate(token: string | null): Promise<NextResponse> {
    const analyticsBase = SERVICE_MAP.analytics;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Fire all 4 in parallel — total latency = slowest individual call
    const [platformStats, recentReviews, leaderboard, teams] = await Promise.allSettled([
        fetch(`${analyticsBase}/v1/dashboard/platform-stats`,  { headers }).then(r => r.json()),
        fetch(`${analyticsBase}/v1/dashboard/recent-reviews`,  { headers }).then(r => r.json()),
        fetch(`${analyticsBase}/v1/dashboard/leaderboard`,     { headers }).then(r => r.json()),
        fetch(`${analyticsBase}/v1/dashboard/teams`,           { headers }).then(r => r.json()),
    ]);

    return NextResponse.json({
        platformStats:  platformStats.status  === "fulfilled" ? platformStats.value  : null,
        recentReviews:  recentReviews.status  === "fulfilled" ? recentReviews.value  : null,
        leaderboard:    leaderboard.status    === "fulfilled" ? leaderboard.value    : null,
        teams:          teams.status          === "fulfilled" ? teams.value          : null,
    });
}