import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getVehicleById, type Vehicle } from "../../services/vehicles.service";
import { createRental, verifyPayment } from "../../services/rental.service";

interface VehicleDetailDrawerProps {
  vehicleId: string;
  onClose?: () => void;
}

export default function VehicleDetailDrawer({ vehicleId, onClose }: VehicleDetailDrawerProps) {
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [availability, setAvailability] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // Calendar State
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getVehicleById(vehicleId);
        if (mounted) {
          setVehicle(res.data.vehicle);
          setAvailability(res.data.availability);
          setCurrentImageIdx(0);
        }
      } catch (err: any) {
        if (mounted) setError(err.response?.data?.message || "Failed to load vehicle details");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (vehicleId) fetchDetails();
    return () => { mounted = false; };
  }, [vehicleId]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-6 relative max-h-[calc(100vh-3rem)] animate-pulse w-full min-h-[600px]">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 bg-slate-200 rounded-full" />
        </div>
        <div className="aspect-[16/10] bg-slate-200 rounded-xl" />
        <div className="flex justify-between items-center">
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="h-6 bg-slate-200 rounded w-1/4" />
        </div>
        <div className="h-48 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-6 relative max-h-[calc(100vh-3rem)]">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <p className="text-red-500 font-semibold text-center mt-10">{error || "Vehicle not found"}</p>
      </div>
    );
  }

  const currentImage = vehicle.images?.[currentImageIdx];
  const image = currentImage
    ? (typeof currentImage === 'string' ? currentImage : (currentImage as any).url)
    : "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop";

  // --- Calendar Logic ---
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const isDateOccupied = (date: Date) => {
    if (!availability?.occupiedDates) return false;
    const dateString = date.toISOString().split("T")[0];
    return availability.occupiedDates.some((d: string) => d.startsWith(dateString));
  };

  const isDateSelected = (date: Date) => {
    const time = date.getTime();
    return selectedDates.some(d => d.getTime() === time);
  };

  const toggleDate = (date: Date) => {
    if (isDateOccupied(date)) return;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    if (date < today) return;

    const time = date.getTime();
    if (isDateSelected(date)) {
      setSelectedDates(selectedDates.filter(d => d.getTime() !== time));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const isOccupied = isDateOccupied(date);
      const isSelected = isDateSelected(date);
      const isPast = date < today;

      let btnClass = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ";
      
      if (isPast) {
        btnClass += "text-slate-200 cursor-not-allowed";
      } else if (isOccupied) {
        btnClass += "bg-slate-100 text-slate-300 line-through cursor-not-allowed border border-slate-200/50";
      } else if (isSelected) {
        btnClass += "bg-amber-500 text-white shadow-md shadow-amber-500/30 hover:bg-amber-600 cursor-pointer transform hover:scale-110";
      } else {
        btnClass += "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer hover:border-amber-300";
      }

      days.push(
        <button key={`day-${i}`} onClick={() => toggleDate(date)} disabled={isPast || isOccupied} className={btnClass}>
          {i}
        </button>
      );
    }

    return (
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm w-full max-w-sm mx-auto">
        <div className="flex justify-between items-center mb-5">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition">
             &lt;
          </button>
          <span className="font-extrabold text-slate-800 text-sm tracking-wide">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition">
             &gt;
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center mb-3">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
            <span key={d} className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 place-items-center">
          {days}
        </div>
      </div>
    );
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBooking = async () => {
    if (!vehicle || selectedDates.length === 0) return;

    try {
      setIsBooking(true);
      
      const res = await createRental({
        vehicleId: vehicle._id,
        dates: selectedDates.map(d => d.toISOString())
      });
      
      const { rentalId, razorpay } = res.data;
      
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error("Failed to load payment gateway");
        setIsBooking(false);
        return;
      }
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_xxxxxxxxx", 
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: "Rent Ride",
        description: `Booking for ${vehicle.name}`,
        order_id: razorpay.orderId,
        handler: async function (response: any) {
          try {
            await verifyPayment(rentalId, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Payment successful! Booking confirmed.");
            if (onClose) onClose();
            // Navigate to rentals page instead of reloading
            navigate("/rentals");
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        theme: {
          color: "#f59e0b",
        },
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(response.error.description || "Payment failed");
      });
      rzp.open();
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to initiate booking");
    } finally {
      setIsBooking(false);
    }
  };

  // -------------------------

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg flex flex-col relative max-h-[calc(100vh-3rem)] overflow-hidden">
      <div className="p-6 overflow-y-auto scrollbar-hide flex-1 space-y-6 pb-28">
        {/* Top Header Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="font-bold text-slate-800 text-sm tracking-tight">Vehicle Details</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition bg-slate-50 hover:bg-slate-100 p-2 rounded-full">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Images */}
        <div className="w-full lg:w-2/5 space-y-3">
          {/* Main Image */}
          <div className="aspect-[4/3] flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden shadow-sm border border-slate-100">
            <img src={image} alt={vehicle.name} className="w-full h-full object-cover rounded-xl" />
          </div>

          {/* Thumbnails Gallery */}
          {vehicle.images && vehicle.images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {vehicle.images.map((img, idx) => {
                const thumbUrl = typeof img === 'string' ? img : (img as any).url;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIdx(idx)}
                    className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      idx === currentImageIdx ? "border-amber-500 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={thumbUrl} alt={`${vehicle.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="w-full lg:w-3/5 space-y-5">
          {/* Header: Name, Brand, Model | Price/Day */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {vehicle.name}
              </h2>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 block">
                {vehicle.brand} • {vehicle.category.replace('_', ' ')}
              </span>
            </div>
            <div className="text-right bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100/50">
              <span className="text-xl font-black text-amber-500">₹{vehicle.pricePerDay}</span>
              <span className="text-[9px] text-amber-600/70 font-bold uppercase tracking-wider"> / day</span>
            </div>
          </div>

          {/* Price & Security Deposit */}
          <div className="flex gap-3">
            <div className="bg-amber-50/30 rounded-xl p-3 border border-amber-100/50 flex-1">
              <span className="text-[9px] text-amber-600/70 font-bold uppercase tracking-wider block mb-0.5">Daily Rent</span>
              <span className="text-lg font-extrabold text-amber-600">₹{vehicle.pricePerDay}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Security Deposit</span>
              <span className="text-lg font-extrabold text-slate-700">₹{(vehicle as any).securityDeposit || 0}</span>
            </div>
          </div>

          {/* Specifications */}
          {vehicle.specifications && Object.keys(vehicle.specifications).length > 0 && (
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Specifications
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {Object.entries(vehicle.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-bold text-slate-800 text-xs">{value as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {vehicle.description && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Description
              </span>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {vehicle.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Divider */}
      <hr className="border-t border-slate-100 my-0" />

      {/* Booking Section: Calendar + Breakdown */}
      <div className="flex flex-col lg:flex-row gap-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
        
        {/* Left: Calendar */}
        <div className="w-full lg:w-1/2">
           <div className="mb-4">
             <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Select Dates</h3>
             <p className="text-[10px] text-slate-500 font-medium">Pick the days you want to book</p>
           </div>
           {renderCalendar()}
        </div>

        {/* Right: Price Breakdown */}
        <div className="w-full lg:w-1/2 flex flex-col justify-start pt-1">
           <h3 className="text-sm font-extrabold text-slate-900 mb-4">Price Breakdown</h3>
           
           <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center text-xs text-slate-600 font-bold">
               <span>₹{vehicle.pricePerDay} × {selectedDates.length || 0} days</span>
               <span>₹{vehicle.pricePerDay * (selectedDates.length || 0)}</span>
             </div>
             
             <div className="flex justify-between items-center text-xs text-slate-600 font-bold pb-4 border-b border-slate-100">
               <span>Security Deposit</span>
               <span>₹{(vehicle as any).securityDeposit || 0}</span>
             </div>

             <div className="flex justify-between items-center pt-1">
               <span className="text-sm font-extrabold text-slate-900">Total to pay</span>
               <span className="text-xl font-black text-amber-500">
                 ₹{(vehicle.pricePerDay * (selectedDates.length || 0)) + ((vehicle as any).securityDeposit || 0)}
               </span>
             </div>
           </div>
        </div>

      </div>
      
      </div> {/* End of scrollable content */}

      {/* Sticky Footer CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-4 px-6 bg-white border-t border-slate-100 flex items-center justify-between z-10 rounded-b-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <div>
            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Amount</span>
            <span className="text-2xl font-black text-slate-900">
              ₹{(vehicle.pricePerDay * (selectedDates.length || 0)) + ((vehicle as any).securityDeposit || 0)}
            </span>
          </div>
          <button 
            onClick={handleBooking}
            className={`px-8 py-3.5 font-black text-sm rounded-xl transition shadow-md ${
              selectedDates.length > 0 && !isBooking
                ? "bg-amber-400 hover:bg-amber-500 text-slate-900 shadow-amber-400/20" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
            disabled={selectedDates.length === 0 || isBooking}
          >
            {isBooking ? "Processing..." : selectedDates.length > 0 ? "Continue Booking" : "Select Dates"}
          </button>
      </div>

    </div>
  );
}