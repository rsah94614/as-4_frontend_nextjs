import {
    REDACTED_VALUE,
    sanitizeLoggedHeaders,
    sanitizeLoggedValue,
} from "@/lib/api-utils";

describe("api-utils logger sanitization", () => {
    it("redacts sensitive request and response payload fields recursively", () => {
        const result = sanitizeLoggedValue({
            username: "user@example.com",
            password: "super-secret",
            refresh_token: "refresh-token",
            nested: {
                token: "jwt-token",
                safe: "visible",
            },
            items: [
                { new_password: "new-secret" },
                { label: "keep-me" },
            ],
        });

        expect(result).toEqual({
            username: "user@example.com",
            password: REDACTED_VALUE,
            refresh_token: REDACTED_VALUE,
            nested: {
                token: REDACTED_VALUE,
                safe: "visible",
            },
            items: [
                { new_password: REDACTED_VALUE },
                { label: "keep-me" },
            ],
        });
    });

    it("redacts sensitive headers before they reach the logger store", () => {
        expect(
            sanitizeLoggedHeaders({
                Authorization: "Bearer abc123",
                "Content-Type": "application/json",
                Cookie: "session=value",
                "X-Request-Id": "req-1",
            })
        ).toEqual({
            Authorization: REDACTED_VALUE,
            "Content-Type": "application/json",
            Cookie: REDACTED_VALUE,
            "X-Request-Id": "req-1",
        });
    });
});
