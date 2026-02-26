import { formatNumber, formatGrowth } from "@/lib/dashboard-utils";

describe("formatNumber", () => {
    it("returns dash for null", () => {
        expect(formatNumber(null)).toBe("—");
    });

    it("formats millions", () => {
        expect(formatNumber(2_500_000)).toBe("2.5M");
        expect(formatNumber(1_000_000)).toBe("1.0M");
    });

    it("formats thousands", () => {
        expect(formatNumber(1_500)).toBe("1.5K");
        expect(formatNumber(1_000)).toBe("1.0K");
        expect(formatNumber(99_999)).toBe("100.0K");
    });

    it("returns locale string for small numbers", () => {
        expect(formatNumber(0)).toBe("0");
        expect(formatNumber(42)).toBe("42");
        expect(formatNumber(999)).toBe("999");
    });
});

describe("formatGrowth", () => {
    it("returns undefined for null", () => {
        expect(formatGrowth(null)).toBeUndefined();
    });

    it("formats positive growth with + sign", () => {
        expect(formatGrowth(12)).toBe("+12%");
        expect(formatGrowth(0)).toBe("+0%");
    });

    it("formats negative growth without extra sign", () => {
        expect(formatGrowth(-5)).toBe("-5%");
    });
});
