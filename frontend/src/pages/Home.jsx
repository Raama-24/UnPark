import { Link } from "react-router-dom";
import { ArrowRight, Camera, BarChart3, AlertTriangle, Zap } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-background">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
    
    {/* Logo */}
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
        <Camera className="w-6 h-6 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold text-foreground">UnPark</span>
    </div>

    {/* Nav buttons */}
    <div className="flex items-center gap-3">
      <Link
        to="/dashboard"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        Dashboard
      </Link>

      <Link
        to="/live-feed"
        className="px-4 py-2 border border-border rounded-lg font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
      >
        Live Feed
      </Link>
    </div>

  </div>
</nav>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-6">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground leading-tight">
            Real-Time Parking
            <span className="text-primary"> Violation</span>
            <br />
            Monitoring System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Advanced AI-powered surveillance system that detects, tracks, and monitors parking violations in real-time. Get instant alerts and comprehensive violation reports.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Launch Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-border text-foreground rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-16 rounded-xl border border-border overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-b from-primary/5 to-transparent p-8">
            <div className="bg-card rounded-lg border border-border h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground font-medium">Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-foreground mb-16">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-secondary p-8 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Video Monitoring
              </h3>
              <p className="text-muted-foreground">
                Upload and analyze parking footage in real-time with advanced computer vision.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-secondary p-8 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Violation Detection
              </h3>
              <p className="text-muted-foreground">
                Automatically identify illegal parking and generate detailed violation reports.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-secondary p-8 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Live Analytics
              </h3>
              <p className="text-muted-foreground">
                Track vehicle counts, violation patterns, and urgency metrics in real-time.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-secondary p-8 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-info" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Instant Alerts
              </h3>
              <p className="text-muted-foreground">
                Receive immediate notifications for high-priority violations and urgent cases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-gradient-to-r from-primary to-primary rounded-2xl p-12 text-primary-foreground">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Monitor Parking Violations?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Start using our advanced monitoring system to detect and manage parking violations efficiently.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-foreground text-primary rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Access Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; 2024 ParkGuard. Real-time parking violation monitoring system.</p>
        </div>
      </footer>
    </div>
  );
}
