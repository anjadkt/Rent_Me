import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Auth from "./pages/Auth";
import Rentals from "./pages/Rental";
import Vehicles from "./pages/Vehicles";

import AdminVehicles from "./pages/admin/AdminVehicles";
import AdminRentals from "./pages/admin/AdminRentals";
import AdminUsers from "./pages/admin/AdminUsers";

import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import AdminLayout from "./components/layout/admin/AdminLayout";

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/auth" element={<Auth />} />
        </Route>

        {/* Customer Routes with Layout */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Vehicles />} />
          <Route path="/rentals" element={<Rentals />} />
        </Route>
          
        {/* Protected Admin Routes with AdminLayout */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/vehicles" element={<AdminVehicles />} />
            <Route path="/admin/rentals" element={<AdminRentals />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;