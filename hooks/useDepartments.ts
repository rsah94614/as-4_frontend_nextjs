"use client";

import { useState, useEffect, useCallback } from "react";
import { departmentService } from "@/services/department-service";
import { extractErrorMessage } from "@/lib/error-utils";
import {
    Department,
    DepartmentType,
    DepartmentListResponse
} from "@/types/department-types";
import { PaginationMeta } from "@/types/pagination";

export function useDepartments() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [departmentTypes, setDepartmentTypes] = useState<DepartmentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const loadDepartmentTypes = useCallback(async () => {
        try {
            const types = await departmentService.listTypes();
            setDepartmentTypes(types);
        } catch (err) {
            console.error("Failed to load department types", extractErrorMessage(err));
        }
    }, []);

    const loadDepartments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res: DepartmentListResponse = await departmentService.list({
                page,
                limit: 5,
                search: search || undefined,
            });
            setDepartments(res.data);
            setPagination(res.pagination);
        } catch (err) {
            setError(extractErrorMessage(err, "Failed to load departments."));
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        loadDepartmentTypes();
    }, [loadDepartmentTypes]);

    useEffect(() => {
        loadDepartments();
    }, [loadDepartments]);

    const refresh = () => loadDepartments();

    return {
        departments,
        pagination,
        departmentTypes,
        loading,
        error,
        page,
        setPage,
        search,
        setSearch,
        refresh,
    };
}