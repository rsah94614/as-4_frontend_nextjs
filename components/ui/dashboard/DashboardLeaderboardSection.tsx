import React from 'react';
import DashboardLeaderboardCard from './DashboardLeaderboardCard';

const leaderboard = [
    { rank: 1, name: "Sneha Gupta", initials: "SG", points: 320, color: "bg-purple-500" },
    { rank: 2, name: "Rahul Verma", initials: "RV", points: 285, color: "bg-blue-500" },
    { rank: 3, name: "Ananya Iyer", initials: "AI", points: 260, color: "bg-orange-500" },
    { rank: 4, name: "Vikram Singh", initials: "VS", points: 210, color: "bg-emerald-500" },
    { rank: 5, name: "Deepak Joshi", initials: "DJ", points: 195, color: "bg-pink-500" },
];


const DashboardLeaderboardSection = () => {
    return (
        <section className="lg:col-span-2 bg-white rounded-3xl border p-6 shadow-none">
            <div className="flex items-center justify-between mb-1">
                <h2 className="text-2xl font-medium pb-4">Leaderboard</h2>

            </div>


            <div className="space-y-3">
                {leaderboard.map((person) => (
                    <DashboardLeaderboardCard key={person.rank} {...person} />
                ))}
            </div>
        </section>
    );
};

export default DashboardLeaderboardSection;
