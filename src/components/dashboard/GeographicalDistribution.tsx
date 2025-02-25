
import { Card } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface GeoData {
  country: string;
  users: number;
}

interface GeographicalDistributionProps {
  geoData: GeoData[];
}

export function GeographicalDistribution({ geoData }: GeographicalDistributionProps) {
  if (!geoData || !Array.isArray(geoData)) return null;

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-semibold text-white">Geographical Distribution</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={geoData}>
              <XAxis
                dataKey="country"
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
              />
              <Tooltip />
              <Bar dataKey="users" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
