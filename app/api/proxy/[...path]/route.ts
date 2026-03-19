/**
 * app/api/proxy/[...path]/route.ts
 *
 * Universal microservice proxy — runs server-side in Next.js.
 */

import { NextRequest, NextResponse } from "next/server";

const SERVICE_MAP: Record<string, string> = {
    auth: (process.env.NEXT_PUBLIC_API_URL ?? "") + "/v1/auth",
    roles: (process.env.NEXT_PUBLIC_ROLES_API_URL ?? "") + "/v1/roles",
    employees: (process.env.NEXT_PUBLIC_EMPLOYEE_API_URL ?? "") + "/v1/employees",
    wallet: (process.env.NEXT_PUBLIC_WALLET_API_URL ?? "") + "/v1/wallets",
    recognition: (process.env.NEXT_PUBLIC_RECOGNITION_API_URL ?? "") + "/v1/recognitions",
    rewards: (process.env.NEXT_PUBLIC_REWARDS_API_URL ?? "") + "/v1/rewards",
    org: (process.env.NEXT_PUBLIC_ORG_API_URL ?? "") + "/v1/organizations",
    analytics: (process.env.NEXT_PUBLIC_ANALYTICS_API_URL ?? "") + "/v1/analytics",
};

function extractToken(req: NextRequest): string | null {
    const auth = req.headers.get("authorization");
    return auth?.startsWith("Bearer ") ? auth.slice(7) : null;
}

async function proxyRequest(
    targetUrl: string,
    req: NextRequest,
    token: string | null,
    signal?: AbortSignal,
): Promise<Response> {
    const incomingContentType = req.headers.get("content-type") ?? "";
    const isMultipart = incomingContentType.includes("multipart/form-data");

    const headers: Record<string, string> = {
        Accept: "application/json",
        ...(isMultipart
            ? { "Content-Type": incomingContentType }
            : { "Content-Type": "application/json" }),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const url = new URL(targetUrl);
    req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

    let body: BodyInit | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
        body = isMultipart ? await req.arrayBuffer() : await req.text();
    }

    return fetch(url.toString(), {
        method: req.method,
        headers,
        body,
        keepalive: !isMultipart,
        signal,
    });
}

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

    if (service === "dashboard" && req.method === "GET") {
        return handleDashboardAggregate(token);
    }

    const baseUrl = SERVICE_MAP[service];
    if (!baseUrl) {
        return NextResponse.json(
            { detail: `Unknown service: ${service}` },
            { status: 404 },
        );
    }

    const targetPath = rest.length > 0 ? "/" + rest.join("/") : "";
    const targetUrl = `${baseUrl}${targetPath}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        const upstream = await proxyRequest(targetUrl, req, token, controller.signal);
        clearTimeout(timeoutId);

        const contentType = upstream.headers.get("content-type") ?? "";
        const status = upstream.status;

        if (status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        if (contentType.includes("application/json")) {
            const data = await upstream.json().catch(() => null);
            return NextResponse.json(data, { status });
        }

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
                statusText?: string;
            };
        };

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

async function handleDashboardAggregate(token: string | null): Promise<NextResponse> {
    const analyticsBase = SERVICE_MAP.analytics;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    async function safeFetch(url: string): Promise<unknown> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const res = await fetch(url, { headers, signal: controller.signal });
            clearTimeout(timeoutId);

            if (!res.ok) {
                return null;
            }

            return await res.json();
        } catch {
            clearTimeout(timeoutId);
            return null;
        }
    }

    const [platformStats, recentReviews, leaderboard, teams] = await Promise.all([
        safeFetch(`${analyticsBase}/dashboard/platform-stats`),
        safeFetch(`${analyticsBase}/dashboard/recent-reviews`),
        safeFetch(`${analyticsBase}/dashboard/leaderboard`),
        safeFetch(`${analyticsBase}/dashboard/teams`),
    ]);

    return NextResponse.json({
        platformStats,
        recentReviews,
        leaderboard,
        teams,
    });
}
