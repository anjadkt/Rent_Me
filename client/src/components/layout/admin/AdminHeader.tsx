import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { ArrowLeft, LogOut } from "lucide-react";

export default function AdminHeader() {
  const { user, logout } = useAuth();
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
    <header className="h-16 flex justify-between items-center bg-white border border-slate-200 rounded-2xl px-6 w-full shrink-0 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 group transition-transform hover:scale-[1.02] shrink-0">
          <span className="font-extrabold text-slate-900 text-xl tracking-tight">
            Admin<span className="text-amber-500">Portal</span>
          </span>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-3 ml-auto sm:ml-0 shrink-0">
        {/* Back to Home Button */}
        <Link 
          to="/" 
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold shadow-sm hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>

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
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          )}

          {/* Profile Greeting */}
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="hidden sm:flex flex-col items-start pl-1 cursor-pointer group"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin</span>
            <span className="text-sm font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">{user?.name?.split(' ')[0]}</span>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
              <div className="p-1.5">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
