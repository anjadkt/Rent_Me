import React from "react";
import AuthBrandPanel from "./AuthBrandPanel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans antialiased">
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <AuthBrandPanel />
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
          <div className="w-full max-w-sm mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
