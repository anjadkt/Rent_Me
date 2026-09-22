import { useState } from "react";
import type { Vehicle } from "../../services/vehicles.service";

interface VehicleDetailDrawerProps {
  vehicle: Vehicle;
  onClose?: () => void;
}

export default function VehicleDetailDrawer({ vehicle, onClose }: VehicleDetailDrawerProps) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const currentImage = vehicle.images?.[currentImageIdx];
  const image = currentImage
    ? (typeof currentImage === 'string' ? currentImage : (currentImage as any).url)
    : "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop";

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-6 relative overflow-y-auto scrollbar-hide max-h-[calc(100vh-3rem)]">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <button className="text-slate-400 hover:text-slate-700 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
        </button>
      </div>

      {/* Main Image */}
      <div className="aspect-[16/10] flex items-center justify-center my-2 bg-slate-50 rounded-xl overflow-hidden shadow-sm">
        <img src={image} alt={vehicle.name} className="w-full h-full object-cover rounded-xl" />
      </div>

      {/* Thumbnails Gallery */}
      {vehicle.images && vehicle.images.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {vehicle.images.map((img, idx) => {
            const thumbUrl = typeof img === 'string' ? img : (img as any).url;
            return (
              <button
                key={idx}
                onClick={() => setCurrentImageIdx(idx)}
                className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  idx === currentImageIdx ? "border-amber-500 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={thumbUrl} alt={`${vehicle.name} view ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      )}

      {/* Name and Price Header */}
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {vehicle.name}
        </h2>
        <div className="text-right">
          <span className="text-xl font-extrabold text-slate-900">₹{vehicle.pricePerDay}</span>
          <span className="text-xs text-slate-400 font-medium"> / day</span>
        </div>
      </div>

      {/* Dark Overview Specifications Box */}
      <div className="bg-[#1c1e22] text-white rounded-2xl p-4 space-y-4 shadow-lg">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Car Overview
        </span>

        {/* Spec Badges */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-700/60">
            <span className="text-slate-400 block text-[10px] mb-0.5">Fuel</span>
            <span className="font-bold text-white">Petrol</span>
          </div>
          <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-700/60">
            <span className="text-slate-400 block text-[10px] mb-0.5">Capacity</span>
            <span className="font-bold text-white">4 Seats</span>
          </div>
          <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-700/60">
            <span className="text-slate-400 block text-[10px] mb-0.5">Speed</span>
            <span className="font-bold text-white">305 km/h</span>
          </div>
        </div>

        {/* Pricing Plans Pills */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Plans
          </span>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-800/50 rounded-xl p-2 border border-slate-700/40 text-center">
              <span className="text-[10px] text-slate-400 block">Hourly</span>
              <span className="text-xs font-bold text-white">₹{Math.round(vehicle.pricePerDay / 10)} / hr</span>
            </div>
            <div className="bg-amber-400 text-slate-900 rounded-xl p-2 text-center font-bold shadow-sm">
              <span className="text-[10px] text-slate-800 block">Daily</span>
              <span className="text-xs font-extrabold">₹{vehicle.pricePerDay} / day</span>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-2 border border-slate-700/40 text-center">
              <span className="text-[10px] text-slate-400 block">Monthly</span>
              <span className="text-xs font-bold text-white">₹{vehicle.pricePerDay * 22}</span>
            </div>
          </div>
        </div>

        {/* Pickup Location Box */}
        <div className="space-y-1 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 block">
            Pick-up Location
          </span>
          <div className="flex items-center gap-2 bg-slate-800/70 p-3 rounded-xl text-xs text-slate-300 border border-slate-700/50">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="truncate">1650 E Randol Mill Rd, Arlington, TX</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <div>
            <span className="text-lg font-extrabold text-white">₹{vehicle.pricePerDay}</span>
            <span className="text-[10px] text-slate-400"> / day</span>
          </div>
          <button className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-xs py-3 rounded-xl transition shadow-md">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}