import React from "react";
import { ArrowUpRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../../components/common/Logo";

// 1. Data for Numbered Benefits (Matches Figma Screenshot 48)
const benefits = [
  {
    id: "01",
    title: "Flexible Learning Schedule",
    desc: "Fit your education around your busy life with self-paced content.",
  },
  {
    id: "02",
    title: "Expert Instruction",
    desc: "Learn from industry professionals with years of real-world experience.",
  },
  {
    id: "03",
    title: "Diverse Course Offerings",
    desc: "From UI/UX to Backend, explore a vast library of tech and design skills.",
  },
  {
    id: "04",
    title: "Updated Curriculum",
    desc: "We constantly update our content to match the latest industry trends.",
  },
  {
    id: "05",
    title: "Practical Projects",
    desc: "Build a portfolio while you learn with hands-on assignments.",
  },
  {
    id: "06",
    title: "Interactive Community",
    desc: "Connect with fellow learners and mentors for support and networking.",
  },
];

// 2. Data for Courses (2x2 Layout with requested categories)
const courses = [
  {
    id: 1,
    title: "Web Design Masterclass",
    description:
      "Master the art of creating stunning, responsive websites from scratch using modern design principles.",
    duration: "4 Weeks",
    level: "Beginner",
    image:
      "https://img.freepik.com/free-photo/web-design-technology-browsing-programming-concept_53876-163260.jpg",
  },
  {
    id: 2,
    title: "Stock Market & Trading",
    description:
      "Learn technical analysis, risk management, and advanced trading strategies for the modern market.",
    duration: "6 Weeks",
    level: "Intermediate",
    image:
      "https://iongroup.com/wp-content/uploads/2025/01/T16277_Blog-post-on-24-hour-trading-in-equities-markets_Featured-Image.png",
  },
  {
    id: 3,
    title: "Digital Illustration 101",
    description:
      "Explore digital drawing techniques, from sketching to final rendering using industry-standard tools.",
    duration: "8 Weeks",
    level: "Beginner",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "Full-Stack Development",
    description:
      "Build powerful, scalable web applications using React, Node.js, and modern database technologies.",
    duration: "12 Weeks",
    level: "Advanced",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Home() {
  return (
    <div className="bg-[#F7F7F8] min-h-screen">
      {/* HERO SECTION */}
      <section className="pt-16 pb-20 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Tagline Badge */}
          <div className="flex justify-center mb-10">
            <div className="bg-white p-3 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100">
              <div className="bg-[#FFF4E5] p-3 rounded-xl">
                <Zap className="w-8 h-8 text-[#FF9500]" fill="currentColor" />
              </div>
              <h1 className="text-2xl md:text-5xl font-bold text-gray-900 leading-tight">
                <span className="text-[#FF9500]">Unlock</span> Your Creative
                Potential
              </h1>
            </div>
          </div>

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xl md:text-3xl font-semibold text-gray-800 mb-6">
              with Online Design and Development Courses.
            </h2>
            <p className="text-gray-500 text-lg">
              Learn from Industry Experts and Enhance Your Skills.
            </p>
            <div className="flex gap-4 justify-center mt-10">
              <Link
                to="/courses"
                className="bg-[#FF9500] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#e68600] transition-all shadow-md inline-block"
              >
                Explore Courses
              </Link>
            </div>
          </div>

          {/* Hero Image Container */}
          <div className="rounded-[40px] overflow-hidden shadow-2xl border-[15px] border-white">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80"
              alt="Community Learning"
              className="w-full h-[450px] md:h-[650px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION (Numbered Grid) */}
      <section className="py-24 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Benefits</h2>
            <p className="text-gray-500 text-lg">
              Discover why thousands choose LevelUp-Hub for their growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((item) => (
              <div
                key={item.id}
                className="bg-white p-12 rounded-[30px] border border-gray-100 hover:border-[#FF9500]/40 transition-all group relative"
              >
                <span className="absolute top-8 right-10 text-5xl font-black text-gray-900">
                  {item.id}
                </span>
                <h4 className="text-2xl font-bold text-gray-800 mb-4 mt-8">
                  {item.title}
                </h4>
                <p className="text-gray-500 leading-relaxed mb-8">
                  {item.desc}
                </p>
                <div className="flex justify-end">
                  <Link
                    to="/courses"
                    className="p-4 bg-[#FCF7F0] rounded-2xl text-[#FF9500] group-hover:bg-[#FF9500] group-hover:text-white transition-all"
                  >
                    <ArrowUpRight size={28} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COURSES SECTION (2x2 Grid) */}
      <section className="py-24 px-6 lg:px-16 bg-[#F7F7F8]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl font-bold text-gray-900">Our Courses</h2>
              <p className="text-gray-500 mt-3 text-lg">
                Level up with these top-rated learning paths.
              </p>
            </div>
            <Link
              to="/courses"
              className="bg-white px-8 py-4 rounded-xl border border-gray-200 font-bold hover:bg-gray-50 shadow-sm transition-all inline-block"
            >
              View All Courses
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col"
              >
                <div className="overflow-hidden rounded-3xl mb-8">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-80 object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>

                <div className="flex gap-3 mb-6">
                  <span className="px-5 py-2 bg-[#F7F7F8] border border-gray-100 rounded-xl text-sm font-bold text-gray-700">
                    {course.duration}
                  </span>
                  <span className="px-5 py-2 bg-[#F7F7F8] border border-gray-100 rounded-xl text-sm font-bold text-gray-700">
                    {course.level}
                  </span>
                </div>

                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {course.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-10 flex-grow">
                  {course.description}
                </p>

                <Link
                  to="/courses"
                  className="w-full py-5 bg-[#F7F7F8] text-center text-gray-900 font-black rounded-2xl hover:bg-[#FF9500] hover:text-white transition-all text-lg shadow-sm"
                >
                  Get It Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
