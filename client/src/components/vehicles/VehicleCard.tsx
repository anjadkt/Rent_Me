import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import type { Vehicle } from "../../services/vehicles.service";
import { Heart, Zap } from "lucide-react";

interface VehicleCardProps {
  vehicle: Vehicle;
  isSelected?: boolean;
  onSelect: () => void;
}

export default function VehicleCard({ vehicle, isSelected, onSelect }: VehicleCardProps) {
  // Handle both string and object image formats for backward compatibility
  const currentImage = vehicle.images?.[0];
  const image = currentImage
    ? (typeof currentImage === 'string' ? currentImage : (currentImage as any).url)
    : "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop";

  return (
    <div
      onClick={onSelect}
      className={`group cursor-pointer rounded-2xl bg-white p-4 transition-all duration-300 relative border ${
        isSelected
          ? "border-slate-900 shadow-md ring-1 ring-slate-900"
          : "border-slate-200/70 hover:border-slate-300 hover:shadow-md"
      }`}
    >
      {/* Top Details & Rating */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight group-hover:text-amber-600 transition">
            {vehicle.name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500 font-semibold">
            <span className="text-amber-500 text-sm">★</span> 4.96
            <span className="text-slate-400 font-normal">(141 trips)</span>
          </div>
        </div>

        {/* Heart / Favorite Button */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Car Image Preview */}
      <div 
        className="my-2 aspect-[16/10] flex items-center justify-center overflow-hidden rounded-xl bg-slate-50 relative group/swiper"
        onClick={(e) => {
          // If clicking on swiper arrows/pagination, prevent card selection
          if ((e.target as HTMLElement).closest('.swiper-button-next, .swiper-button-prev, .swiper-pagination')) {
            e.stopPropagation();
          }
        }}
      >
        {vehicle.images && vehicle.images.length > 1 ? (
          <Swiper
            modules={[Pagination, Navigation]}
            pagination={{ clickable: true }}
            navigation={true}
            className="w-full h-full rounded-xl [&_.swiper-button-next]:text-white [&_.swiper-button-prev]:text-white [&_.swiper-button-next]:opacity-0 [&_.swiper-button-prev]:opacity-0 group-hover/swiper:[&_.swiper-button-next]:opacity-100 group-hover/swiper:[&_.swiper-button-prev]:opacity-100 [&_.swiper-button-next]:transition-opacity [&_.swiper-button-prev]:transition-opacity [&_.swiper-pagination-bullet-active]:bg-white [&_.swiper-pagination-bullet]:bg-white/50"
          >
            {vehicle.images.map((img, idx) => {
              const url = typeof img === 'string' ? img : (img as any).url;
              return (
                <SwiperSlide key={idx}>
                  <img
                    src={url}
                    alt={`${vehicle.name} - ${idx + 1}`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
        ) : (
          <img
            src={image}
            alt={vehicle.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-xl"
          />
        )}
      </div>

      {/* Spec Tags & Price */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Auto
          </span>
          <span>•</span>
          <span className="capitalize">{vehicle.category}</span>
        </div>

        <div className="text-right">
          <span className="font-extrabold text-slate-900 text-sm">
            ₹{vehicle.pricePerDay}
          </span>
          <span className="text-[9px] text-slate-400 font-medium"> / day</span>
        </div>
      </div>
    </div>
  );
}