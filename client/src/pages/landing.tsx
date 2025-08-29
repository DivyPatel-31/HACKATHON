import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <i className="fas fa-wave-square text-primary-foreground text-xl"></i>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Coastal Threat Alert System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Monitor, analyze, and respond to coastal threats with real-time data, 
            AI-powered insights, and community collaboration.
          </p>
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            Access Dashboard
            <i className="fas fa-arrow-right ml-2"></i>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-primary text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time Alerts</h3>
              <p className="text-muted-foreground">
                Get instant notifications about storm surges, pollution, and other coastal threats
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-map-marked-alt text-secondary text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">Interactive Maps</h3>
              <p className="text-muted-foreground">
                Visualize threats on detailed coastal maps with real-time sensor data
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users text-accent text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">Community Reports</h3>
              <p className="text-muted-foreground">
                Enable communities to report and track environmental threats together
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
