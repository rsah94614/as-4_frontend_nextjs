"use client";

import { useEffect, useRef } from "react";
import axiosClient from "@/services/api-client";
import orgApiClient from "@/services/org-api-client";
import employeeApiClient from "@/services/employee-api-client";
import { type InternalAxiosRequestConfig, type AxiosInstance } from "axios";
import { useLoggerStore } from "@/lib/logger-store";

interface LoggerMeta {
    __loggerStartTime?: number;
}

export default function DevLoggerProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        if (process.env.NODE_ENV === "production") return;

        const { v4: uuidFn } = { v4: () => crypto.randomUUID() };

        const clients = [
            { name: "Main", instance: axiosClient },
            { name: "Org", instance: orgApiClient },
            { name: "Employee", instance: employeeApiClient },
        ];

        const activeInterceptors: {
            instance: AxiosInstance;
            req: number;
            res: number;
        }[] = [];

        clients.forEach(({ instance }) => {
            // Request interceptor — stamp start time
            const reqId = instance.interceptors.request.use(
                (config: InternalAxiosRequestConfig & LoggerMeta) => {
                    config.__loggerStartTime = Date.now();
                    return config;
                },
                (error) => Promise.reject(error)
            );

            // Response interceptor — log success + errors
            const resId = instance.interceptors.response.use(
                (response) => {
                    const config = response.config as InternalAxiosRequestConfig & LoggerMeta;
                    const startTime = config.__loggerStartTime ?? Date.now();
                    const duration = Date.now() - startTime;

                    const baseURL = config.baseURL ?? "";
                    const fullUrl = config.url?.startsWith("http")
                        ? config.url
                        : `${baseURL}${config.url ?? ""}`;

                    useLoggerStore.getState().addLog({
                        id: uuidFn(),
                        timestamp: new Date().toISOString(),
                        method: (config.method ?? "GET").toUpperCase(),
                        url: fullUrl,
                        requestHeaders: config.headers
                            ? Object.fromEntries(
                                Object.entries(config.headers).filter(
                                    ([, v]) => typeof v === "string"
                                )
                            )
                            : {},
                        requestBody: config.data ?? null,
                        requestParams: config.params ?? {},
                        status: response.status,
                        responseData: response.data,
                        responseHeaders: response.headers
                            ? Object.fromEntries(
                                Object.entries(response.headers).filter(
                                    ([, v]) => typeof v === "string"
                                )
                            )
                            : {},
                        duration,
                        error: null,
                        errorStack: null,
                    });

                    return response;
                },
                (error) => {
                    const config = (error.config ?? {}) as InternalAxiosRequestConfig & LoggerMeta;
                    const startTime = config.__loggerStartTime ?? Date.now();
                    const duration = Date.now() - startTime;

                    const baseURL = config.baseURL ?? "";
                    const fullUrl = config.url?.startsWith("http")
                        ? config.url
                        : `${baseURL}${config.url ?? ""}`;

                    useLoggerStore.getState().addLog({
                        id: uuidFn(),
                        timestamp: new Date().toISOString(),
                        method: (config.method ?? "GET").toUpperCase(),
                        url: fullUrl,
                        requestHeaders: config.headers
                            ? Object.fromEntries(
                                Object.entries(config.headers).filter(
                                    ([, v]) => typeof v === "string"
                                )
                            )
                            : {},
                        requestBody: config.data ?? null,
                        requestParams: config.params ?? {},
                        status: error.response?.status ?? null,
                        responseData: error.response?.data ?? null,
                        responseHeaders: error.response?.headers
                            ? (Object.fromEntries(
                                Object.entries(error.response.headers).filter(
                                    ([, v]) => typeof v === "string"
                                )
                            ) as Record<string, string>)
                            : {},
                        duration,
                        error: error.message ?? "Unknown error",
                        errorStack: error.stack ?? null,
                    });

                    return Promise.reject(error);
                }
            );

            activeInterceptors.push({ instance, req: reqId, res: resId });
        });

        return () => {
            activeInterceptors.forEach(({ instance, req, res }) => {
                instance.interceptors.request.eject(req);
                instance.interceptors.response.eject(res);
            });
        };
    }, []);

    return <>{children}</>;
}
