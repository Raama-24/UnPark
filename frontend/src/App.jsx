import { Routes, Route } from "react-router-dom";
import Index from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import LiveFeed from "./pages/LiveFeed";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/live-feed" element={<LiveFeed />} />
    </Routes>
  );
}
