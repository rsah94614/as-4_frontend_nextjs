"use client";

/**
 * DevLoggerProvider — wrapper kept for layout compatibility.
 *
 * Logging is now built directly into `createAuthenticatedClient` (lib/api-utils.ts),
 * so every Axios client logs automatically — no interception needed here.
 *
 * This component is retained only to avoid breaking the layout tree.
 */
export default function DevLoggerProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
