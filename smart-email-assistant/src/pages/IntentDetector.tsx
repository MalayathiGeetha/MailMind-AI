// pages/IntentDetector.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { emailApi } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { Target, Sparkles, MessageCircle } from 'lucide-react';

interface IntentResponse {
  intent: string;  // ✅ Backend: EmailIntent.name()
  reason: string;  // ✅ Backend: reason field
}

const IntentDetector: React.FC = () => {
  const [emailContent, setEmailContent] = useState('');
  const [result, setResult] = useState<IntentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const detectIntent = async () => {
    if (!emailContent.trim()) {
      toast({ title: 'Enter email content', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await emailApi.detectIntent({ emailContent });
      console.log('🔍 Backend response:', response.data); // ✅ Debug
      setResult(response.data);
      toast({ 
        title: 'Intent detected!', 
        description: `${response.data.intent} - ${response.data.reason}` 
      });
    } catch (error: any) {
      console.error('Detection error:', error);
      toast({ title: 'Detection failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED: Matches YOUR Backend Enum EXACTLY
  const getToneSuggestion = (intent: string) => {
    const tones: Record<string, string> = {
      'FOLLOW_UP': 'Professional',
      'JOB_APPLICATION': 'Formal',
      'INTERVIEW_REPLY': 'Polite',
      'SALES_INQUIRY': 'Confident',
      'SUPPORT_REQUEST': 'Clear & Direct',
      'GREETING': 'Friendly',
      'COMPLAINT': 'Assertive',
      'OTHER': 'Friendly'
    };
    return tones[intent] || 'Friendly';
  };

  // ✅ FIXED: Matches YOUR Backend Enum EXACTLY
  const getUseCase = (intent: string) => {
    const useCases: Record<string, string> = {
      'FOLLOW_UP': 'status updates & reminders',
      'JOB_APPLICATION': 'resumes & cover letters',
      'INTERVIEW_REPLY': 'scheduling & confirmations',
      'SALES_INQUIRY': 'pricing quotes & demos',
      'SUPPORT_REQUEST': 'bugs, issues & help requests',
      'GREETING': 'introductions & thank you notes',
      'COMPLAINT': 'billing disputes & service issues',
      'OTHER': 'general business communication'
    };
    return useCases[intent] || 'general emails';
  };

  // ✅ Show input form OR results (cleaner logic)
  if (!result) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
            <Target className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Intent Detector</h1>
            <p className="text-muted-foreground">AI detects email purpose automatically</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Paste your email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email Content</Label>
              <textarea
                className="w-full h-32 p-4 border rounded-xl resize-vertical focus:ring-2 focus:ring-primary/20 text-foreground bg-background min-h-[120px]"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Paste your email content here..."
              />
            </div>
            <Button onClick={detectIntent} className="w-full" disabled={isLoading}>
              {isLoading ? 'Detecting...' : '🔍 Detect Intent'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Intent Detected!</h1>
          <p className="text-muted-foreground">AI analysis complete</p>
        </div>
      </div>

      {/* Results Card */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="default" className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 text-lg">
              {result.intent}
            </Badge>
            <span className="text-2xl font-black text-primary">{result.intent}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reason Explanation */}
          <div className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl border">
            <div className="flex items-start gap-3">
              <MessageCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Why this intent?</p>
                <p className="text-foreground font-semibold">{result.reason}</p>
              </div>
            </div>
          </div>

          {/* Use Cases & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col p-6 bg-muted/50 rounded-xl border">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Best Use Case</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">{getUseCase(result.intent)}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Perfect for {result.intent.toLowerCase()} scenarios
              </p>
            </div>

            <div className="flex flex-col p-6 bg-muted/50 rounded-xl border">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Tone Suggestion</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">{getToneSuggestion(result.intent)}</h3>
              <Badge className="mt-2 w-fit bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                Recommended
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90"
              onClick={() => {
                navigator.clipboard.writeText(emailContent);
                toast({ title: 'Email copied!' });
              }}
            >
              📋 Copy Email
            </Button>
            <Button 
              className="flex-1" 
              variant="outline"
              onClick={() => {
                setEmailContent('');
                setResult(null);
              }}
            >
              🔍 New Detection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntentDetector;

