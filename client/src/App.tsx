import { Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Rentals from "./pages/Rental";
import Vehicles from "./pages/Vehicles";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Vehicles />} />
        <Route path="/rentals" element={<Rentals />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
  );
}

export default App;