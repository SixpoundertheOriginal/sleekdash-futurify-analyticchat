
import { Card } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface RetentionData {
  day: string;
  retention: number;
}

interface RetentionChartProps {
  retentionData: RetentionData[];
}

export function RetentionChart({ retentionData }: RetentionChartProps) {
  if (!retentionData || !Array.isArray(retentionData)) return null;

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-semibold text-white">User Retention</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={retentionData}>
              <XAxis
                dataKey="day"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="retention"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
