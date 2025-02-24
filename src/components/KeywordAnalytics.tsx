
import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Star, Search } from "lucide-react";

interface KeywordMetric {
  keyword: string;
  volume: number;
  difficulty: number;
  kei: number;
  growth: number;
}

const sampleKeywordData: KeywordMetric[] = [
  { keyword: "reading apps for kids", volume: 100, difficulty: 45, kei: 35, growth: 15 },
  { keyword: "sight words", volume: 38, difficulty: 3, kei: 40, growth: 5 },
  { keyword: "books for kids", volume: 85, difficulty: 30, kei: 28, growth: 10 },
  { keyword: "phonics for kids", volume: 65, difficulty: 25, kei: 32, growth: 8 },
  { keyword: "reading games for kids", volume: 29, difficulty: 15, kei: 38, growth: 20 },
];

const COLORS = ['#9b87f5', '#D6BCFA', '#7F9CF5', '#B794F4', '#9F7AEA'];

export function KeywordAnalytics() {
  const opportunityKeywords = sampleKeywordData
    .filter(k => k.difficulty < 20 && k.volume > 30)
    .sort((a, b) => b.kei - a.kei);

  const volumeData = sampleKeywordData
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  const difficultyDistribution = [
    { name: 'Easy (0-20)', value: sampleKeywordData.filter(k => k.difficulty <= 20).length },
    { name: 'Medium (21-50)', value: sampleKeywordData.filter(k => k.difficulty > 20 && k.difficulty <= 50).length },
    { name: 'Hard (51-100)', value: sampleKeywordData.filter(k => k.difficulty > 50).length },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Top Keywords by Volume
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                <YAxis dataKey="keyword" type="category" stroke="rgba(255,255,255,0.5)" width={150} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="volume" fill="#9b87f5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Keyword Growth Trends
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sampleKeywordData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="keyword" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Line type="monotone" dataKey="growth" stroke="#9b87f5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Difficulty Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {difficultyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Top Opportunities</h3>
          <div className="space-y-4">
            {opportunityKeywords.map((keyword, index) => (
              <div key={index} className="p-4 rounded-lg bg-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{keyword.keyword}</span>
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    KEI: {keyword.kei}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span className="flex items-center gap-1">
                    <Search className="h-4 w-4" />
                    Volume: {keyword.volume}
                  </span>
                  <span className="flex items-center gap-1">
                    {keyword.growth > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    Growth: {keyword.growth}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
