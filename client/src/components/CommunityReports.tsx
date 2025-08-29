import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import ReportModal from "./ReportModal";
import { formatDistanceToNow } from "date-fns";

export default function CommunityReports() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: reports, isLoading } = useQuery({
    queryKey: ["/api/reports"],
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

  const getAuthorInitials = (userId: string) => {
    // Mock initials from user ID
    return userId.slice(-2).toUpperCase();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Community Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Community Reports</CardTitle>
            <Button 
              onClick={() => setIsModalOpen(true)}
              data-testid="button-submit-report"
            >
              <i className="fas fa-plus mr-2"></i>
              Submit Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports && reports.length > 0 ? (
              reports.slice(0, 6).map((report: any) => (
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
                      <Badge variant={getTypeColor(report.type) as any}>
                        {report.type}
                      </Badge>
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
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <i className="fas fa-comments text-2xl mb-2"></i>
                <p>No community reports yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <ReportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
