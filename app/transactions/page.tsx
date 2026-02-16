"use client";

import { useState } from "react";
import { mockActivity } from "../(dashboard)/wallet/mockData";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, Calendar, ArrowLeft, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function TransactionsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Filter transactions
    const filteredTransactions = mockActivity.filter((item) => {
        // Filter by search term (title or points)
        const matchesSearch =
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.points.toString().includes(searchTerm);

        // Filter by status
        const matchesStatus =
            statusFilter === "all" ||
            (item.status && item.status.toLowerCase() === statusFilter.toLowerCase());

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-[#F7F6F7] p-4 md:p-8">
            <div className="max-w-[1400px] mx-auto">
                {/* Header Section */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/wallet">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/50">
                            <ArrowLeft className="h-6 w-6 text-gray-700" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">All Transactions</h1>
                        <p className="text-sm text-gray-500">View and manage your point history</p>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 min-h-[80vh]">

                    {/* Filters Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8 items-center bg-gray-50/50 p-2 rounded-2xl md:bg-transparent md:p-0">
                        {/* Search */}
                        <div className="relative w-full md:flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search by Name, ID, or Designation..."
                                className="pl-11 h-12 rounded-full border-gray-200 bg-white shadow-sm focus-visible:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            {/* Date Filter */}
                            <div className="w-full md:w-[200px]">
                                <Select>
                                    <SelectTrigger className="h-12 rounded-full border-gray-200 bg-white shadow-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <SelectValue placeholder="Filter by date" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="today">Today</SelectItem>
                                        <SelectItem value="week">This Week</SelectItem>
                                        <SelectItem value="month">This Month</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status Filter */}
                            <div className="w-full md:w-[160px]">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="h-12 rounded-full border-gray-200 bg-white shadow-sm text-gray-600">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="success">Success</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="overflow-hidden rounded-xl border border-gray-100">
                        <table className="w-full">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="py-5 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[250px]">
                                        Date & Time
                                    </th>
                                    <th className="py-5 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="py-5 px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-[180px]">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredTransactions.map((item) => (
                                    <tr key={item.id} className="group hover:bg-gray-50/80 transition-all duration-200">
                                        <td className="py-5 px-6 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-600">
                                                {item.date || "10/02/2026 07:53"}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {item.title}
                                                </span>
                                                <span className={`text-xs font-semibold ${item.type === 'CREDIT' ? 'text-green-600' : 'text-red-500'
                                                    }`}>
                                                    {item.type === 'CREDIT' ? '+' : '-'}{item.points} points
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 text-right whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold
                                                    ${item.status === "Success"
                                                        ? "bg-green-100 text-green-700 border border-green-200"
                                                        : item.status === "Failed"
                                                            ? "bg-red-100 text-red-700 border border-red-200"
                                                            : item.status === "Refunded"
                                                                ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                                                : "bg-gray-100 text-gray-700"
                                                    }
                                                `}
                                            >
                                                {item.status || "Success"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredTransactions.length === 0 && (
                            <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400">
                                <div className="bg-gray-50 p-4 rounded-full mb-3">
                                    <Search className="h-6 w-6" />
                                </div>
                                <p className="text-base font-medium text-gray-600">No transactions found</p>
                                <p className="text-sm">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
