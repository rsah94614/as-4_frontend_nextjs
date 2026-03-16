/**
 * app/api/proxy/[...path]/route.ts
 *
 * Universal microservice proxy — runs server-side in Next.js.
 *
 * WHY THIS EXISTS
 * ───────────────
 * Without this, the browser opens separate TCP connections per microservice
 * port and exposes the Bearer token on the wire. With this proxy:
 *  • Browser makes ONE connection to Next.js (same origin — no CORS)
 *  • Next.js fans out to microservices over localhost (sub-millisecond)
 *  • Bearer token is forwarded server-side; never exposed in the network tab
 *  • HTTP/2 multiplexing available between browser ↔ Next.js
 *
 * TOKEN STRATEGY
 * ───────────────
 * Tokens are stored in localStorage (not httpOnly cookies) and managed by
 * auth-service.ts. Every client-side fetch() through this proxy MUST attach:
 *
 *   Authorization: Bearer <token>
 *
 * The proxy reads this header and forwards it to the upstream microservice.
 * The notification-store and any other client that uses raw fetch() must call
 * getAuthHeaders() before constructing requests — axiosClient does this
 * automatically via its request interceptor.
 *
 * SERVICE MAP
 * ─────────────────────────────────────────────────────────────────────────────
 *  Segment        Env var                          Upstream base          Port
 *  ─────────────  ───────────────────────────────  ────────────────────── ────
 *  auth           NEXT_PUBLIC_API_URL              .../v1/auth            8001
 *  roles          NEXT_PUBLIC_ROLES_API_URL        .../v1/roles           8002
 *  employees      NEXT_PUBLIC_EMPLOYEE_API_URL     .../v1/employees       8003
 *  wallet         NEXT_PUBLIC_WALLET_API_URL       .../v1/wallets         8004
 *  recognition    NEXT_PUBLIC_RECOGNITION_API_URL  .../v1/recognitions    8005
 *  rewards        NEXT_PUBLIC_REWARDS_API_URL      .../v1/rewards         8006
 *  org            NEXT_PUBLIC_ORG_API_URL          .../v1/organizations   8007
 *  analytics      NEXT_PUBLIC_ANALYTICS_API_URL    .../v1/analytics       8008
 *
 * ROUTE EXAMPLES
 * ─────────────────────────────────────────────────────────────────────────────
 *  Browser                                               Upstream
 *  ────────────────────────────────────────────────────  ──────────────────────────────────────────────────────
 *  GET  /api/proxy/employees/notifications               → EMPLOYEE_URL/v1/employees/notifications
 *  GET  /api/proxy/employees/notifications/unread-count  → EMPLOYEE_URL/v1/employees/notifications/unread-count
 *  PUT  /api/proxy/employees/notifications/{id}/read     → EMPLOYEE_URL/v1/employees/notifications/{id}/read
 *  PUT  /api/proxy/employees/notifications/read-all      → EMPLOYEE_URL/v1/employees/notifications/read-all
 *  POST /api/proxy/employees/notifications/announcements → EMPLOYEE_URL/v1/employees/notifications/announcements
 *  GET  /api/proxy/recognition/digest                    → RECOGNITION_URL/v1/recognitions/digest
 *  POST /api/proxy/recognition/digest/send               → RECOGNITION_URL/v1/recognitions/digest/send
 */

import { NextRequest, NextResponse } from "next/server";

// ─── Service registry ─────────────────────────────────────────────────────────

const SERVICE_MAP: Record<string, string> = {
    auth:        (process.env.NEXT_PUBLIC_API_URL              ?? "") + "/v1/auth",
    roles:       (process.env.NEXT_PUBLIC_ROLES_API_URL        ?? "") + "/v1/roles",
    employees:   (process.env.NEXT_PUBLIC_EMPLOYEE_API_URL     ?? "") + "/v1/employees",
    wallet:      (process.env.NEXT_PUBLIC_WALLET_API_URL       ?? "") + "/v1/wallets",
    recognition: (process.env.NEXT_PUBLIC_RECOGNITION_API_URL  ?? "") + "/v1/recognitions",
    rewards:     (process.env.NEXT_PUBLIC_REWARDS_API_URL      ?? "") + "/v1/rewards",
    org:         (process.env.NEXT_PUBLIC_ORG_API_URL          ?? "") + "/v1/organizations",
    analytics:   (process.env.NEXT_PUBLIC_ANALYTICS_API_URL    ?? "") + "/v1/analytics",
};

// ─── Token extraction ─────────────────────────────────────────────────────────
//
// Tokens live in localStorage (see auth-service.ts → STORAGE_KEYS.ACCESS_TOKEN).
// The proxy can only see what the browser sends as HTTP headers — it has no
// access to the browser's localStorage. Callers are therefore responsible for
// reading the token from localStorage and attaching it as:
//
//   Authorization: Bearer <token>
//
// This is what axiosClient does automatically via its request interceptor.
// Raw fetch() callers must use getAuthHeaders() from notification-store.ts.

