import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/analytics/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Active Alerts",
      value: stats?.activeAlerts || 0,
      icon: "fa-exclamation-triangle",
      color: "destructive",
      change: "+3",
      changeText: "from last hour",
      testId: "stat-active-alerts"
    },
    {
      title: "Sensors Online",
      value: stats?.sensorsOnline || 0,
      icon: "fa-satellite-dish",
      color: "success",
      change: "98.9%",
      changeText: "uptime",
      testId: "stat-sensors-online"
    },
    {
      title: "Water Level",
      value: "2.3m",
      icon: "fa-water",
      color: "warning",
      change: "+0.5m",
      changeText: "above normal",
      testId: "stat-water-level"
    },
    {
      title: "Community Reports",
      value: stats?.totalReports || 0,
      icon: "fa-users",
      color: "primary",
      change: "+5",
      changeText: "today",
      testId: "stat-community-reports"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold" data-testid={stat.testId}>{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}/10 rounded-full flex items-center justify-center`}>
                <i className={`fas ${stat.icon} text-${stat.color}`}></i>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`text-${stat.color}`}>{stat.change}</span>
              <span className="text-muted-foreground ml-1">{stat.changeText}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
