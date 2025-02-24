
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, TrendingDown, Star, Search, ChartBar, Target, Award } from "lucide-react";

interface KeywordMetric {
  keyword: string;
  volume: number;
  difficulty: number;
  kei: number;
  relevancy: number;
  chance: number;
  growth: number;
}

const keywordData: KeywordMetric[] = [
  { keyword: "books for kids", volume: 45, difficulty: 20, kei: 73, relevancy: 85, chance: 45, growth: 15 },
  { keyword: "reading apps for kids", volume: 35, difficulty: 15, kei: 45, relevancy: 90, chance: 50, growth: 12 },
  { keyword: "reading apps for kids for free", volume: 30, difficulty: 5, kei: 27, relevancy: 88, chance: 55, growth: 8 },
  { keyword: "reading games for kids", volume: 39, difficulty: 2, kei: 62, relevancy: 92, chance: 65, growth: 20 },
  { keyword: "hooked on phonics", volume: 25, difficulty: 10, kei: 30, relevancy: 75, chance: 40, growth: 5 },
  { keyword: "reading eggs", volume: 24, difficulty: 8, kei: 28, relevancy: 80, chance: 45, growth: 10 },
  { keyword: "free kids books", volume: 28, difficulty: 6, kei: 32, relevancy: 78, chance: 48, growth: 15 },
  { keyword: "learn to read for kids free", volume: 22, difficulty: 3, kei: 26, relevancy: 86, chance: 52, growth: 18 },
  { keyword: "kids reading app", volume: 20, difficulty: 5, kei: 24, relevancy: 89, chance: 50, growth: 22 }
];

const COLORS = ['#9b87f5', '#D6BCFA', '#7F9CF5', '#B794F4', '#9F7AEA'];

