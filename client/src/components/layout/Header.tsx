import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate("/");
  };

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 w-full bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
      <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02] shrink-0">
        <span className="font-extrabold text-slate-900 text-2xl tracking-tight">
          Rent<span className="text-amber-500">Ride</span>
        </span>
      </Link>



      {/* User Actions */}
      <div className="flex items-center gap-3 ml-auto sm:ml-0 shrink-0">
        {isAuthenticated ? (
          <>
            {/* Show My Rentals Button */}
            <Link 
              to="/rentals" 
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
            >
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Show my rentals
            </Link>

            {/* Notification Bell */}
            <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm hover:bg-slate-50 transition relative">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            {/* Profile Dropdown Container */}
            <div className="relative flex items-center gap-2" ref={dropdownRef}>
              {user?.avatar ? (
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden border border-white shadow-sm ring-2 ring-transparent hover:ring-amber-400 transition cursor-pointer flex-shrink-0"
                >
                  <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center border border-white shadow-sm ring-2 ring-transparent hover:ring-amber-400 transition cursor-pointer flex-shrink-0 text-sm"
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}

              {/* Profile Greeting */}
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="hidden sm:flex flex-col items-start pl-1 cursor-pointer group"
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Welcome back,</span>
                <span className="text-sm font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">{user?.name?.split(' ')[0]}</span>
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="p-1.5">
                    <button 
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      View Profile
                    </button>
                    <div className="h-px bg-slate-100 my-1 mx-2" />
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/auth" className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold shadow-md hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
            Get Started
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        )}
      </div>
    </header>
  );
}
