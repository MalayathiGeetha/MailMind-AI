import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { emailApi } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { BarChart3, Mail, FileText, TrendingUp, Clock, Activity, Award, RefreshCw } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AnalyticsData {
  totalEmails: number;
  toneCounts: Record<string, number>;      // ✅ Backend field
  intentCounts: Record<string, number>;    // ✅ Backend field
  averageEmailLength: number;
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#06B6D4', '#F97316',
];

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    setRefreshing(true);
    try {
      const response = await emailApi.getAnalytics();
      console.log('🧪 Analytics data:', response.data);
      setAnalytics(response.data);
      toast({
        title: 'Analytics loaded!',
        description: `${response.data.totalEmails} emails analyzed`,
      });
    } catch (error: any) {
      console.error('Analytics error:', error);
      toast({
        title: 'No analytics yet',
        description: 'Generate some emails first to see your stats!',
        variant: 'destructive',
      });
      setAnalytics(null);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // ✅ FIXED: Use toneCounts + intentCounts
  const formatToneData = () => {
    if (!analytics?.toneCounts) return [];
    return Object.entries(analytics.toneCounts)
      .map(([name, value]: [string, any]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: Number(value),
        fill: COLORS[Object.keys(analytics.toneCounts).indexOf(name) % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  };

  const formatIntentData = () => {
    if (!analytics?.intentCounts) return [];
    return Object.entries(analytics.intentCounts)
      .map(([name, value]: [string, any]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: Number(value),
      }))
      .sort((a, b) => b.value - a.value);
  };

  const topTone = formatToneData()[0]?.name || 'N/A';
  const topIntent = formatIntentData()[0]?.name || 'N/A';
  const toneData = formatToneData();
  const intentData = formatIntentData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-md animate-pulse">
            <BarChart3 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Loading insights...</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
            <BarChart3 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              {analytics ? `${analytics.totalEmails} emails analyzed` : 'No data yet'}
            </p>
          </div>
        </div>
        <Button 
          onClick={fetchAnalytics} 
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* No Data State */}
      {!analytics && (
        <Card className="border-dashed border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted mb-6">
              <BarChart3 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-xl mb-2">No Analytics Yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Generate some emails using the Generate or Advanced tabs to see your usage statistics.
            </p>
            <div className="flex gap-3">
              <Button variant="default">Go to Generate</Button>
              <Button variant="outline">Advanced Mode</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {analytics && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="group hover:shadow-xl transition-all border-0 bg-gradient-to-br from-primary/5 to-primary/2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">Total Emails</CardTitle>
                <Mail className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-primary">{analytics.totalEmails.toLocaleString()}</div>
                <p className="text-xs text-primary/80 mt-1 font-medium">Generated this week</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Length</CardTitle>
                <FileText className="h-5 w-5 text-muted-foreground group-hover:rotate-12 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {Math.round(analytics.averageEmailLength)} chars
                </div>
                <p className="text-xs text-muted-foreground mt-1">Per email</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Tone</CardTitle>
                <TrendingUp className="h-5 w-5 text-success group-hover:rotate-12 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    {topTone}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Most used</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tone Variety</CardTitle>
                <Activity className="h-5 w-5 text-muted-foreground group-hover:rotate-12 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{toneData.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Different tones</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Tone Usage</CardTitle>
                <CardDescription>Distribution of tones across all emails</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[350px] p-6">
                  {toneData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={toneData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          type="number" 
                          axisLine={false} 
                          tickLine={false}
                          tickMargin={10}
                        />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false}
                          tickLine={false}
                          width={100}
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip />
                        <Bar 
                          dataKey="value" 
                          radius={[4, 4, 0, 0]} 
                          barSize={24}
                        >
                          {toneData.map((entry, index) => (
                            <Cell key={`tone-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No tone data yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Intent Breakdown</CardTitle>
                <CardDescription>Primary purpose of generated emails</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[350px] p-6">
                  {intentData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={intentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          cornerRadius={6}
                        >
                          {intentData.map((entry, index) => (
                            <Cell key={`intent-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No intent data yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Quick Stats Footer */}
      {analytics && (
        <Card className="border-t-4 border-primary/20">
          <CardContent className="py-8 text-center">
            <div className="max-w-md mx-auto space-y-2">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary mb-2">
                <Award className="h-8 w-8" />
                {toneData.length > 1 ? 'Versatile Writer' : 'Getting Started'}
              </div>
              <p className="text-muted-foreground">
                You've generated {analytics.totalEmails} emails using {toneData.length} different tones. 
                Keep experimenting with different styles!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;

