import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (role: string) => {
      await apiRequest("PATCH", "/api/auth/user/role", { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Role Updated",
        description: "Your role has been updated successfully.",
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
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    },
  });

  const unreadNotifications = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead) : [];

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getDisplayName = (firstName?: string | null, lastName?: string | null, email?: string | null) => {
    if (firstName || lastName) {
      return `${firstName || ""} ${lastName || ""}`.trim();
    }
    return email || "User";
  };

  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onToggleSidebar}
          data-testid="button-toggle-sidebar"
        >
          <i className="fas fa-bars"></i>
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <i className="fas fa-wave-square text-primary-foreground text-sm"></i>
          </div>
          <h1 className="text-xl font-bold text-foreground">Coastal Threat Alert System</h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Role Selector */}
        <Select
          value={user?.role || "fisherfolk"}
          onValueChange={updateRoleMutation.mutate}
          disabled={updateRoleMutation.isPending}
        >
          <SelectTrigger className="w-32" data-testid="select-role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="government">Government</SelectItem>
            <SelectItem value="ngo">NGO</SelectItem>
            <SelectItem value="fisherfolk">Fisherfolk</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          data-testid="button-notifications"
        >
          <i className="fas fa-bell"></i>
          {unreadNotifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse"></span>
          )}
        </Button>
        
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          data-testid="button-theme-toggle"
        >
          <i className={`fas ${theme === "light" ? "fa-moon" : "fa-sun"}`}></i>
        </Button>
        
        {/* User Menu */}
        <div className="flex items-center space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
              {getInitials(user?.firstName, user?.lastName)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:inline" data-testid="text-username">
            {getDisplayName(user?.firstName, user?.lastName, user?.email)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = "/api/logout"}
            data-testid="button-logout"
          >
            <i className="fas fa-sign-out-alt"></i>
          </Button>
        </div>
      </div>
    </header>
  );
}
