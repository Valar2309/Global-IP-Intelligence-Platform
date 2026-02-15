import { Routes, Route } from "react-router-dom";
import Dashboard from "./Page/Dashboard";
import Profile from "./Page/Profile";
import Register from "./Page/Register";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />     {/* Default page */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;
