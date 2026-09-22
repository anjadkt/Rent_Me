import { Link, useLocation } from "react-router-dom";

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
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </Link>
      </div>

      {/* Top Navigation */}
      <div className="flex-1 flex flex-col justify-start items-center w-full mt-8">
        <nav className="flex flex-col gap-4 bg-white/70 backdrop-blur-md p-2 rounded-full border border-slate-200/60 shadow-sm">
        {/* Vehicles / Home */}
        <Link to="/" className={getButtonClass("/")}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
        
        {/* Rentals */}
        <Link to="/rentals" className={getButtonClass("/rentals")}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </Link>
      </nav>
      </div>
    </aside>
  );
}