function extractToken(req: NextRequest): string | null {
    const auth = req.headers.get("authorization");
    return auth?.startsWith("Bearer ") ? auth.slice(7) : null;
}

// ─── Proxy core ───────────────────────────────────────────────────────────────

async function proxyRequest(
    targetUrl: string,
    req: NextRequest,
    token: string | null,
    signal?: AbortSignal,
): Promise<Response> {
    const incomingContentType = req.headers.get("content-type") ?? "";
    const isMultipart = incomingContentType.includes("multipart/form-data");

    // For multipart (file uploads):
    //   • Forward the original Content-Type header INCLUDING the boundary parameter.
    //     The boundary is auto-generated by the browser and FastAPI needs it to parse
    //     the multipart body. Omitting it or overwriting it causes a 422.
    //   • Buffer the body as an ArrayBuffer rather than streaming it.
    //     Node.js fetch requires `duplex: "half"` when the body is a ReadableStream,
    //     but that option is not available in the Next.js edge/node runtime via the
    //     standard RequestInit type. Buffering avoids the requirement entirely.
    const headers: Record<string, string> = {
        "Accept": "application/json",
        // For JSON requests: force Content-Type to application/json.
        // For multipart: forward the original Content-Type (with boundary) unchanged.
        ...(isMultipart
            ? { "Content-Type": incomingContentType }
            : { "Content-Type": "application/json" }),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // Forward query-string parameters from the original request unchanged
    const url = new URL(targetUrl);
    req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

    let body: BodyInit | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
        if (isMultipart) {
            // Buffer the entire multipart body so we can pass it as ArrayBuffer.
            // This avoids the "duplex option is required" error that occurs when
            // passing a ReadableStream directly to Node.js fetch().
            body = await req.arrayBuffer();
        } else {
            body = await req.text();
        }
    }

    return fetch(url.toString(), {
        method:  req.method,
        headers,
        body,
        // keepalive is incompatible with large bodies; omit for multipart.
        keepalive: !isMultipart,
        signal,
    });
}

// ─── Route handlers ───────────────────────────────────────────────────────────

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

async function handleProxy(
    req: NextRequest,
    pathSegments: string[],
): Promise<NextResponse> {
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
            { status: 404 },
        );
    }

    const targetPath = rest.length > 0 ? "/" + rest.join("/") : "";
    const targetUrl  = `${baseUrl}${targetPath}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
        const upstream    = await proxyRequest(targetUrl, req, token, controller.signal);
        clearTimeout(timeoutId);
        
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

        // Non-JSON upstream response (gateway error page, plain text, etc.)
        const text = await upstream.text().catch(() => "");
        return new NextResponse(text, {
            status,
            headers: { "Content-Type": contentType || "text/plain" },
        });
    } catch (err: unknown) {
        clearTimeout(timeoutId);
        const error = err as { 
            name?: string; 
            code?: string; 
            status?: number; 
            message?: string; 
            response?: { 
                status?: number; 
                data?: { detail?: string }; 
                statusText?: string 
            } 
        };

        console.error(`[proxy] ${service}${targetPath} failed:`, error);
        
        // Preserve upstream status codes if error object contains status
        let status = 502;
        let detail = "Upstream service unavailable";

        if (error.name === "AbortError" || error.code === "ECONNABORTED") {
            status = 504;
            detail = "Gateway Timeout";
        } else if (error.status) {
            status = error.status;
            detail = error.message || detail;
        } else if (error.response?.status) {
            status = error.response.status;
            detail = error.response.data?.detail || error.response.statusText || detail;
        }

        return NextResponse.json(
            { detail },
            { status },
        );
    }
}

// ─── Dashboard aggregate ──────────────────────────────────────────────────────
// Fans out to all 4 analytics endpoints in parallel.
// Each is individually error-isolated — one failing endpoint does NOT cause
// the entire dashboard to return 502.

async function handleDashboardAggregate(token: string | null): Promise<NextResponse> {
    const analyticsBase = SERVICE_MAP.analytics;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept":       "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    async function safeFetch(url: string): Promise<unknown> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        try {
            const res = await fetch(url, { headers, signal: controller.signal });
            clearTimeout(timeoutId);
            if (!res.ok) {
                const body = await res.text().catch(() => "");
                console.error(`[proxy/dashboard] ${url} → ${res.status}: ${body}`);
                return null;
            }
            return await res.json();
        } catch (err) {
            clearTimeout(timeoutId);
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

    return NextResponse.json({ platformStats, recentReviews, leaderboard, teams });
}