import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextAreaWithLabel } from '@/components/common/TextAreaWithLabel';
import { SelectTone } from '@/components/common/SelectTone';
import { ApiResultCard } from '@/components/common/ApiResultCard';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { emailApi } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { MessageSquare, Loader2, Sparkles, Plus, Trash2, Mail } from 'lucide-react';

const ThreadReply: React.FC = () => {
  const [previousEmails, setPreviousEmails] = useState<string[]>(['']);
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('FORMAL');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addEmail = () => {
    setPreviousEmails([...previousEmails, '']);
  };

  const removeEmail = (index: number) => {
    if (previousEmails.length > 1) {
      setPreviousEmails(previousEmails.filter((_, i) => i !== index));
    }
  };

  const updateEmail = (index: number, value: string) => {
    const updated = [...previousEmails];
    updated[index] = value;
    setPreviousEmails(updated);
  };

  const handleGenerate = async () => {
    const validEmails = previousEmails.filter((e) => e.trim());
    
    if (validEmails.length === 0) {
      toast({
        title: 'Previous emails required',
        description: 'Please add at least one previous email in the thread.',
        variant: 'destructive',
      });
      return;
    }

    if (!emailContent.trim()) {
      toast({
        title: 'Latest email required',
        description: 'Please enter the latest email to reply to.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await emailApi.threadReply({
        previousEmails: validEmails,
        emailContent,
        tone,
      });
      setResult(response.data.generatedEmail || response.data.reply || response.data);
      toast({
        title: 'Reply generated!',
        description: 'Your context-aware reply is ready.',
      });
    } catch (error: any) {
      toast({
        title: 'Generation failed',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
          <MessageSquare className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thread Reply</h1>
          <p className="text-muted-foreground">Generate context-aware replies using email thread history</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Thread History
                </span>
                <Button variant="outline" size="sm" onClick={addEmail}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Email
                </Button>
              </CardTitle>
              <CardDescription>
                Add previous emails in the thread for context (oldest first)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {previousEmails.map((email, index) => (
                <div key={index} className="relative animate-fade-in">
                  <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="ml-8">
                    <TextAreaWithLabel
                      id={`email-${index}`}
                      label={`Email ${index + 1}`}
                      value={email}
                      onChange={(value) => updateEmail(index, value)}
                      placeholder={`Paste email ${index + 1} content here...`}
                      rows={4}
                    />
                    {previousEmails.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 text-destructive hover:text-destructive"
                        onClick={() => removeEmail(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Latest Email & Reply Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <TextAreaWithLabel
                id="latestEmail"
                label="Latest Email (to reply to)"
                value={emailContent}
                onChange={setEmailContent}
                placeholder="Paste the latest email you want to reply to..."
                rows={5}
                required
              />

              <SelectTone value={tone} onChange={setTone} />

              <Button
                variant="gradient"
                size="lg"
                className="w-full"
                onClick={handleGenerate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Reply...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Thread Reply
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {isLoading && <LoadingSkeleton variant="result" />}
          {result && !isLoading && <ApiResultCard title="Thread Reply" content={result} />}
          {!result && !isLoading && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Context-Aware Replies</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Add your email thread history and the AI will generate a reply that understands the full context.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreadReply;
