// ✅ COMPLETE History.tsx WITH CORRECT EMAILINTENT ENUM VALUES
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { emailApi } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { History as HistoryIcon, ChevronDown, ChevronUp, Clock, Mail, Sparkles, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface HistoryItem {
  id: number;
  timestamp: string;
  tone: string;
  intent: string;
  emailContent: string;
  generatedResponse: string;
}

const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<string>('all');

  useEffect(() => {
    fetchHistory(selectedIntent);
  }, [selectedIntent]); // ✅ Re-fetch when filter changes

  const fetchHistory = async (intentFilter: string = 'all') => {
    setIsLoading(true);
    try {
      let response;
      if (intentFilter === 'all') {
        response = await emailApi.getHistory();
      } else {
        response = await emailApi.getHistoryByIntent(intentFilter);
      }
      console.log('🧪 History data:', response.data);
      setHistory(response.data || []);
    } catch (error: any) {
      console.error('History error:', error);
      toast({
        title: 'Failed to load history',
        description: error.response?.data?.message || 'Unable to fetch your email history.',
        variant: 'destructive',
      });
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getToneBadgeColor = (tone: string) => {
    const colors: Record<string, string> = {
      FORMAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      FRIENDLY: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      APOLOGY: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      FOLLOW_UP: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      PROFESSIONAL: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    };
    return colors[tone.toUpperCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
            <HistoryIcon className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">History</h1>
            <p className="text-muted-foreground">View your past email generations</p>
          </div>
        </div>
        <LoadingSkeleton variant="list" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ✅ HEADER */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
          <HistoryIcon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">History</h1>
          <p className="text-muted-foreground">
            {history.length} past generations {selectedIntent !== 'all' && `• ${selectedIntent}`}
          </p>
        </div>
      </div>

      {/* ✅ INTENT FILTER - ✅ CORRECT EMAILINTENT VALUES */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filter by intent</span>
        </div>
        <Select value={selectedIntent} onValueChange={(value) => {
          setSelectedIntent(value);
          fetchHistory(value);
        }}>
          <SelectTrigger className="w-[240px] border-border focus:ring-primary/20">
            <SelectValue placeholder="All intents" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                All Intents
                <span className="text-xs text-muted-foreground">({history.length})</span>
              </div>
            </SelectItem>
            <SelectItem value="COMPLAINT">
              <div className="flex items-center gap-2">
                📞 Complaints
              </div>
            </SelectItem>
            <SelectItem value="JOB_APPLICATION">
              <div className="flex items-center gap-2">
                💼 Job Applications
              </div>
            </SelectItem>
            <SelectItem value="INTERVIEW_REPLY">
              <div className="flex items-center gap-2">
                🎤 Interview Replies
              </div>
            </SelectItem>
            <SelectItem value="FOLLOW_UP">
              <div className="flex items-center gap-2">
                ➡️ Follow-ups
              </div>
            </SelectItem>
            <SelectItem value="SALES_INQUIRY">
              <div className="flex items-center gap-2">
                💰 Sales Inquiries
              </div>
            </SelectItem>
            <SelectItem value="SUPPORT_REQUEST">
              <div className="flex items-center gap-2">
                🛠️ Support Requests
              </div>
            </SelectItem>
            <SelectItem value="GREETING">
              <div className="flex items-center gap-2">
                👋 Greetings
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ✅ HISTORY LIST OR EMPTY STATE */}
      {history.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <HistoryIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">
              {selectedIntent === 'all' ? 'No History Yet' : `No ${selectedIntent.replace('_', ' ')} emails`}
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-6">
              {selectedIntent === 'all'
                ? 'Your generated emails will appear here. Start by generating your first email!'
                : `Generate some ${selectedIntent.toLowerCase().replace('_', ' ')} emails to see them here.`}
            </p>
            <Button variant="outline" onClick={() => fetchHistory('all')}>
              Show All History
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((item, index) => (
            <Card
              key={item.id}
              variant="interactive"
              className={cn(
                "animate-slide-up hover:shadow-md transition-all cursor-pointer border-border",
                expandedId === item.id && "ring-2 ring-primary/30 shadow-xl"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader
                className="p-6 pb-4 -m-1"
                onClick={() => toggleExpand(item.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 shadow-sm">
                      <Mail className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg font-semibold leading-tight truncate">
                        {(item.emailContent || 'Untitled').slice(0, 60)}
                        {item.emailContent && item.emailContent.length > 60 && '...'}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <CardDescription className="text-xs truncate">
                          {format(new Date(item.timestamp), 'MMM d, yyyy • h:mm a')}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={cn(
                        "font-semibold px-3 py-1", 
                        getToneBadgeColor(item.tone)
                      )}
                    >
                      {item.tone}
                    </Badge>
                    <Badge variant="outline" className="font-medium">
                      {item.intent.replace('_', ' ')}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 ml-1 hover:bg-accent"
                    >
                      {expandedId === item.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedId === item.id && (
                <CardContent className="p-0 border-t bg-gradient-to-b from-muted/20 to-transparent">
                  <div className="p-6 space-y-5">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Original Prompt
                      </h4>
                      <div className="bg-background border rounded-xl p-4 max-h-32 overflow-y-auto text-sm whitespace-pre-wrap">
                        {item.emailContent || 'No content available'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        AI Response
                      </h4>
                      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {item.generatedResponse || 'No response generated'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;

