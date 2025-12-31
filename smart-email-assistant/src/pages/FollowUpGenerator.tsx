// pages/FollowUpGenerator.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { emailApi } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { ArrowRightLeft, CalendarDays } from 'lucide-react';

const FollowUpGenerator: React.FC = () => {
  const [emailContent, setEmailContent] = useState('');
  const [days, setDays] = useState(3);
  const [followUp, setFollowUp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateFollowUp = async () => {
    if (!emailContent.trim()) {
      toast({ title: 'Enter original email', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await emailApi.generateFollowUp({ emailContent, days });
      setFollowUp(response.data);
      toast({ title: 'Follow-up generated!' });
    } catch (error) {
      toast({ title: 'Generation failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
          <ArrowRightLeft className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Follow-up Generator</h1>
          <p className="text-muted-foreground">Create polite follow-ups automatically</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate follow-up email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Original Email</Label>
            <textarea
              className="w-full h-24 p-4 border rounded-xl resize-vertical text-foreground bg-background"
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Paste the email you want to follow up on..."
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Follow-up after</Label>
              <Select value={days.toString()} onValueChange={(v) => setDays(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">1 week</SelectItem>
                  <SelectItem value="14">2 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={generateFollowUp} className="w-full" disabled={isLoading}>
            {isLoading ? 'Generating...' : '➡️ Create Follow-up'}
          </Button>
        </CardContent>
      </Card>

      {followUp && (
        <Card>
          <CardHeader>
            <CardTitle>Your Follow-up Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-2xl border">
              <pre className="whitespace-pre-wrap text-sm font-medium">{followUp}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FollowUpGenerator;

