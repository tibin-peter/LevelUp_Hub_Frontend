import { Star, Clock, User } from 'lucide-react';

export default function CourseCard({
    image = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    title = "Untitled Course",
    instructor = "Unknown Instructor",
    rating = 4.5,
    reviews = 120,
    duration = "10h 30m",
    price = "$49.99"
}) {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 group">
            <div className="relative overflow-hidden h-48">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-800 shadow-sm">
                    {price}
                </div>
            </div>

            <div className="p-5">
                <div className="flex items-center gap-1 text-yellow-500 mb-2">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-bold text-gray-700">{rating}</span>
                    <span className="text-xs text-gray-400">({reviews})</span>
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                    {title}
                </h3>

                <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                    <div className="flex items-center gap-1.5">
                        <User size={14} />
                        <span>{instructor}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{duration}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
