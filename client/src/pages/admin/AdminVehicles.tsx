import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { getVehicles, deleteVehicle, type Vehicle, type VehiclePagination } from "../../services/vehicles.service";
import VehicleFormModal from "../../components/admin/VehicleFormModal";
import VehicleFilters from "../../components/vehicles/VehicleFilters";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pagination, setPagination] = useState<VehiclePagination | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  const [isCreatingVehicle, setIsCreatingVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicleId, setDeletingVehicleId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await getVehicles({
        search,
        category,
        sort,
        page,
        limit: 10, // Admin view might want smaller pages for tables
      });
      setVehicles(res.data);
      setPagination(res.pagination);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [search, category, sort, page]);

  // When filters change, reset page to 1
  useEffect(() => {
    setPage(1);
  }, [search, category, sort]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && pagination && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingVehicleId) return;
    try {
      setIsDeleting(true);
      await deleteVehicle(deletingVehicleId);
      toast.success("Vehicle deleted successfully");
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete vehicle");
    } finally {
      setIsDeleting(false);
      setDeletingVehicleId(null);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Vehicles</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage your fleet, pricing, and availability</p>
        </div>
        <button 
          onClick={() => setIsCreatingVehicle(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 text-sm font-bold rounded-xl transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {/* Filters (Reusing the public filter component but wrapping it nicely) */}
      <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200">
        <VehicleFilters 
          search={search}
          category={category}
          sort={sort}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onSortChange={setSort}
        />
      </div>

      {/* Table */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price/Day</th>
                <th className="px-6 py-4">Deposit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-medium">
                    Loading vehicles...
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-medium">
                    No vehicles found matching your criteria.
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => {
                  const image = vehicle.images?.[0];
                  const imageUrl = image ? (typeof image === 'string' ? image : (image as any).url) : null;

                  return (
                    <tr key={vehicle._id} className="hover:bg-slate-50 transition group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            {imageUrl ? (
                              <img src={imageUrl} alt={vehicle.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{vehicle.name}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{vehicle.registrationNumber || "NO REG"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                          {vehicle.category.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-slate-900">₹{vehicle.pricePerDay}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-500">{vehicle.securityDeposit ? `₹${vehicle.securityDeposit}` : '—'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          vehicle.status === "available" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          vehicle.status === "rented" ? "bg-blue-50 text-blue-600 border-blue-100" :
                          vehicle.status === "maintenance" ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-slate-50 text-slate-600 border-slate-200"
                        }`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingVehicle(vehicle)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeletingVehicleId(vehicle._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Showing page <span className="text-slate-900">{pagination.page}</span> of <span className="text-slate-900">{pagination.totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={!pagination.hasPreviousPage}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition"
              >
                Previous
              </button>
              <button 
                onClick={() => handlePageChange(page + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {(isCreatingVehicle || editingVehicle) && (
        <VehicleFormModal 
          initialData={editingVehicle}
          onClose={() => {
            setIsCreatingVehicle(false);
            setEditingVehicle(null);
          }} 
          onSuccess={() => {
            setIsCreatingVehicle(false);
            setEditingVehicle(null);
            fetchVehicles();
          }} 
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingVehicleId}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone and will permanently remove it from the system."
        confirmText={isDeleting ? "Deleting..." : "Delete Vehicle"}
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingVehicleId(null)}
      />
    </div>
  );
}
