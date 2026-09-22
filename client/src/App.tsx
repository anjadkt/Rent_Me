import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Auth from "./pages/Auth";
import Rentals from "./pages/Rental";
import Vehicles from "./pages/Vehicles";

import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

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

        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          
        </Route>
      </Routes>
    </>
  );
}

export default App;