import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { ChevronLeft, ChevronRight, Car, CalendarDays, LogOut, X } from "lucide-react";
import ConfirmationDialog from "../../ui/ConfirmationDialog";

interface AdminSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export default function AdminSidebar({ isCollapsed, toggleSidebar, isMobileMenuOpen, setIsMobileMenuOpen }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const getButtonClass = (path: string, mobile: boolean = false) => {
    const isActive = location.pathname.startsWith(path);
    const collapseState = !mobile && isCollapsed;
    return `flex items-center ${collapseState ? "justify-center" : "gap-3 px-4"} py-3 rounded-lg font-medium transition-colors ${
      isActive 
        ? "bg-amber-100 text-amber-900" 
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => {
    const collapseState = !mobile && isCollapsed;
    
    return (
      <>
        {/* Brand Header */}
        <div className={`h-16 flex items-center justify-between border-b border-slate-200 ${collapseState ? "justify-center px-0" : "px-6"}`}>
          {!collapseState && (
            <Link to="/admin/vehicles" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
              <span className="font-extrabold text-slate-900 text-xl tracking-tight">
                Rent<span className="text-amber-500">Ride</span>
              </span>
              <span className="bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ml-1">Admin</span>
            </Link>
          )}
          
          {/* Toggle / Close Button */}
          {mobile ? (
            <button 
              onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={toggleSidebar}
              className={`p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors ${collapseState ? "" : "-mr-2"}`}
            >
              {collapseState ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className={`flex-1 overflow-y-auto py-6 space-y-2 ${collapseState ? "px-2" : "px-4"}`}>
          {/* Vehicles */}
          <Link title="Vehicles" to="/admin/vehicles" className={getButtonClass("/admin/vehicles", mobile)}>
            <Car className="w-5 h-5 shrink-0 opacity-75" />
            {!collapseState && <span>Vehicles</span>}
          </Link>
          
          {/* Rentals */}
          <Link title="Rentals" to="/admin/rentals" className={getButtonClass("/admin/rentals", mobile)}>
            <CalendarDays className="w-5 h-5 shrink-0 opacity-75" />
            {!collapseState && <span>Rentals</span>}
          </Link>
        </div>

        {/* Logout Footer */}
        <div className={`p-4 border-t border-slate-200 ${collapseState ? "px-2" : "px-4"}`}>
          <button 
            onClick={() => setIsLogoutDialogOpen(true)}
            title="Logout"
            className={`w-full flex items-center ${collapseState ? "justify-center" : "gap-3 px-4"} py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors`}
          >
            <LogOut className="w-5 h-5 shrink-0 opacity-75" />
            {!collapseState && <span>Logout</span>}
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col h-[calc(100vh-1.5rem)] sticky top-3 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 shrink-0 ${isCollapsed ? "w-20" : "w-64"}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
          />
          {/* Sidebar Drawer */}
          <aside className="relative flex flex-col w-64 h-full bg-white shadow-2xl animate-in slide-in-from-left duration-200">
            <SidebarContent mobile={true} />
          </aside>
        </div>
      )}

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
