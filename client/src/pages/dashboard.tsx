import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import StatsOverview from "@/components/StatsOverview";
import ThreatMap from "@/components/ThreatMap";
import RecentAlerts from "@/components/RecentAlerts";
import WaterLevelChart from "@/components/WaterLevelChart";
import ThreatDistributionChart from "@/components/ThreatDistributionChart";
import CommunityReports from "@/components/CommunityReports";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts/active"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const criticalAlerts = alerts?.filter((alert: any) => alert.severity === "critical") || [];

  return (
    <div className="space-y-6">
      {/* Critical Alert Banner */}
      {criticalAlerts.length > 0 && (
        <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded-lg flex items-center space-x-3 alert-pulse">
          <i className="fas fa-exclamation-triangle"></i>
          <div>
            <div className="font-medium">{criticalAlerts[0].title}</div>
            <div className="text-sm opacity-90">{criticalAlerts[0].description}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-destructive-foreground hover:bg-destructive/80"
            data-testid="button-dismiss-alert"
          >
            <i className="fas fa-times"></i>
          </Button>
        </div>
      )}

      {/* Stats Overview */}
      <StatsOverview />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <div className="lg:col-span-2">
          <ThreatMap />
        </div>

        {/* Recent Alerts */}
        <RecentAlerts />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterLevelChart />
        <ThreatDistributionChart />
      </div>

      {/* Community Reports */}
      <CommunityReports />
    </div>
  );
}
