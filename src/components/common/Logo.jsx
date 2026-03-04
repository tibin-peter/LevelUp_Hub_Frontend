// src/components/Logo.jsx
export default function Logo() {
  return (
    <div className="flex items-center gap-2 group cursor-pointer">
      {/* The Icon Box - Matches Figma Screenshot (46) */}
      <div className="w-10 h-10 bg-[#FF9500] rounded-xl flex items-center justify-center shadow-sm group-hover:bg-[#e68600] transition-colors">
        <span className="text-white font-black text-2xl italic tracking-tighter">
          L
        </span>
      </div>
      
      {/* The Text Brand */}
      <div className="flex flex-col justify-center">
        <span className="text-xl font-bold text-gray-800 leading-none tracking-tight">
          LevelUp<span className="text-[#FF9500]">-</span>Hub
        </span>
      </div>
    </div>
  );
}