"use client";

import { useState } from "react";
import { ChevronDown, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function HistoryPage() {
    // Dropdown states
    const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
    const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState("Point History");
    const [selectedType, setSelectedType] = useState("Transaction Type");

    // Dropdown options
    const periodOptions = ["Points History", "Review History", "Redeem History",];
    const typeOptions = ["All", "Gift Voucher", "Spot Award", "Merchandises"];

    // Dummy data for point history
    const pointHistory = [
        { id: 1, message: "Congratulations! You received 20 points!", points: 20, type: "received" },
        { id: 2, message: "Congratulations! You redeemed 20 points!", points: 20, type: "redeemed" },
        { id: 3, message: "Congratulations! You redeemed 20 points!", points: 20, type: "redeemed" },
        { id: 4, message: "Congratulations! You received 20 points!", points: 20, type: "received" },
        { id: 5, message: "Congratulations! You redeemed 20 points!", points: 20, type: "redeemed" },
    ];

    return (
        <div className="bg-white rounded-2xl md:rounded-4xl min-h-screen shadow-2xs">
            <div className="p-4 sm:p-6 md:p-8">
                {/* Filter Dropdowns */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    {/* Point History Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setPeriodDropdownOpen(!periodDropdownOpen);
                                setTypeDropdownOpen(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            {selectedPeriod}
                            <ChevronDown className={`w-4 h-4 transition-transform ${periodDropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        {periodDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                                {periodOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            setSelectedPeriod(option);
                                            setPeriodDropdownOpen(false);
                                        }}
                                        className="w-full text-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Transaction Type Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setTypeDropdownOpen(!typeDropdownOpen);
                                setPeriodDropdownOpen(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            {selectedType}
                            <ChevronDown className={`w-4 h-4 transition-transform ${typeDropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        {typeDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                                {typeOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            setSelectedType(option);
                                            setTypeDropdownOpen(false);
                                        }}
                                        className="w-full text-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* History Cards */}
                <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                    {pointHistory.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl border p-3 sm:p-5 flex items-center justify-between gap-3"
                        >
                            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                                {item.type === "received" ? (
                                    <ArrowDownLeft className="w-5 h-5 text-green-500 flex-shrink-0" />
                                ) : (
                                    <ArrowUpRight className="w-5 h-5 text-red-500 flex-shrink-0" />
                                )}
                                <p className="text-xs sm:text-sm font-medium text-gray-700 truncate sm:whitespace-normal">{item.message}</p>
                            </div>
                            <span
                                className={`text-sm font-semibold flex-shrink-0 ${item.type === "received" ? "text-green-500" : "text-red-500"
                                    }`}
                            >
                                {item.type === "received" ? "+" : "-"}{item.points}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
