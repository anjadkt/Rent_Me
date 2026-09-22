import type { Vehicle } from "../../services/vehicles.service";
import VehicleCard from "./VehicleCard";

interface VehicleListProps {
  vehicles: Vehicle[];
  loading: boolean;
  selectedVehicleId?: string;
  onSelectVehicle: (vehicle: Vehicle) => void;
  isDrawerOpen?: boolean;
}

export default function VehicleList({
  vehicles,
  loading,
  selectedVehicleId,
  onSelectVehicle,
  isDrawerOpen = false,
}: VehicleListProps) {
  const gridClasses = isDrawerOpen
    ? "grid grid-cols-1 2xl:grid-cols-2 gap-4"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

  if (loading) {
    return (
      <div className={gridClasses}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl bg-white p-4 border border-slate-200/80 animate-pulse space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-6 w-6 bg-slate-200 rounded-full" />
            </div>
            <div className="aspect-[16/10] bg-slate-200 rounded-xl my-2" />
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <div className="h-3 w-16 bg-slate-200 rounded" />
              <div className="h-4 w-12 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-12 text-center border border-slate-200/80">
        <h3 className="text-sm font-extrabold text-slate-900">No vehicles found</h3>
        <p className="text-xs text-slate-400 mt-1">Try refining your search terms or filters.</p>
      </div>
    );
  }

  return (
    <div className={gridClasses}>
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle._id}
          vehicle={vehicle}
          isSelected={selectedVehicleId === vehicle._id}
          onSelect={() => onSelectVehicle(vehicle)}
        />
      ))}
    </div>
  );
}