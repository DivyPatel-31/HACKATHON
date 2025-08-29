import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function RecentAlerts() {
  const [, setLocation] = useLocation();
  
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["/api/alerts/active"],
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'primary';
      default: return 'secondary';
    }
  };

  const getSeverityDotColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive';
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-primary';
      default: return 'bg-secondary';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Alerts</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation("/alerts")}
            data-testid="button-view-all-alerts"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts && alerts.length > 0 ? (
            alerts.slice(0, 4).map((alert: any) => (
              <div 
                key={alert.id}
                className="flex items-start space-x-3 p-3 rounded-lg border"
                data-testid={`alert-${alert.id}`}
              >
                <div className={`w-2 h-2 ${getSeverityDotColor(alert.severity)} rounded-full mt-2 flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.location}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <Badge variant={getSeverityColor(alert.severity) as any}>
                  {alert.severity}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <i className="fas fa-shield-alt text-2xl mb-2"></i>
              <p>No active alerts</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
