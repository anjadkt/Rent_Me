import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getAllRentals, rejectRental, cancelRental, completeRental, type IRental, type RentalPagination } from "../../services/rental.service";
import { Search, Image as ImageIcon, Calendar, User, CheckCircle, XCircle, XOctagon, MessageSquareText } from "lucide-react";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";
import { format } from "date-fns";

export default function AdminRentals() {
  const [rentals, setRentals] = useState<IRental[]>([]);
  const [pagination, setPagination] = useState<RentalPagination | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  // Action states
  const [actionRental, setActionRental] = useState<IRental | null>(null);
  const [actionType, setActionType] = useState<"reject" | "cancel" | "complete" | null>(null);
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const res = await getAllRentals({
        search,
        status,
        paymentStatus,
        sort,
        page,
        limit: 10,
      });
      setRentals(res.data);
      setPagination(res.pagination);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load rentals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [search, status, paymentStatus, sort, page]);

  useEffect(() => {
    setPage(1);
  }, [search, status, paymentStatus, sort]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && pagination && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "pending": return "bg-amber-50 text-amber-600 border-amber-100";
      case "completed": return "bg-blue-50 text-blue-600 border-blue-100";
      case "cancelled": return "bg-red-50 text-red-600 border-red-100";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "text-emerald-600 bg-emerald-50 ring-emerald-500/20";
      case "pending": return "text-amber-600 bg-amber-50 ring-amber-500/20";
      case "failed": return "text-red-600 bg-red-50 ring-red-500/20";
      case "refunded": return "text-slate-600 bg-slate-100 ring-slate-500/20";
      default: return "text-slate-600 bg-slate-50 ring-slate-500/20";
    }
  };

  const handleAction = async () => {
    if (!actionRental || !actionType) return;
    
    if (!notes.trim()) {
      toast.error("Please provide notes for this action");
      return;
    }

    try {
      setIsProcessing(true);
      if (actionType === "reject") {
        await rejectRental(actionRental._id, notes);
        toast.success("Rental rejected and refunded");
      } else if (actionType === "cancel") {
        await cancelRental(actionRental._id, notes);
        toast.success("Rental cancelled successfully");
      } else if (actionType === "complete") {
        await completeRental(actionRental._id, notes);
        toast.success("Rental marked as complete");
      }
      fetchRentals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${actionType} rental`);
    } finally {
      setIsProcessing(false);
      setActionRental(null);
      setActionType(null);
      setNotes("");
    }
  };

  const getActionDialogContent = () => {
    if (!actionType) return { title: "", message: "", confirmText: "" };
    switch (actionType) {
      case "reject":
        return {
          title: "Reject Rental",
          message: "Are you sure you want to reject this rental? A full 100% refund will automatically be issued to the customer.",
          confirmText: "Reject & Refund",
        };
      case "cancel":
        return {
          title: "Cancel Rental",
          message: "Are you sure you want to cancel this rental? A 10% deduction will be taken from the rental fund (excluding security deposit), and the rest will be refunded.",
          confirmText: "Cancel & Partial Refund",
        };
      case "complete":
        return {
          title: "Complete Rental",
          message: "Are you sure you want to mark this rental as complete? The full security deposit will be automatically refunded to the customer.",
          confirmText: "Complete & Refund Deposit",
        };
    }
  };

  const actionContent = getActionDialogContent();

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Rentals</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Monitor platform bookings and payments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by vehicle, user, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 min-w-[140px] shadow-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 min-w-[160px] shadow-sm"
            >
              <option value="">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 min-w-[140px] shadow-sm"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="start_earliest">Start Earliest</option>
              <option value="start_latest">Start Latest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-medium">
                    Loading rentals...
                  </td>
                </tr>
              ) : rentals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-medium">
                    No rentals found matching your criteria.
                  </td>
                </tr>
              ) : (
                rentals.map((rental) => {
                  const sortedDates = [...rental.dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                  const startDate = new Date(sortedDates[0]);
                  const endDate = new Date(sortedDates[sortedDates.length - 1]);

                  return (
                    <tr key={rental._id} className="hover:bg-slate-50 transition group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{rental.user?.name || "Unknown User"}</div>
                            <div className="text-[10px] font-bold text-slate-400">{rental.user?.email || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-8 rounded bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            {rental.vehicleSnapshot.image ? (
                              <img src={rental.vehicleSnapshot.image} alt="vehicle" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-3 h-3 text-slate-300" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{rental.vehicleSnapshot.name}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{rental.vehicleSnapshot.registrationNumber || "NO REG"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <div>
                            <div className="font-bold text-slate-700">
                              {format(startDate, "MMM dd")} - {format(endDate, "MMM dd, yyyy")}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400">
                              {rental.dates.length} Days
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-slate-900">₹{rental.priceSnapshot.totalAmount}</div>
                        <div className="text-[10px] font-bold text-slate-400">
                          ₹{rental.priceSnapshot.rentalAmount} + ₹{rental.priceSnapshot.securityDeposit} Dep
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ${getPaymentStatusColor(rental.paymentStatus)}`}>
                            {rental.paymentStatus}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(rental.status)}`}>
                            {rental.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {(rental.status === "active" || rental.status === "pending") && (
                            <button 
                              onClick={() => { setActionRental(rental); setActionType("reject"); }} 
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" 
                              title="Reject Rental"
                            >
                              <XOctagon className="w-4 h-4" />
                            </button>
                          )}
                          {rental.status === "active" && (
                            <>
                              <button 
                                onClick={() => { setActionRental(rental); setActionType("cancel"); }} 
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition" 
                                title="Cancel Rental"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => { setActionRental(rental); setActionType("complete"); }} 
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" 
                                title="Mark as Completed"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
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

      <ConfirmationDialog
        isOpen={!!actionType}
        title={actionContent.title}
        message={actionContent.message}
        confirmText={isProcessing ? "Processing..." : actionContent.confirmText}
        cancelText="Close"
        isDestructive={actionType === "reject" || actionType === "cancel"}
        onConfirm={handleAction}
        onCancel={() => {
          if (isProcessing) return;
          setActionType(null);
          setActionRental(null);
          setNotes("");
        }}
      >
        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-bold text-slate-700">
            Action Notes <span className="text-red-500">*</span>
          </label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Please provide a reason or notes for this action..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none shadow-sm"
          />
        </div>
      </ConfirmationDialog>
    </div>
  );
}
