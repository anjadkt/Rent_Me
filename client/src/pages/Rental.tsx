
import { useEffect, useState } from "react";
import { getUserRentals } from "../services/rental.service";
import type { IRental } from "../services/rental.service";
import RentalCard from "../components/rentals/RentalCard";
import toast from "react-hot-toast";

export default function Rentals() {
  const [activeRentals, setActiveRentals] = useState<IRental[]>([]);
  const [pastRentals, setPastRentals] = useState<IRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");

  useEffect(() => {
    let mounted = true;
    const fetchRentals = async () => {
      try {
        setLoading(true);
        const res = await getUserRentals();
        if (mounted) {
          setActiveRentals(res.data.active || []);
          setPastRentals(res.data.past || []);
        }
      } catch (error: any) {
        if (mounted) {
          toast.error(error.response?.data?.message || "Failed to load rentals");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRentals();
    return () => {
      mounted = false;
    };
  }, []);

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm h-40 animate-pulse flex">
          <div className="w-48 bg-slate-200 h-full shrink-0" />
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="w-1/2 h-6 bg-slate-200 rounded mb-2" />
              <div className="w-1/3 h-4 bg-slate-200 rounded" />
            </div>
            <div className="w-full h-8 bg-slate-200 rounded mt-4" />
          </div>
        </div>
      ))}
    </div>
  );

  const displayedRentals = activeTab === "active" ? activeRentals : pastRentals;

  return (
    <div className="py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6">
        <div className="text-center sm:text-left">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">My Rentals</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">View and manage your booking history</p>
        </div>

        <div className="bg-white p-1.5 rounded-xl border border-slate-200 inline-flex shadow-sm mx-auto sm:mx-0 shrink-0">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "active"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Active Bookings ({!loading ? activeRentals.length : '-'})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "past"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Past Bookings ({!loading ? pastRentals.length : '-'})
          </button>
        </div>
      </div>

      <div>
        {loading ? (
          renderSkeleton()
        ) : displayedRentals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedRentals.map((rental) => (
              <RentalCard key={rental._id} rental={rental} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-3xl border border-slate-200 border-dashed p-12 text-center">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No rentals found</h3>
            <p className="text-slate-500 text-sm">
              {activeTab === "active" 
                ? "You don't have any active bookings right now." 
                : "You haven't completed any bookings yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}