import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

declare global {
  interface Window {
    L: any;
  }
}

export default function ThreatMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts/active"],
  });

  const { data: sensors } = useQuery({
    queryKey: ["/api/sensors"],
  });

  useEffect(() => {
    // Load Leaflet CSS and JS
    const loadLeaflet = async () => {
      if (window.L) return;
      
      // Load CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      document.head.appendChild(script);

      return new Promise((resolve) => {
        script.onload = resolve;
      });
    };

    loadLeaflet().then(() => {
      if (mapRef.current && !mapInstanceRef.current && window.L) {
        // Initialize map
        mapInstanceRef.current = window.L.map(mapRef.current).setView([40.7128, -74.0060], 10);
        
        // Add tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);

        updateMapMarkers();
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    updateMapMarkers();
  }, [alerts, sensors, selectedFilter]);

  const updateMapMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear existing markers
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer instanceof window.L.CircleMarker) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Add alert markers
    alerts?.forEach((alert: any) => {
      if (selectedFilter !== "all" && !alert.type.includes(selectedFilter.toLowerCase())) {
        return;
      }

      if (!alert.latitude || !alert.longitude) return;

      const color = alert.severity === 'critical' ? '#ef4444' : 
                   alert.severity === 'high' ? '#f97316' : 
                   alert.severity === 'medium' ? '#eab308' : '#22c55e';
      
      const marker = window.L.circleMarker([parseFloat(alert.latitude), parseFloat(alert.longitude)], {
        radius: 8,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.6,
        className: 'threat-marker'
      }).addTo(mapInstanceRef.current);

      marker.bindPopup(`
        <div class="p-2">
          <h4 class="font-semibold">${alert.title}</h4>
          <p class="text-sm">Severity: ${alert.severity}</p>
          <p class="text-sm">Type: ${alert.type}</p>
          <p class="text-sm">Location: ${alert.location}</p>
        </div>
      `);
    });

    // Add sensor markers
    sensors?.forEach((sensor: any) => {
      if (!sensor.latitude || !sensor.longitude) return;

      const marker = window.L.circleMarker([parseFloat(sensor.latitude), parseFloat(sensor.longitude)], {
        radius: 6,
        fillColor: sensor.isActive ? '#22c55e' : '#ef4444',
        color: sensor.isActive ? '#22c55e' : '#ef4444',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.6,
      }).addTo(mapInstanceRef.current);

      marker.bindPopup(`
        <div class="p-2">
          <h4 class="font-semibold">${sensor.name}</h4>
          <p class="text-sm">Type: ${sensor.type}</p>
          <p class="text-sm">Status: ${sensor.isActive ? 'Online' : 'Offline'}</p>
          <p class="text-sm">Last Value: ${sensor.lastValue || 'N/A'}</p>
        </div>
      `);
    });
  };

  const filterButtons = [
    { value: "all", label: "All" },
    { value: "storm", label: "Storm" },
    { value: "pollution", label: "Pollution" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Coastal Threat Map</CardTitle>
          <div className="flex items-center space-x-2">
            {filterButtons.map((button) => (
              <Button
                key={button.value}
                variant={selectedFilter === button.value ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedFilter(button.value)}
                data-testid={`filter-${button.value}`}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapRef} 
          className="h-96 bg-muted rounded-md"
          data-testid="threat-map"
        />
      </CardContent>
    </Card>
  );
}
