import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: "fa-tachometer-alt", label: "Dashboard" },
    { path: "/threat-map", icon: "fa-map-marked-alt", label: "Threat Map" },
    { path: "/alerts", icon: "fa-exclamation-triangle", label: "Active Alerts" },
    { path: "/analytics", icon: "fa-chart-line", label: "Analytics" },
    { path: "/reports", icon: "fa-comments", label: "Community Reports" },
    { path: "/settings", icon: "fa-cog", label: "Settings" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "w-64 bg-sidebar border-r border-sidebar-border p-4 sidebar-transition fixed lg:relative z-40 h-full lg:h-auto",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={location === item.path ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left",
                location === item.path 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              onClick={() => {
                setLocation(item.path);
                onClose();
              }}
              data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
            >
              <i className={`fas ${item.icon} mr-3`}></i>
              {item.label}
            </Button>
          ))}
        </nav>
      </aside>
    </>
  );
}
