import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";

export default function ReviewPage() {
    const reviewStats = [
        { label: "Pending Reviews", value: "23", icon: Clock, color: "text-yellow-500" },
        { label: "Approved", value: "142", icon: CheckCircle, color: "text-green-500" },
        { label: "Rejected", value: "8", icon: XCircle, color: "text-red-500" },
        { label: "Total Submissions", value: "173", icon: FileText, color: "text-blue-500" },
    ];

    const placeholderReviews = [
        { id: 1, employee: "Rahul Sharma", type: "Spot Award", date: "Feb 10, 2026", status: "Pending" },
        { id: 2, employee: "Priya Patel", type: "Quarterly Bonus", date: "Feb 9, 2026", status: "Pending" },
        { id: 3, employee: "Amit Kumar", type: "Peer Recognition", date: "Feb 8, 2026", status: "Pending" },
        { id: 4, employee: "Sneha Gupta", type: "Spot Award", date: "Feb 7, 2026", status: "Approved" },
        { id: 5, employee: "Vikram Singh", type: "Team Award", date: "Feb 6, 2026", status: "Approved" },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Review</h1>
            <p className="text-muted-foreground mt-1">
                Review and approve recognition nominations.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                {reviewStats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            <span className="text-sm font-medium text-gray-500">{stat.label}</span>
                        </div>
                        <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Review Table */}
            <div className="bg-white rounded-xl border shadow-sm mt-8">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold">Recent Submissions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-gray-50/50">
                                <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">Employee</th>
                                <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">Type</th>
                                <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">Date</th>
                                <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">Status</th>
                                <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {placeholderReviews.map((review) => (
                                <tr key={review.id} className="border-b last:border-0 hover:bg-gray-50/50">
                                    <td className="px-6 py-4 text-sm font-medium">{review.employee}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{review.type}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{review.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${review.status === "Pending"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : review.status === "Approved"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}>
                                            {review.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
