import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ThemeProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    critical: true,
    medium: true,
    low: false
  });

  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "UTC",
    units: "metric",
    autoRefresh: true,
    mapStyle: "default"
  });

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

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Settings Updated",
      description: "Notification preferences have been saved.",
    });
  };

  const handlePreferenceChange = (key: string, value: string | boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Settings Updated", 
      description: "Your preferences have been saved.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export will be ready shortly.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                value={user?.email || ""}
                disabled
                data-testid="input-email"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" data-testid="badge-user-role">
                  {user?.role || "fisherfolk"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName"
                value={user?.firstName || ""}
                placeholder="Enter first name"
                data-testid="input-first-name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName"
                value={user?.lastName || ""}
                placeholder="Enter last name"
                data-testid="input-last-name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
            </div>
            <Select value={theme} onValueChange={(value: "light" | "dark") => setTheme(value)}>
              <SelectTrigger className="w-32" data-testid="select-theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Map Style</Label>
              <p className="text-sm text-muted-foreground">Select map appearance</p>
            </div>
            <Select 
              value={preferences.mapStyle} 
              onValueChange={(value) => handlePreferenceChange("mapStyle", value)}
            >
              <SelectTrigger className="w-32" data-testid="select-map-style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="terrain">Terrain</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts via email</p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                data-testid="switch-email-notifications"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>SMS Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
              </div>
              <Switch
                checked={notifications.sms}
                onCheckedChange={(checked) => handleNotificationChange("sms", checked)}
                data-testid="switch-sms-notifications"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Browser push notifications</p>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                data-testid="switch-push-notifications"
              />
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-base">Alert Severity Levels</Label>
            <p className="text-sm text-muted-foreground mb-4">Choose which alert levels to receive</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive">Critical</Badge>
                  <span className="text-sm">Emergency situations</span>
                </div>
                <Switch
                  checked={notifications.critical}
                  onCheckedChange={(checked) => handleNotificationChange("critical", checked)}
                  data-testid="switch-critical-alerts"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-warning text-black">Medium</Badge>
                  <span className="text-sm">Important updates</span>
                </div>
                <Switch
                  checked={notifications.medium}
                  onCheckedChange={(checked) => handleNotificationChange("medium", checked)}
                  data-testid="switch-medium-alerts"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Low</Badge>
                  <span className="text-sm">General information</span>
                </div>
                <Switch
                  checked={notifications.low}
                  onCheckedChange={(checked) => handleNotificationChange("low", checked)}
                  data-testid="switch-low-alerts"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Language</Label>
              <Select 
                value={preferences.language} 
                onValueChange={(value) => handlePreferenceChange("language", value)}
              >
                <SelectTrigger data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Timezone</Label>
              <Select 
                value={preferences.timezone} 
                onValueChange={(value) => handlePreferenceChange("timezone", value)}
              >
                <SelectTrigger data-testid="select-timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern Time</SelectItem>
                  <SelectItem value="PST">Pacific Time</SelectItem>
                  <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Units</Label>
              <Select 
                value={preferences.units} 
                onValueChange={(value) => handlePreferenceChange("units", value)}
              >
                <SelectTrigger data-testid="select-units">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric</SelectItem>
                  <SelectItem value="imperial">Imperial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Refresh</Label>
                <p className="text-sm text-muted-foreground">Automatically update data</p>
              </div>
              <Switch
                checked={preferences.autoRefresh}
                onCheckedChange={(checked) => handlePreferenceChange("autoRefresh", checked)}
                data-testid="switch-auto-refresh"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Export Data</Label>
              <p className="text-sm text-muted-foreground">Download your data and reports</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleExportData}
              data-testid="button-export-data"
            >
              <i className="fas fa-download mr-2"></i>
              Export
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-destructive">Delete Account</Label>
              <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              data-testid="button-delete-account"
            >
              <i className="fas fa-trash mr-2"></i>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
