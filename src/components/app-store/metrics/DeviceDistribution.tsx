
import { Card } from "@/components/ui/card";
import { Smartphone, Tablet, Monitor } from "lucide-react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";

interface DeviceDistributionProps {
  data: ProcessedAnalytics;
}

export function DeviceDistribution({ data }: DeviceDistributionProps) {
  // Extract device data if available
  const devices = data.geographical?.devices || [
    { type: "iPhone", count: 58970, percentage: 69.1 },
    { type: "iPad", count: 25620, percentage: 30.0 },
    { type: "iPod", count: 810, percentage: 0.9 }
  ];

  // Helper function to get the appropriate icon for a device type
  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'iphone':
        return <Smartphone className="h-4 w-4" />;
      case 'ipad':
        return <Tablet className="h-4 w-4" />;
      case 'desktop':
      case 'mac':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Smartphone className="h-4 w-4" />;
    }
  };

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4">Device Distribution</h3>
      <div className="space-y-4">
        {devices.map((device, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10">
              {getDeviceIcon(device.type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-white">{device.type}</span>
                <span className="text-sm text-white">{device.percentage}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${device.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
