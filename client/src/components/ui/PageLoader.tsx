export default function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="relative flex justify-center items-center">
        {/* Outer Spinning Ring */}
        <div className="absolute animate-spin rounded-full h-16 w-16 border-[4px] border-amber-500 border-l-transparent border-r-transparent"></div>
        
        {/* Inner Static Logo */}
        <div className="rounded-full h-10 w-10 bg-slate-900 flex items-center justify-center shadow-lg">
          <span className="text-white font-black italic text-xl tracking-tighter pr-0.5">R</span>
        </div>
      </div>
      <p className="mt-6 text-sm text-slate-500 font-medium tracking-wide animate-pulse">Loading RentRide...</p>
    </div>
  );
}
