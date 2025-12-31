// src/pages/UserDashboard.tsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { emailApi } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { User, BarChart3, TrendingUp, Award, Clock, Activity, RefreshCw } from 'lucide-react';

interface UserDashboard {
  username: string;
  totalEmails: number;
  totalWordsGenerated: number;
  topTones: string[];
  recentEmails: string[];
  avgEmailLength: number;
  preferredProvider: string;
}

const UserDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<UserDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [switching, setSwitching] = useState(false);

  const switchProvider = async (provider: string) => {
  setSwitching(true);
  try {
    await emailApi.switchProvider({ provider }); // ✅ Now calls PUT /api/user/ai-provider
    toast({ title: 'Model Switched!', description: `Now using ${provider}` });
    await fetchDashboard(); // ✅ Refreshes → shows "Active: OLLAMA"
  } catch (error: any) {
    toast({
      title: 'Switch Failed',
      description: error.response?.data || 'Please try again',
      variant: 'destructive',
    });
  } finally {
    setSwitching(false);
  }
};


  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await emailApi.getUserDashboard();
      setDashboard(response.data);
      toast({
        title: 'Dashboard updated!',
        description: `${response.data.totalEmails} emails loaded`,
      });
    } catch (error: any) {
      console.error('Dashboard error:', error);
      toast({
        title: 'Dashboard load failed',
        description: error.response?.data?.message || 'Please login again',
        variant: 'destructive',
      });
      setDashboard(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted animate-pulse" />
          <div>
            <div className="h-8 bg-muted w-48 rounded animate-pulse" />
            <div className="h-4 bg-muted/50 w-64 mt-2 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-md">
            <User className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, <span className="font-semibold">{dashboard?.username || 'User'}</span>
            </p>
          </div>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing || loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Updating...' : 'Refresh'}
        </Button>
      </div>

      {dashboard ? (
        <>
          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="group hover:shadow-xl border-0 bg-gradient-to-br from-primary/5 to-primary/2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                  Total Emails
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-primary">
                  {dashboard.totalEmails.toLocaleString()}
                </div>
                <p className="text-xs text-primary/80 mt-1">Generated ever</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  Words Generated
                  <TrendingUp className="h-4 w-4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboard.totalWordsGenerated.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Total output</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  Avg Length
                  <Clock className="h-4 w-4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Math.round(dashboard.avgEmailLength)} chars</div>
                <p className="text-xs text-muted-foreground mt-1">Per email</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  Top Tone
                  <Award className="h-4 w-4 text-emerald-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-full font-semibold">
                    {dashboard.topTones[0] || 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Most used</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard.recentEmails?.length ? (
                  dashboard.recentEmails.slice(0, 5).map((email, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted group cursor-pointer transition-all">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-mono text-xs flex-shrink-0">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">{email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Generated with {dashboard.preferredProvider}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-40" />
                    <p className="text-lg font-medium">No activity yet</p>
                    <p className="text-sm mt-1">Generate some emails to see stats</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Provider & Upgrade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Model</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {/* Model Switcher */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'GEMINI', label: 'Gemini 1.5 ⚡', color: 'from-orange-500 to-orange-600', speed: 'Fastest' },
                      { id: 'OLLAMA', label: 'Ollama 🆓', color: 'from-emerald-500 to-emerald-600', speed: 'Local' },
                      { id: 'LOCAL', label: 'Fallback 🔒', color: 'from-gray-500 to-gray-600', speed: 'Reliable' }
                    ].map((model) => (
                      <Button
                        key={model.id}
                        variant={dashboard?.preferredProvider === model.id ? "default" : "outline"}
                        className={`h-16 ${model.color} text-white hover:${model.color.replace('from-', 'hover:from-').replace('to-', 'hover:to-')} hover:scale-[1.02] transition-all`}
                        onClick={() => switchProvider(model.id)}
                        disabled={switching}
                      >
                        <div className="flex flex-col items-center gap-1 text-xs">
                          <span className="font-semibold">{model.label}</span>
                          <span className="opacity-90 text-xs">{model.speed}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                  
                  {/* Status */}
                  {dashboard?.preferredProvider && (
                    <div className="flex items-center justify-center p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-xl border border-emerald-200/50">
                      <span className="font-semibold text-sm px-3 py-1 bg-emerald-500/20 text-emerald-700 rounded-full">
                        Active: {dashboard.preferredProvider}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-8 text-center">
                <div className="flex items-center justify-center gap-3 text-3xl font-black text-primary mb-4">
                  <Award className="h-10 w-10 text-emerald-500" />
                  {dashboard.totalEmails > 10 ? 'Power User' : 'Getting Started'}
                </div>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                  You've generated <strong>{dashboard.totalEmails}</strong> emails using{' '}
                  <strong>{dashboard.topTones?.length || 0}</strong> different tones.
                </p>
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 shadow-lg">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="border-2 border-dashed border-muted-foreground/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <User className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No dashboard data</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Generate some emails or try refreshing to load your stats.
            </p>
            <Button onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserDashboard;

