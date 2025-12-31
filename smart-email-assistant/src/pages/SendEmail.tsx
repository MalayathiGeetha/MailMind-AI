// src/pages/SendEmail.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { emailApi } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { Send, Loader2 } from 'lucide-react';

interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
}

const SendEmail: React.FC = () => {
  const [formData, setFormData] = useState<SendEmailRequest>({
    to: '',
    subject: '',
    body: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await emailApi.sendEmail(formData);
      toast({
        title: 'Email Sent!',
        description: `Successfully sent to ${formData.to}`,
      });
      setFormData({ to: '', subject: '', body: '' });
    } catch (error: any) {
      toast({
        title: 'Send Failed',
        description: error.response?.data?.message || 'Failed to send email',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
          <Send className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Send Email</h1>
          <p className="text-muted-foreground">Send real emails powered by SendGrid</p>
        </div>
      </div>

      <Card className="border-0 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label>To</Label>
              <Input
                value={formData.to}
                onChange={(e) => setFormData({...formData, to: e.target.value})}
                placeholder="recipient@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="Your email subject"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Email Body</Label>
              <Textarea
                value={formData.body}
                onChange={(e) => setFormData({...formData, body: e.target.value})}
                placeholder="Write your email..."
                rows={8}
                className="resize-vertical"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default SendEmail;

