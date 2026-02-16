import { Routes, Route } from "react-router-dom";
import LandingPage from "./Page/LandingPage";
import Dashboard from "./Page/Dashboard";
import Profile from "./Page/Profile";
import Register from "./Page/Register";

function App() {
  return (
    <Routes>

      {/* Landing Page Default */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />

    </Routes>
  );
}

export default App;
