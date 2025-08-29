import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatDistanceToNow } from "date-fns";

export default function AlertsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/alerts"],
    enabled: isAuthenticated,
  });

  const resolveMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await apiRequest("PATCH", `/api/alerts/${alertId}/resolve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/active"] });
      toast({
        title: "Alert Resolved",
        description: "The alert has been marked as resolved.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to resolve alert. Please try again.",
        variant: "destructive",
      });
    },
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

  if (isLoading || alertsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Alert Management</h1>
      </div>
      
      <div className="space-y-4">
        {alerts && alerts.length > 0 ? (
          alerts.map((alert: any) => (
            <Card key={alert.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <Badge variant={getSeverityColor(alert.severity) as any}>
                        {alert.severity}
                      </Badge>
                      <h3 className="text-lg font-semibold" data-testid={`alert-title-${alert.id}`}>
                        {alert.title}
                      </h3>
                      <Badge variant={alert.isActive ? "default" : "secondary"}>
                        {alert.isActive ? "Active" : "Resolved"}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground">{alert.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        {alert.location}
                      </span>
                      <span>
                        <i className="fas fa-clock mr-1"></i>
                        {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                      </span>
                      <span>
                        <i className="fas fa-tag mr-1"></i>
                        {alert.type.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  
                  {alert.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resolveMutation.mutate(alert.id)}
                      disabled={resolveMutation.isPending}
                      data-testid={`button-resolve-${alert.id}`}
                    >
                      {resolveMutation.isPending ? (
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                      ) : (
                        <i className="fas fa-check mr-2"></i>
                      )}
                      Resolve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <i className="fas fa-shield-alt text-4xl text-muted-foreground mb-4"></i>
              <h3 className="text-lg font-semibold mb-2">No Alerts</h3>
              <p className="text-muted-foreground">All systems are operating normally.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
