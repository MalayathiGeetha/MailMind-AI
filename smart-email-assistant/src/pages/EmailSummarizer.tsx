// ✅ FIXED EmailSummarizer.tsx - Matches SummaryResponse DTO
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { emailApi } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { FileText, List, Sparkles, CheckCircle, Calendar } from 'lucide-react';

interface SummaryResponse {
  summary?: string;
  actionItems?: string[];
  deadlines?: string[];
}

const EmailSummarizer: React.FC = () => {
  const [emailContent, setEmailContent] = useState('');
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const summarizeEmail = async () => {
    if (!emailContent.trim()) {
      toast({ title: 'Enter email content', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await emailApi.summarize({ emailContent });
      console.log('🧪 Summary response:', response.data); // ✅ Debug
      setSummary(response.data);
      toast({ title: 'Email summarized!' });
    } catch (error: any) {
      console.error('Summary error:', error);
      toast({ title: 'Summarization failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ SAFE ACCESSORS - Match Backend DTO
  const safeSummary = summary?.summary || 'No summary available';
  const safeActionItems = (summary?.actionItems || []) as string[];
  const safeDeadlines = (summary?.deadlines || []) as string[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
          <FileText className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Summarizer</h1>
          <p className="text-muted-foreground">Extract action items & deadlines instantly</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summarize any email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email Content</Label>
            <textarea
              className="w-full h-32 p-4 border rounded-xl resize-vertical focus:ring-2 focus:ring-primary/20 text-foreground bg-background placeholder:text-muted-foreground"
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Paste email to summarize..."
            />
          </div>
          <Button onClick={summarizeEmail} className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Summarizing...
              </>
            ) : (
              '📝 Summarize Email'
            )}
          </Button>
        </CardContent>
      </Card>

      {summary && (
        <div className="space-y-6">
          {/* ✅ SUMMARY CARD */}
          <Card className="shadow-xl col-span-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl border">
              <p className="text-xl font-semibold leading-relaxed text-foreground">
                {safeSummary}
              </p>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* ✅ ACTION ITEMS */}
            <Card className="shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  Action Items ({safeActionItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {safeActionItems.length > 0 ? (
                  <ul className="space-y-3 p-6 divide-y divide-border">
                    {safeActionItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 py-3 first:pt-0 last:pb-6">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 font-semibold text-sm mt-0.5 flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-sm leading-relaxed flex-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center justify-center h-32 p-6 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mr-2 opacity-50" />
                    No action items detected
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ✅ DEADLINES */}
            <Card className="shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  Deadlines ({safeDeadlines.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {safeDeadlines.length > 0 ? (
                  <ul className="space-y-3 p-6 divide-y divide-border">
                    {safeDeadlines.map((deadline, index) => (
                      <li key={index} className="flex items-start gap-3 py-3 first:pt-0 last:pb-6">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 font-semibold text-sm mt-0.5 flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-sm leading-relaxed flex-1 font-medium">{deadline}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center justify-center h-32 p-6 text-muted-foreground">
                    <Calendar className="h-8 w-8 mr-2 opacity-50" />
                    No deadlines found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailSummarizer;

