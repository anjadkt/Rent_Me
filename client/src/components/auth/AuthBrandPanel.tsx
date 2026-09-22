export default function AuthBrandPanel() {
  return (
    <div className="hidden lg:flex lg:col-span-5 relative p-8 flex-col justify-between overflow-hidden bg-slate-900">
      {/* Background Image with Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1000&auto=format&fit=crop')`
        }}
      />
      {/* Gradient overlays for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2.5">
        <span className="text-2xl font-extrabold tracking-tight text-white">
          Rent<span className="text-amber-500">Ride</span>
        </span>
      </div>

      {/* Bottom Overlay Title & Badge */}
      <div className="relative z-10 mt-auto pt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold tracking-widest uppercase mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Premium Fleet
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight leading-snug">
          Drive on Your Terms
        </h2>
      </div>
    </div>
  );
}
