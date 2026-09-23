import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { ChevronLeft, ChevronRight, Car, CalendarDays, Users, LogOut } from "lucide-react";
import ConfirmationDialog from "../../ui/ConfirmationDialog";

export default function AdminSidebar({ isCollapsed, toggleSidebar }: { isCollapsed: boolean; toggleSidebar: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const getButtonClass = (path: string) => {
    const isActive = location.pathname.startsWith(path);
    return `flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-4"} py-3 rounded-lg font-medium transition-colors ${
      isActive 
        ? "bg-amber-100 text-amber-900" 
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;
  };

  return (
    <>
      <aside className={`hidden md:flex flex-col h-[calc(100vh-1.5rem)] sticky top-3 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 shrink-0 ${isCollapsed ? "w-20" : "w-64"}`}>
        {/* Brand Header */}
        <div className={`h-16 flex items-center justify-between border-b border-slate-200 ${isCollapsed ? "justify-center px-0" : "px-6"}`}>
          {!isCollapsed && (
            <Link to="/admin/vehicles" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
              <span className="font-extrabold text-slate-900 text-xl tracking-tight">
                Rent<span className="text-amber-500">Ride</span>
              </span>
              <span className="bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ml-1">Admin</span>
            </Link>
          )}
          
          {/* Toggle Button */}
          <button 
            onClick={toggleSidebar}
            className={`p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors ${isCollapsed ? "" : "-mr-2"}`}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <div className={`flex-1 overflow-y-auto py-6 space-y-2 ${isCollapsed ? "px-2" : "px-4"}`}>
          {/* Vehicles */}
          <Link title="Vehicles" to="/admin/vehicles" className={getButtonClass("/admin/vehicles")}>
            <Car className="w-5 h-5 shrink-0 opacity-75" />
            {!isCollapsed && <span>Vehicles</span>}
          </Link>
          
          {/* Rentals */}
          <Link title="Rentals" to="/admin/rentals" className={getButtonClass("/admin/rentals")}>
            <CalendarDays className="w-5 h-5 shrink-0 opacity-75" />
            {!isCollapsed && <span>Rentals</span>}
          </Link>

          {/* Users */}
          <Link title="Users" to="/admin/users" className={getButtonClass("/admin/users")}>
            <Users className="w-5 h-5 shrink-0 opacity-75" />
            {!isCollapsed && <span>Users</span>}
          </Link>
        </div>

        {/* Logout Footer */}
        <div className={`p-4 border-t border-slate-200 ${isCollapsed ? "px-2" : "px-4"}`}>
          <button 
            onClick={() => setIsLogoutDialogOpen(true)}
            title="Logout"
            className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-4"} py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors`}
          >
            <LogOut className="w-5 h-5 shrink-0 opacity-75" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <ConfirmationDialog
        isOpen={isLogoutDialogOpen}
        title="Logout"
        message="Are you sure you want to log out of the admin panel?"
        confirmText="Logout"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </>
  );
}
