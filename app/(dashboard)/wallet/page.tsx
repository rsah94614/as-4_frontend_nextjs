"use client";

import { mockWallet, mockActivity } from "./mockData";
import { Gift, Ticket } from "lucide-react";

export default function Wallet() {
    return (
        <div className="flex flex-col gap-8">

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Lifetime Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Lifetime Points</p>
                    <h2 className="text-3xl font-semibold mt-2">
                        {mockWallet.lifetime_points.toLocaleString()}
                    </h2>

                    <div className="flex justify-between mt-4 text-sm text-gray-500">
                        <span>Redeemed</span>
                        <span>{mockWallet.redeemed_points}</span>
                    </div>
                </div>

                {/* Redeemable Card */}
                <div className="rounded-2xl p-6 bg-green-200/60">
                    <p className="text-sm text-gray-700">Redeemable</p>
                    <h2 className="text-3xl font-semibold mt-2">
                        {mockWallet.redeemable.toLocaleString()}
                    </h2>
                </div>

                {/* Month / Year Card */}
                <div className="rounded-2xl p-6 bg-indigo-200/60">
                    <div className="flex flex-col gap-4 text-sm text-gray-700">
                        <div>
                            <p>This month</p>
                            <p className="text-xl font-semibold">
                                {mockWallet.month_points.toLocaleString()}
                            </p>
                        </div>

                        <div>
                            <p>This year</p>
                            <p className="text-xl font-semibold">
                                {mockWallet.year_points.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Recent Transactions Section */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Recent Transactions</h3>
                    <button className="text-sm text-indigo-600 hover:underline">
                        View all transactions
                    </button>
                </div>

                <div className="flex flex-col gap-4">

                    {mockActivity.map((item) => (
                        <div
                            key={item.id}
                            className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl px-5 py-4"
                        >
                            <div className="flex items-center gap-3">

                                {item.type === "CREDIT" ? (
                                    <Gift size={18} className="text-gray-600" />
                                ) : (
                                    <Ticket size={18} className="text-gray-600" />
                                )}

                                <p className="text-sm text-gray-800">
                                    {item.title}
                                </p>
                            </div>

                            <p
                                className={`text-sm font-medium ${item.type === "CREDIT"
                                        ? "text-green-600"
                                        : "text-red-500"
                                    }`}
                            >
                                {item.type === "CREDIT"
                                    ? `+${item.points}`
                                    : `-${item.points}`}
                            </p>
                        </div>
                    ))}

                </div>

            </div>

        </div>
    );
}