export function KeywordAnalytics() {
  const [activeTab, setActiveTab] = useState('opportunity');

  // Calculate additional metrics
  const processedData = keywordData.map(item => ({
    ...item,
    opportunityScore: (item.kei * item.chance / Math.max(1, item.difficulty)) * 10
  }));

  const sortedByOpportunity = [...processedData].sort((a, b) => b.opportunityScore - a.opportunityScore);
  const topOpportunities = sortedByOpportunity.slice(0, 5);
  
  const avgVolume = Math.round(keywordData.reduce((sum, item) => sum + item.volume, 0) / keywordData.length);
  const avgDifficulty = Math.round(keywordData.reduce((sum, item) => sum + item.difficulty, 0) / keywordData.length);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 p-3 border border-primary/20 shadow-lg rounded-md">
          <p className="font-bold text-primary">{data.keyword}</p>
          <p className="text-sm">Volume: <span className="text-white">{data.volume}</span></p>
          <p className="text-sm">Difficulty: <span className="text-white">{data.difficulty}</span></p>
          <p className="text-sm">KEI: <span className="text-white">{data.kei}</span></p>
          <p className="text-sm">Relevancy: <span className="text-white">{data.relevancy}</span></p>
          <p className="text-sm">Chance: <span className="text-white">{data.chance}%</span></p>
          {data.opportunityScore && 
            <p className="text-sm">Opportunity: <span className="text-green-400">{(data.opportunityScore/10).toFixed(1)}</span></p>
          }
        </div>
      );
    }
    return null;
  };

  const getColor = (score: number) => {
    if (score > 60) return "#4ade80";
    if (score > 30) return "#fb923c";
    return "#f87171";
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Metric Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 bg-white/5 border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/60 text-sm">Top Opportunity</p>
              <h3 className="text-lg font-semibold text-primary mt-1">{topOpportunities[0].keyword}</h3>
            </div>
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Opportunity Score</span>
              <span className="text-green-400 font-semibold">{(topOpportunities[0].opportunityScore/10).toFixed(1)}</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 mt-1">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, topOpportunities[0].opportunityScore)}%` }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/60 text-sm">Total Keywords</p>
              <h3 className="text-lg font-semibold text-primary mt-1">{keywordData.length}</h3>
            </div>
            <ChartBar className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/60">
              <span>Easy</span>
              <span>Medium</span>
              <span>Hard</span>
            </div>
            <div className="flex space-x-1 mt-1">
              <div className="h-2 rounded-l-full bg-green-500" style={{ width: '40%' }}></div>
              <div className="h-2 bg-yellow-500" style={{ width: '35%' }}></div>
              <div className="h-2 rounded-r-full bg-red-500" style={{ width: '25%' }}></div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/60 text-sm">Avg. Search Volume</p>
              <h3 className="text-lg font-semibold text-primary mt-1">{avgVolume}</h3>
            </div>
            <Search className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Monthly Growth</span>
              <span className="text-primary font-semibold">+12.4%</span>
            </div>
            <div className="h-8 mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={keywordData}>
                  <Line type="monotone" dataKey="growth" stroke="#9b87f5" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/60 text-sm">Avg. Difficulty</p>
              <h3 className="text-lg font-semibold text-primary mt-1">{avgDifficulty}</h3>
            </div>
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-4 flex justify-between items-center text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span className="text-white/60">Easy</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
              <span className="text-white/60">Medium</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span className="text-white/60">Hard</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-white/10">
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            className={`pb-2 px-1 rounded-none ${activeTab === 'opportunity' ? 'text-primary border-b-2 border-primary' : 'text-white/60'}`}
            onClick={() => setActiveTab('opportunity')}
          >
            Opportunity Matrix
          </Button>
          <Button
            variant="ghost"
            className={`pb-2 px-1 rounded-none ${activeTab === 'competitive' ? 'text-primary border-b-2 border-primary' : 'text-white/60'}`}
            onClick={() => setActiveTab('competitive')}
          >
            Competitive Landscape
          </Button>
          <Button
            variant="ghost"
            className={`pb-2 px-1 rounded-none ${activeTab === 'top5' ? 'text-primary border-b-2 border-primary' : 'text-white/60'}`}
            onClick={() => setActiveTab('top5')}
          >
            Top Opportunities
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <Card className="p-6 bg-white/5 border-white/10">
        {activeTab === 'opportunity' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Keyword Opportunity Matrix</h2>
              <span className="text-xs text-white/60">Bubble size = Opportunity Score</span>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 40, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    type="number" 
                    dataKey="difficulty" 
                    name="Difficulty" 
                    domain={[0, 70]}
                    label={{ value: 'Difficulty', position: 'bottom', offset: 0, fill: '#9ca3af' }}
                    tick={{ fill: '#9ca3af' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="volume" 
                    name="Search Volume" 
                    domain={[0, 70]}
                    label={{ value: 'Search Volume', angle: -90, position: 'insideLeft', offset: -5, fill: '#9ca3af' }}
                    tick={{ fill: '#9ca3af' }}
                  />
                  <ZAxis type="number" dataKey="opportunityScore" range={[40, 400]} name="Opportunity Score" />
                  <Tooltip content={<CustomTooltip />} />
                  <Scatter name="Keywords" data={processedData}>
                    {processedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColor(entry.opportunityScore)} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'competitive' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Competitive Landscape</h2>
              <span className="text-xs text-white/60">Top keywords by volume</span>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={keywordData.sort((a, b) => b.volume - a.volume).slice(0, 8)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
                  <YAxis type="category" dataKey="keyword" width={140} tick={{ fill: '#9ca3af' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="difficulty" name="Difficulty Score" fill="#f87171" barSize={12} />
                  <Bar dataKey="chance" name="Ranking Chance %" fill="#4ade80" barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'top5' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Top Keyword Opportunities</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-xs text-white/60 border-b border-white/10">
                    <th className="px-3 py-3 text-left">Keyword</th>
                    <th className="px-3 py-3 text-right">Volume</th>
                    <th className="px-3 py-3 text-right">Difficulty</th>
                    <th className="px-3 py-3 text-right">KEI</th>
                    <th className="px-3 py-3 text-right">Relevancy%</th>
                    <th className="px-3 py-3 text-right">Chance%</th>
                    <th className="px-3 py-3 text-right">Opp Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {topOpportunities.map((item, index) => (
                    <tr key={index} className="hover:bg-white/5 text-sm">
                      <td className="px-3 py-3 font-medium text-primary">{item.keyword}</td>
                      <td className="px-3 py-3 text-right text-white">{item.volume}</td>
                      <td className="px-3 py-3 text-right">
                        <span className={item.difficulty < 20 ? 'text-green-400' : item.difficulty < 50 ? 'text-yellow-400' : 'text-red-400'}>
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right text-white">{item.kei}</td>
                      <td className="px-3 py-3 text-right text-white">{item.relevancy}</td>
                      <td className="px-3 py-3 text-right text-white">{item.chance}%</td>
                      <td className="px-3 py-3 text-right">
                        <span className="font-semibold text-green-400">{(item.opportunityScore/10).toFixed(1)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Card className="mt-8 p-4 bg-primary/5 border-primary/20">
              <h3 className="text-primary font-semibold mb-2">AI-Powered Recommendations</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 mt-2 rounded-full bg-primary"></div>
                  <span>Optimize app content for <span className="text-primary font-medium">reading games for kids</span> (low difficulty, high relevancy)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 mt-2 rounded-full bg-primary"></div>
                  <span>Create landing pages for <span className="text-primary font-medium">books for kids</span> to capitalize on higher volume</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 mt-2 rounded-full bg-primary"></div>
                  <span>Include <span className="text-primary font-medium">free</span> in app store metadata (appears in 3 of top 5 opportunities)</span>
                </li>
              </ul>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}
