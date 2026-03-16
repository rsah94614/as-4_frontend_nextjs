"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchWithAuth } from "@/services/auth-service";
import { extractErrorMessage } from "@/lib/error-utils";
import { Employee, Review, MemberStats } from "@/types/team-types";

const EMPLOYEE_API = process.env.NEXT_PUBLIC_EMPLOYEE_API_URL || "http://localhost:8002";
const RECOGNITION_API = process.env.NEXT_PUBLIC_RECOGNITION_API_URL || "http://localhost:8005";

export function useTeams() {
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
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
            const res = await fetchWithAuth(`${EMPLOYEE_API}/v1/employees?limit=${PAGE_SIZE}&page=${page}`);
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
            const res = await fetchWithAuth(`${RECOGNITION_API}/v1/reviews?page=${page}&page_size=${PAGE_SIZE}`);
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

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [employees, reviews] = await Promise.all([
                fetchAllEmployees(),
                fetchAllReviews(),
            ]);
            setAllEmployees(employees);
            setAllReviews(reviews);
        } catch (err) {
            setError(extractErrorMessage(err, "Something went wrong"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const filteredReviews = useMemo(
        () =>
            allReviews.filter((r) => {
                const d = new Date(r.review_at);
                return d.getMonth() === month && d.getFullYear() === year;
            }),
        [allReviews, month, year]
    );

    const statsMap = useMemo((): Record<string, MemberStats> => {
        const map: Record<string, MemberStats> = {};
        filteredReviews.forEach((r) => {
            if (!map[r.receiver_id])
                map[r.receiver_id] = { avg_rating: 0, review_count: 0 };
            const prev = map[r.receiver_id];
            const total = prev.avg_rating * prev.review_count + r.rating;
            prev.review_count += 1;
            prev.avg_rating = total / prev.review_count;
        });
        return map;
    }, [filteredReviews]);

    const { managers, getTeam, deptOptions } = useMemo(() => {
        const managersSet = new Set(
            allEmployees.map((e) => e.manager_id).filter((id): id is string => !!id)
        );
        const mgrs = allEmployees.filter((e) => managersSet.has(e.employee_id));
        const get = (id: string) => allEmployees.filter((e) => e.manager_id === id);
        const opts = Array.from(
            new Set(
                allEmployees.map((e) => e.department_name).filter((d): d is string => !!d)
            )
        );
        return { managers: mgrs, getTeam: get, deptOptions: opts };
    }, [allEmployees]);

    return {
        allEmployees,
        loading,
        error,
        month,
        setMonth,
        year,
        setYear,
        managers,
        getTeam,
        deptOptions,
        statsMap,
        refresh: fetchAll,
    };
}
