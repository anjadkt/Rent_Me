import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f3f2ee] font-sans text-slate-800 flex">
      <Sidebar />
      <main className="flex-1 p-4 pb-24 md:pb-4 sm:p-8 max-w-7xl mx-auto w-full">
        <Header />
        <Outlet />
      </main>
    </div>
  );
}
