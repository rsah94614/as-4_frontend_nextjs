import { Wallet, ArrowUpRight, ArrowDownLeft, CreditCard } from "lucide-react";

export default function WalletPage() {
    const transactions = [
        { id: 1, description: "Spot Award - Rahul Sharma", amount: "+₹5,000", date: "Feb 10, 2026", type: "credit" },
        { id: 2, description: "Gift Voucher Purchase", amount: "-₹2,000", date: "Feb 9, 2026", type: "debit" },
        { id: 3, description: "Quarterly Bonus Pool", amount: "+₹50,000", date: "Feb 8, 2026", type: "credit" },
        { id: 4, description: "Peer Recognition - Priya Patel", amount: "+₹1,000", date: "Feb 7, 2026", type: "credit" },
        { id: 5, description: "Team Celebration Fund", amount: "-₹10,000", date: "Feb 5, 2026", type: "debit" },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
            <p className="text-muted-foreground mt-1">
                Manage your rewards budget and transactions.
            </p>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-2 opacity-90">
                        <Wallet className="w-5 h-5" />
                        <span className="text-sm font-medium">Total Balance</span>
                    </div>
                    <p className="text-3xl font-bold mt-3">₹2,45,000</p>
                    <p className="text-sm opacity-80 mt-1">Available for distribution</p>
                </div>
                <div className="bg-white rounded-xl border p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-green-600">
                        <ArrowDownLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Total Credits</span>
                    </div>
                    <p className="text-2xl font-bold mt-3">₹3,56,000</p>
                    <p className="text-sm text-gray-500 mt-1">This month</p>
                </div>
                <div className="bg-white rounded-xl border p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-red-500">
                        <ArrowUpRight className="w-5 h-5" />
                        <span className="text-sm font-medium">Total Spent</span>
                    </div>
                    <p className="text-2xl font-bold mt-3">₹1,11,000</p>
                    <p className="text-sm text-gray-500 mt-1">This month</p>
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-xl border shadow-sm mt-8">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Recent Transactions</h2>
                    <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                        View All
                    </button>
                </div>
                <div className="divide-y">
                    {transactions.map((txn) => (
                        <div key={txn.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === "credit" ? "bg-green-100" : "bg-red-100"
                                    }`}>
                                    {txn.type === "credit" ? (
                                        <ArrowDownLeft className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <ArrowUpRight className="w-5 h-5 text-red-500" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{txn.description}</p>
                                    <p className="text-xs text-gray-500">{txn.date}</p>
                                </div>
                            </div>
                            <span className={`text-sm font-semibold ${txn.type === "credit" ? "text-green-600" : "text-red-500"
                                }`}>
                                {txn.amount}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
