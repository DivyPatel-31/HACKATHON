import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function ThreatDistributionChart() {
  const { data: distributionData, isLoading, refetch } = useQuery({
    queryKey: ["/api/analytics/threat-distribution"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Threat Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const COLORS = [
    'hsl(var(--destructive))',
    'hsl(var(--warning))', 
    'hsl(var(--primary))',
    'hsl(var(--success))'
  ];

  const chartData = distributionData?.labels?.map((label: string, index: number) => ({
    name: label,
    value: distributionData.values[index],
  })) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Threat Distribution</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => refetch()}
            data-testid="button-refresh-threat-data"
          >
            <i className="fas fa-sync-alt"></i>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Percentage']}
              />
              <Legend 
                verticalAlign="bottom"
                height={36}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
