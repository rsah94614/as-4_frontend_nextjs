import React from 'react';
import Link from 'next/link';
import DashboardRecognitionCard from './DashboardRecognitionCard';

const recentRecognitions = [
    {
        id: 1,
        from: "Priya Sharma",
        fromInitials: "PS",
        to: "Rahul Verma",
        toInitials: "RV",
        message: "Outstanding work on the Q4 client presentation!",
        points: 50,
        time: "2 hours ago",
        color: "bg-blue-500",
        image: "https://media.sproutsocial.com/uploads/2022/06/profile-picture.jpeg",
    },
    {
        id: 2,
        from: "Amit Patel",
        fromInitials: "AP",
        to: "Sneha Gupta",
        toInitials: "SG",
        message: "Great teamwork during the product launch sprint.",
        points: 30,
        time: "5 hours ago",
        color: "bg-purple-500",
        image: null
    },
    {
        id: 3,
        from: "Neha Desai",
        fromInitials: "ND",
        to: "Vikram Singh",
        toInitials: "VS",
        message: "Excellent mentoring of new team members this month.",
        points: 40,
        time: "1 day ago",
        color: "bg-emerald-500",
        image: null

    },
    {
        id: 4,
        from: "Rohan Mehta",
        fromInitials: "RM",
        to: "Ananya Iyer",
        toInitials: "AI",
        message: "Helped resolve a critical production issue overnight.",
        points: 60,
        time: "1 day ago",
        color: "bg-orange-500",
        image: null

    },
    {
        id: 5,
        from: "Kavita Nair",
        fromInitials: "KN",
        to: "Deepak Joshi",
        toInitials: "DJ",
        message: "Consistent delivery and positive attitude all quarter.",
        points: 25,
        time: "2 days ago",
        color: "bg-pink-500",
        image: null

    },
];

export const DashboardRecognitionSection = () => {
    return (
        <section className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-none">
            <div className="flex items-center justify-between mb-1">
                <h2 className="text-2xl font-medium pb-4">Recent Recognitions</h2>
                <Link href="/recognitions" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    View All
                </Link>
            </div>

            <div className="space-y-4">
                {recentRecognitions.map((item) => (
                    <DashboardRecognitionCard key={item.id} {...item} />
                ))}
            </div>
        </section>
    );
};

export default DashboardRecognitionSection;
