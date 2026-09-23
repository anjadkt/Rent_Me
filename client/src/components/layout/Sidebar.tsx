import { Link, useLocation } from "react-router-dom";
import { Navigation, Car, ArrowRightLeft } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const getButtonClass = (path: string) => {
    const isActive = location.pathname === path;
    return `p-3 rounded-full transition-all ${
      isActive 
        ? "bg-amber-400 text-slate-900 shadow-sm" 
        : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
    }`;
  };

  return (
    <aside className="hidden md:flex flex-col pt-8 pb-6 px-4 bg-[#f3f2ee] border-r border-slate-200/60 w-20 h-screen sticky top-0">
      {/* Top Logo Icon aligned horizontally to the right */}
      <div className="w-full flex justify-end">
        <Link to="/" className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md hover:bg-slate-800 transition-colors">
          <Navigation className="w-4 h-4 fill-current" />
        </Link>
      </div>

      {/* Top Navigation */}
      <div className="flex-1 flex flex-col justify-start items-center w-full mt-8">
        <nav className="flex flex-col gap-4 bg-white/70 backdrop-blur-md p-2 rounded-full border border-slate-200/60 shadow-sm">
        {/* Vehicles / Home */}
        <Link to="/" className={getButtonClass("/")}>
          <Car className="w-5 h-5" />
        </Link>
        
        {/* Rentals */}
        <Link to="/rentals" className={getButtonClass("/rentals")}>
          <ArrowRightLeft className="w-5 h-5" />
        </Link>
      </nav>
      </div>
    </aside>
  );
}
