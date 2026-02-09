import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  Play,
  AlertTriangle,
  TrendingUp,
  Clock,
  MapPin,
  AlertCircle,
  Download,
  Camera,
} from "lucide-react";
import { useRef } from "react";

// Helper functions for colors
const getUrgencyColor = (urgency) => {
  if (urgency >= 8) return "text-error bg-error/10";
  if (urgency >= 6) return "text-warning bg-warning/10";
  return "text-success bg-success/10";
};

const getStatusColor = (status) => {
  switch (status) {
    case "Critical":
      return "bg-error/20 text-error border-error/30";
    case "High":
      return "bg-warning/20 text-warning border-warning/30";
    case "Medium":
      return "bg-info/20 text-info border-info/30";
    case "Low":
      return "bg-success/20 text-success border-success/30";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [violations, setViolations] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [processedFilename, setProcessedFilename] = useState("");

  const videoRef = useRef(null);

  const handleVideoUpload = (e) => {
    if (e.target.files?.[0]) setVideoFile(e.target.files[0]);
  };

  const startAnalysis = async () => {
  if (!videoFile) {
    alert("Upload a video first");
    return;
  }

  setLoading(true);

  const formData = new FormData();
  formData.append("file", videoFile);

  console.log("📤 Sending video:", videoFile.name);

  try {
    const res = await fetch("http://localhost:8000/upload", {
      method: "POST",
      body: formData,
    });

    console.log("📡 Response status:", res.status);

    // 🔴 Backend failed (500 / CORS / crash)
    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Backend error response:", errorText);
      alert("Backend error. Check backend terminal.");
      return;
    }

    const data = await res.json();
    console.log("✅ Backend JSON:", data);

    // Defensive checks
    if (!data.stats || !data.output_url) {
      console.error("❌ Invalid response shape:", data);
      alert("Invalid response from backend");
      return;
    }

    const filename = data.output_url.split("/").pop();
    setProcessedFilename(filename);
    setVideoUrl(`http://localhost:8000${data.output_url}`);


    setStats(data.stats);
    setViolations(data.stats.violations ?? []);
    setVideoUrl(`http://localhost:8000${data.output_url}`);

    console.log("🎥 Video URL set:", `http://localhost:8000${data.output_url}`);
  } catch (err) {
    console.error("🔥 Fetch crashed:", err);
    alert("Server not reachable / CORS issue");
  } finally {
    setLoading(false); // ✅ ALWAYS runs
  }
};


  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">UnPark</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            Monitoring Dashboard
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Upload Section */}
        <section className="bg-card rounded-xl border border-border p-8 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Video Input
          </h2>

          <div className="space-y-4">
            <label className="block">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                {videoFile ? (
                  <div className="flex items-center gap-3 justify-center">
                    <Play className="w-6 h-6 text-success" />
                    <div className="text-left">
                      <p className="font-medium text-foreground">
                        {videoFile.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-foreground font-medium">
                      Drag and drop your video or click to select
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Supported formats: MP4, AVI, MOV (Max 500MB)
                    </p>
                  </div>
                )}
              </div>
            </label>

            <div className="flex gap-3">
              <button
                onClick={startAnalysis}
                disabled={loading}
                className="flex-1 bg-primary text-primary-foreground rounded-lg py-3 font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play className="w-5 h-5" />
                {loading ? "Analyzing..." : "Start Analysis"}
              </button>

              <button className="px-6 py-3 border border-border rounded-lg font-medium text-foreground hover:bg-card transition-colors">
                Use Sample Feed
              </button>
            </div>
          </div>
        </section>

        {/* Video Player & Statistics */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="bg-black aspect-video flex items-center justify-center relative">
                {processedFilename ? (
  <a
    href={`http://localhost:8000/download/${encodeURIComponent(processedFilename)}`}
    className="bg-primary text-primary-foreground rounded-lg py-3 px-6 font-medium hover:opacity-90 transition-opacity"
  >
    <Download className="w-5 h-5 inline mr-2" />
    Download Processed Video
  </a>
) : (
  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center">
    <Camera className="w-16 h-16 text-gray-700 mb-4" />
    <p className="text-gray-400 font-medium">
      Upload & analyze a video
    </p>
  </div>
)}
              </div>

            
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-4">
            {/* Camera Info */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Camera Info
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Camera ID</p>
                  <p className="font-mono font-semibold text-foreground">
                    {stats ? stats.camera_id || "CAM_002" : "--"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Location
                  </p>
                  <p className="font-medium text-foreground text-sm">
                    {stats ? stats.location || "Unknown Location" : "--"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">
                    Total Vehicles
                  </p>
                  <TrendingUp className="w-4 h-4 text-info" />
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {stats ? stats.total_vehicles : "--"}
                </p>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">
                    Active Violations
                  </p>
                  <AlertTriangle className="w-4 h-4 text-warning" />
                </div>
                <p className="text-3xl font-bold text-warning">
                  {stats ? stats.illegal_vehicles : "--"}
                </p>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">
                    Highest Urgency
                  </p>
                  <AlertCircle className="w-4 h-4 text-error" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-error">
                    {stats ? stats.max_urgency : "--"}
                  </p>
                  <p className="text-sm text-muted-foreground">/10</p>
                </div>
                <div className="w-full bg-border rounded-full h-2 mt-2">
                  <div
                    className="bg-error h-2 rounded-full"
                    style={{
                      width: stats
                        ? `${(stats.max_urgency / 10) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-success/10 border border-success/30 rounded-xl p-4 flex items-center gap-3">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <div>
                <p className="font-semibold text-success">System Active</p>
                <p className="text-xs text-success/70">Real-time monitoring</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Violation Log
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">
                    License Plate
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">
                    <Clock className="w-4 h-4 inline mr-2" /> Timestamp
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">
                    Urgency
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4 inline mr-2" /> Location
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                {violations.map((v, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-border hover:bg-secondary cursor-pointer transition-colors ${
                      selectedViolation === idx ? "bg-primary/10" : ""
                    }`}
                    onClick={() => setSelectedViolation(idx)}
                  >
                    <td className="py-4 px-4 font-mono font-semibold">
                      {v.vehicle_id}
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {v.timestamp}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full ${getUrgencyColor(
                          v.urgency
                        )}`}
                      >
                        {v.urgency}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-lg border ${getStatusColor(
                          v.status
                        )}`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm">{v.location}</td>
                    <td className="py-4 px-4 font-medium">{v.duration}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Showing {violations.length} violations
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          <p>
            &copy; 2026 Unpark. Real-time parking violation monitoring system.
          </p>
        </div>
      </footer>
    </div>
  );
}
