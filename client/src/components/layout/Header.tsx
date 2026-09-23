import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Settings, Car, Bell, User, LogOut, ArrowRight } from "lucide-react";
import ConfirmationDialog from "../ui/ConfirmationDialog";
import toast from "react-hot-toast";

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

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsLogoutDialogOpen(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <header className="flex justify-between items-center mb-8 w-full bg-white px-4 sm:px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
      <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02] shrink-0">
        <span className="font-extrabold text-slate-900 text-2xl tracking-tight">
          Rent<span className="text-amber-500">Ride</span>
        </span>
      </Link>



      {/* User Actions */}
      <div className="flex items-center gap-3 ml-auto sm:ml-0 shrink-0">
        {isAuthenticated ? (
          <>
            {/* Show Admin Portal Button */}
            {user?.role === "admin" && (
              <Link 
                to="/admin/vehicles" 
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold shadow-sm hover:bg-amber-200 transition-all hover:scale-105 active:scale-95 border border-amber-200"
              >
                <Settings className="w-4 h-4" />
                Admin Portal
              </Link>
            )}

            {/* Show My Rentals Button */}
            <Link 
              to="/rentals" 
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
            >
              <Car className="w-4 h-4 text-amber-400" />
              Show my rentals
            </Link>

            {/* Notification Bell */}
            <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm hover:bg-slate-50 transition relative">
              <Bell className="w-4 h-4" />
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
                      <User className="w-4 h-4 text-slate-400" />
                      View Profile
                    </button>
                    <div className="h-px bg-slate-100 my-1 mx-2" />
                    <button 
                      onClick={() => setIsLogoutDialogOpen(true)}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
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
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <ConfirmationDialog
        isOpen={isLogoutDialogOpen}
        title="Logout"
        message="Are you sure you want to log out of your account?"
        confirmText="Logout"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </header>
  );
}
