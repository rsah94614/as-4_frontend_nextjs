export default function NotificationsPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="p-4 border-b text-lg font-semibold">
                Notifications
            </div>

            <div className="divide-y">
                <div className="p-4">
                    🎉 You received a reward from HR
                </div>
                <div className="p-4">
                    ⭐ Your nomination was approved
                </div>
                <div className="p-4">
                    🏆 Top performer this month!
                </div>
            </div>
        </div>
    );
}