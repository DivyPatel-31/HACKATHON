import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportModal from "@/components/ReportModal";
import { formatDistanceToNow } from "date-fns";

export default function ReportsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const { data: allReports, isLoading: allReportsLoading } = useQuery({
    queryKey: ["/api/reports"],
    enabled: isAuthenticated,
  });

  const { data: myReports, isLoading: myReportsLoading } = useQuery({
    queryKey: ["/api/reports/mine"],
    enabled: isAuthenticated,
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pollution': return 'warning';
      case 'erosion': return 'destructive';
      case 'wildlife': return 'success';
      case 'storm': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'success';
      case 'resolved': return 'secondary';
      case 'dismissed': return 'muted';
      default: return 'warning';
    }
  };

  const getAuthorInitials = (userId: string) => {
    return userId.slice(-2).toUpperCase();
  };

  const ReportGrid = ({ reports, loading }: { reports: any[], loading: boolean }) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      );
    }

    if (!reports || reports.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <i className="fas fa-comments text-4xl mb-4"></i>
          <h3 className="text-lg font-semibold mb-2">No Reports</h3>
          <p>No community reports found.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report: any) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                      {getAuthorInitials(report.userId)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">User {report.userId.slice(-4)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <Badge variant={getTypeColor(report.type) as any}>
                    {report.type}
                  </Badge>
                  <Badge variant={getStatusColor(report.status) as any} className="text-xs">
                    {report.status}
                  </Badge>
                </div>
              </div>
              
              {report.imageUrl && (
                <img 
                  src={report.imageUrl} 
                  alt={report.title}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              )}
              
              <h3 className="text-sm font-medium mb-2">{report.title}</h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {report.description}
              </p>
              <p className="text-xs text-muted-foreground flex items-center">
                <i className="fas fa-map-marker-alt mr-1"></i>
                {report.location}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Community Reports</h1>
          <Button onClick={() => setIsModalOpen(true)} data-testid="button-new-report">
            <i className="fas fa-plus mr-2"></i>
            New Report
          </Button>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all-reports">All Reports</TabsTrigger>
            <TabsTrigger value="mine" data-testid="tab-my-reports">My Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <ReportGrid reports={allReports || []} loading={allReportsLoading} />
          </TabsContent>
          
          <TabsContent value="mine">
            <ReportGrid reports={myReports || []} loading={myReportsLoading} />
          </TabsContent>
        </Tabs>
      </div>
      
      <ReportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
