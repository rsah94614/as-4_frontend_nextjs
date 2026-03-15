import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardRecognitionCardProps {
    id: string;
    from: string;
    fromInitials: string;
    to: string;
    toInitials: string;
    message: string;
    tags: string[];
    time: string;
    color: string;
    image: string | null;
}

const TAG_COLORS = [
    "bg-blue-50 text-blue-700 border-blue-200",
    "bg-violet-50 text-violet-700 border-violet-200",
    "bg-teal-50 text-teal-700 border-teal-200",
    "bg-amber-50 text-amber-700 border-amber-200",
    "bg-rose-50 text-rose-700 border-rose-200",
];

export default function DashboardRecognitionCard({
    from,
    fromInitials,
    message,
    tags,
    time,
    color,
    image,
}: DashboardRecognitionCardProps) {
    return (
        <div className="group relative bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200">
            {/* Quote accent */}
            {/* <Quote className="absolute top-3 right-4 w-5 h-5 text-gray-100 group-hover:text-gray-150 transition-colors" /> */}

            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={image ?? undefined} />
                    <AvatarFallback className={`${color} text-white text-xs font-bold`}>
                        {fromInitials}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-bold text-gray-900 truncate">{from}</p>
                        <span className="text-[11px] text-gray-400 shrink-0">{time}</span>
                    </div>
                    <p className="text-xs text-gray-400">recognised you</p>
                </div>
            </div>

            {/* Message */}
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3 pl-0.5">
                &ldquo;{message}&rdquo;
            </p>

            {/* Tags */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag, i) => (
                        <span
                            key={tag}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${TAG_COLORS[i % TAG_COLORS.length]}`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
