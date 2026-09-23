import type { IRental } from "../../services/rental.service";
import { Calendar, MessageSquareText } from "lucide-react";

interface RentalCardProps {
  rental: IRental;
}

export default function RentalCard({ rental }: RentalCardProps) {
  const { vehicleSnapshot, priceSnapshot, dates, status } = rental;

  const sortedDates = [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const startDate = new Date(sortedDates[0]);
  const endDate = new Date(sortedDates[sortedDates.length - 1]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isSingleDay = sortedDates.length === 1;
  const dateText = isSingleDay
    ? formatDate(startDate)
    : `${formatDate(startDate)} - ${formatDate(endDate)}`;

  const statusColors = {
    ACTIVE: "bg-amber-100 text-amber-700 border-amber-200",
    COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
    PENDING: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const statusColor = statusColors[status as keyof typeof statusColors] || statusColors.PENDING;

  const latestLog = rental.logs && rental.logs.length > 0 
    ? rental.logs[rental.logs.length - 1] 
    : null;

  const noteColors = {
    REJECTED: "bg-red-50 text-red-700 border-red-100",
    CANCELLED: "bg-rose-50 text-rose-700 border-rose-100",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="w-full sm:w-48 h-40 sm:h-auto bg-slate-100 relative shrink-0">
        {vehicleSnapshot.image ? (
          <img
            src={vehicleSnapshot.image}
            alt={vehicleSnapshot.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            No Image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">{vehicleSnapshot.name}</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                {vehicleSnapshot.brand} • {vehicleSnapshot.category.replace("_", " ")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${statusColor}`}>
                {status}
              </span>
              {latestLog && ["REJECTED", "CANCELLED", "COMPLETED"].includes(status.toUpperCase()) && (
                <div className="cursor-help" title={`Admin Note:\n${latestLog.notes}`}>
                  <MessageSquareText className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 text-sm font-medium text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            {dateText} <span className="text-slate-400 font-normal">({dates.length} {dates.length === 1 ? 'Day' : 'Days'})</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-end">
          <div className="text-xs text-slate-500 font-medium">
            Booked on {new Date(rental.createdAt).toLocaleDateString("en-IN")}
          </div>
          <div className="text-right">
            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Total Paid</span>
            <span className="text-xl font-black text-slate-900">₹{priceSnapshot.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
