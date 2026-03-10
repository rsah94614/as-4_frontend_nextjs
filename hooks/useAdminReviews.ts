"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchWithAuth } from "@/services/auth-service";
import { Employee, Review } from "@/types/admin-review-types";

const EMPLOYEE_API = process.env.NEXT_PUBLIC_EMPLOYEE_API_URL || "http://localhost:8002";
const RECOGNITION_API = process.env.NEXT_PUBLIC_RECOGNITION_API_URL || "http://localhost:8005";
const FLAG_RATING = 2;

export function useAdminReviews() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [allReviews, setAllReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());

    const fetchAllEmployees = async (): Promise<Employee[]> => {
        const PAGE_SIZE = 100;
        const all: Employee[] = [];
        let page = 1;
        while (true) {
            const res = await fetchWithAuth(
                `${EMPLOYEE_API}/v1/employees?limit=${PAGE_SIZE}&page=${page}`
            );
            if (!res.ok) throw new Error(`Failed to fetch employees (${res.status})`);
            const data = await res.json();
            const rows: Employee[] = data.data ?? [];
            all.push(...rows);
            if (page >= (data.pagination?.total_pages ?? 1)) break;
            page++;
        }
        return all;
    };

    const fetchAllReviews = async (): Promise<Review[]> => {
        const PAGE_SIZE = 100;
        const all: Review[] = [];
        let page = 1;
        while (true) {
            const res = await fetchWithAuth(
                `${RECOGNITION_API}/v1/reviews?page=${page}&page_size=${PAGE_SIZE}`
            );
            if (!res.ok) {
                console.warn(`Reviews fetch returned ${res.status}`);
                break;
            }
            const data = await res.json();
            const rows: Review[] = data.data ?? [];
            all.push(...rows);
            if (page >= (data.pagination?.total_pages ?? 1)) break;
            page++;
        }
        return all;
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [empList, reviewList] = await Promise.all([
                fetchAllEmployees(),
                fetchAllReviews(),
            ]);
            setEmployees(empList);
            setAllReviews(reviewList);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const reviews = useMemo(
        () =>
            allReviews.filter((r) => {
                const d = new Date(r.review_at);
                return d.getMonth() === month && d.getFullYear() === year;
            }),
        [allReviews, month, year]
    );

    const { managers, getTeam } = useMemo(() => {
        const managersSet = new Set(
            employees.map((e) => e.manager_id).filter((id): id is string => !!id)
        );
        const mgrs = employees.filter((e) => managersSet.has(e.employee_id));
        const get = (id: string) => employees.filter((e) => e.manager_id === id);
        return { managers: mgrs, getTeam: get };
    }, [employees]);

    const summary = useMemo(() => {
        const totalReviews = reviews.length;
        const flaggedTotal = reviews.filter((r) => r.rating <= FLAG_RATING).length;
        const overallAvg =
            totalReviews > 0
                ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews
                : 0;
        return { totalReviews, flaggedTotal, overallAvg };
    }, [reviews]);

    return {
        employees,
        reviews,
        loading,
        error,
        month,
        year,
        setMonth,
        setYear,
        managers,
        getTeam,
        summary,
        refresh: fetchData,
    };
}
