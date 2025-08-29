import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import WaterLevelChart from "@/components/WaterLevelChart";
import ThreatDistributionChart from "@/components/ThreatDistributionChart";
import StatsOverview from "@/components/StatsOverview";

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>
      
      <StatsOverview />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterLevelChart />
        <ThreatDistributionChart />
      </div>
    </div>
  );
}
