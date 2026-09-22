import { useEffect, useState } from "react";
import VehicleFilters from "../components/vehicles/VehicleFilters";
import VehicleList from "../components/vehicles/VehicleList";
import VehiclePaginationComponent from "../components/vehicles/VehiclePagination";
import VehicleDetailDrawer from "../components/vehicles/VehicleDetailDrawer";
import { getVehicles, type Vehicle, type VehiclePagination } from "../services/vehicles.service";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pagination, setPagination] = useState<VehiclePagination | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("latest");

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const limit = 12;

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getVehicles({
        search: search || undefined,
        category: category || undefined,
        sort: sort || undefined,
        status: "available",
        isActive: true,
        page,
        limit,
      });

      setVehicles(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load vehicles");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [search, category, sort, page]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
        {/* Error Notification */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Main Grid + Drawer Container */}
        <div className={`grid grid-cols-1 ${selectedVehicle ? "lg:grid-cols-12 gap-6" : ""} items-start`}>
          {/* Left / Main Cards List */}
          <div className={`${selectedVehicle ? "lg:col-span-5 xl:col-span-4" : "col-span-1 lg:col-span-12"} flex flex-col gap-4`}>
            
            {/* Filters Panel */}
            <VehicleFilters
              search={search}
              category={category}
              sort={sort}
              onSearchChange={handleSearchChange}
              onCategoryChange={handleCategoryChange}
              onSortChange={handleSortChange}
            />

            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {!loading && pagination ? `${pagination.total} Vehicles for rent` : "Vehicles"}
              </p>
            </div>

            <VehicleList
              vehicles={vehicles}
              loading={loading}
              selectedVehicleId={selectedVehicle?._id}
              onSelectVehicle={(v) => setSelectedVehicle(v)}
              isDrawerOpen={!!selectedVehicle}
            />

            {/* Pagination Component */}
            {pagination && (
              <VehiclePaginationComponent
                page={pagination.page}
                totalPages={pagination.totalPages}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
                onPageChange={handlePageChange}
              />
            )}
          </div>

          {/* Right Selected Detail Drawer Card */}
          {selectedVehicle && (
            <div className="lg:col-span-7 xl:col-span-8 sticky top-6">
              <VehicleDetailDrawer 
                vehicle={selectedVehicle} 
                onClose={() => setSelectedVehicle(null)} 
              />
            </div>
          )}
        </div>
    </>
  );
}