import { Clock, Filter } from "lucide-react";

export default function HistoryPage() {
    const historyItems = [
        { id: 1, action: "Spot Award given to Rahul Sharma", category: "Reward", date: "Feb 10, 2026", time: "3:45 PM" },
        { id: 2, action: "Review approved for Priya Patel", category: "Review", date: "Feb 9, 2026", time: "11:20 AM" },
        { id: 3, action: "₹50,000 added to rewards budget", category: "Wallet", date: "Feb 8, 2026", time: "9:00 AM" },
        { id: 4, action: "Peer recognition submitted by Amit Kumar", category: "Reward", date: "Feb 7, 2026", time: "4:30 PM" },
        { id: 5, action: "New employee Sneha Gupta onboarded", category: "Admin", date: "Feb 6, 2026", time: "10:15 AM" },
        { id: 6, action: "Quarterly report generated", category: "Report", date: "Feb 5, 2026", time: "2:00 PM" },
        { id: 7, action: "Team celebration fund approved", category: "Wallet", date: "Feb 4, 2026", time: "5:10 PM" },
    ];

    const categoryColors: Record<string, string> = {
        Reward: "bg-yellow-100 text-yellow-800",
        Review: "bg-blue-100 text-blue-800",
        Wallet: "bg-green-100 text-green-800",
        Admin: "bg-purple-100 text-purple-800",
        Report: "bg-gray-100 text-gray-800",
    };

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">History</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage your previous activity.
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4" />
                    Filter
                </button>
            </div>

            {/* Timeline */}
            <div className="mt-8 space-y-4">
                {historyItems.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
                    >
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.action}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {item.date} at {item.time}
                            </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${categoryColors[item.category]}`}>
                            {item.category}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
