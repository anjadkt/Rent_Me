import { Routes, Route } from "react-router-dom";

import Auth from "./pages/Auth";
import Rentals from "./pages/Rental";
import Vehicles from "./pages/Vehicles";

import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/auth" element={<Auth />} />
      </Route>

      <Route path="/" element={<Vehicles />} />
      <Route path="/rentals" element={<Rentals />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        
      </Route>
    </Routes>
  );
}

export default App;