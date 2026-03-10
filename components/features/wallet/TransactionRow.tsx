import { TrendingUp, Ticket } from "lucide-react";
import { Transaction } from "./types";
import { formatDate, formatTime } from "./utils";

export function TransactionRow({ txn }: { txn: Transaction }) {
    const isCredit = txn.transaction_type.is_credit;

    return (
        <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white border border-gray-100 rounded-2xl p-5 group hover:border-indigo-100 hover:shadow-md hover:bg-indigo-50/30 transition-all duration-200 cursor-default">
            <div className="flex items-center gap-4 min-w-0">
                <div
                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform
            ${isCredit ? "bg-emerald-100" : "bg-fuchsia-100"}`}
                >
                    {isCredit ? (
                        <TrendingUp size={20} className="text-emerald-600" />
                    ) : (
                        <Ticket size={20} className="text-fuchsia-600" />
                    )}
                </div>

                <div className="min-w-0">
                    <p className="text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-indigo-900 transition-colors">
                        {txn.description || txn.transaction_type.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                        {formatDate(txn.transaction_at)} <span className="mx-1">•</span> {formatTime(txn.transaction_at)}
                        {txn.reference_number && (
                            <span className="ml-2 font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-400">
                                #{txn.reference_number.slice(0, 12)}
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-50 flex-shrink-0 sm:ml-4">
                <p
                    className={`text-lg font-bold tracking-tight ${isCredit ? "text-emerald-600" : "text-gray-900"
                        }`}
                >
                    {isCredit ? "+" : "-"}{txn.amount.toLocaleString()} pts
                </p>
                <span
                    className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-md mt-1.5 tracking-wider
            ${txn.status.code === "SUCCESS"
                            ? "bg-emerald-50 text-emerald-700"
                            : txn.status.code === "FAILED"
                                ? "bg-red-50 text-red-600"
                                : "bg-amber-50 text-amber-700"
                        }`}
                >
                    {txn.status.name}
                </span>
            </div>
        </div>
    );
}
