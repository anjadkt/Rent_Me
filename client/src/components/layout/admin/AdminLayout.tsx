import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("adminSidebarCollapsed");
    // If not found in localStorage, you can default it to false (open) or true (closed)
    // "don't leave it always open" might imply we should default it to collapsed or just remember what they chose.
    // Assuming remember what they chose, default false is fine.
    return saved === "true";
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("adminSidebarCollapsed", String(newState));
      return newState;
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex p-3 gap-3">
      {/* Sidebar on the left */}
      <AdminSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 gap-3">
        <AdminHeader />
        
        {/* Scrollable Content */}
        <main className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-auto p-6 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
