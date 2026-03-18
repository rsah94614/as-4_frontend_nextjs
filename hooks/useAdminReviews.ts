"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { extractErrorMessage } from "@/lib/error-utils";
import { Employee, Review } from "@/types/admin-review-types";
import { employeesClient as employeeClient, recognitionClient } from "@/services/api-clients";



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
            const res = await employeeClient.get<{ data: Employee[]; pagination: { total_pages: number } }>(
                `/list?limit=${PAGE_SIZE}&page=${page}`
            );
            const rows = res.data.data ?? [];
            all.push(...rows);
            if (page >= (res.data.pagination?.total_pages ?? 1)) break;
            page++;
        }
        return all;
    };

    const fetchAllReviews = async (): Promise<Review[]> => {
        const PAGE_SIZE = 100;
        const all: Review[] = [];
        let page = 1;
        while (true) {
            try {
                const res = await recognitionClient.get<{ data: Review[]; pagination: { total_pages: number } }>(
                    `/reviews?page=${page}&page_size=${PAGE_SIZE}`
                );
                const rows = res.data.data ?? [];
                all.push(...rows);
                if (page >= (res.data.pagination?.total_pages ?? 1)) break;
                page++;
            } catch (e) {
                console.warn("Reviews fetch failed:", extractErrorMessage(e, "Failed to fetch admin reviews"));
                break;
            }
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
        } catch (e) {
            setError(extractErrorMessage(e, "Something went wrong"));
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
        const totalPoints = reviews.reduce((s, r) => s + (r.raw_points ?? 0), 0);
        return { totalReviews, totalPoints };
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