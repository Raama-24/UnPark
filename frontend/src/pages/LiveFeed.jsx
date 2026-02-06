import { useState } from "react";
import { Camera, CircleDot , Link} from "lucide-react";

const cameras = [
  { id: "CAM_001", status: "Online" },
  { id: "CAM_002", status: "Offline" },
  { id: "Demo", status: "Online" },
];

export default function LiveFeed() {
  const [selectedCam, setSelectedCam] = useState(cameras[0]);

  return (
    <div className="min-h-screen bg-background text-foreground ">
      
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">

    {/* Logo */}
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
        <Camera className="w-6 h-6 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold text-primary">UnPark</span>
    </div>

    <h1 className="text-2xl font-bold text-foreground">
      LIVE FEED
    </h1>

    <div className="w-10" />
  </div>
</header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

      {/* Camera Selector */}
      <div className="mb-6 flex flex-wrap gap-3">
        {cameras.map((cam) => (
          <button
            key={cam.id}
            onClick={() => setSelectedCam(cam)}
            className={`px-4 py-2 rounded-lg border font-medium transition-all
              ${
                selectedCam.id === cam.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary"
              }`}
          >
            {cam.id}
          </button>
        ))}
      </div>

      {/* Camera Status */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <span className="font-medium">Status:</span>
        <span
          className={`px-2 py-1 rounded-md font-semibold
            ${
              selectedCam.status === "Online"
                ? "bg-success/10 text-success"
                : "bg-error/10 text-error"
            }`}
        >
          {selectedCam.status}
        </span>
      </div>

      {/* Live Video Feed */}
<div className="rounded-xl border border-border overflow-hidden bg-black shadow-lg max-w-4xl mx-auto">
  <div className="relative aspect-video flex items-center justify-center">
    
    <video
      src="/demo-feed.mp4"
      autoPlay
      loop
      muted
      className="w-full h-full object-cover"
    />



    {/* Overlay */}
    <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-md text-sm font-semibold">
      {selectedCam.id}
    </div>

  </div>
</div>
</main>
    </div>
    
  );
}