import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextAreaWithLabel } from '@/components/common/TextAreaWithLabel';
import { SelectTone } from '@/components/common/SelectTone';
import { SelectPromptVersion } from '@/components/common/SelectPromptVersion';
import { ProviderToggle } from '@/components/common/ProviderToggle';
import { ApiResultCard } from '@/components/common/ApiResultCard';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { emailApi } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Mail, Wand2 } from 'lucide-react';

const Generate: React.FC = () => {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('FORMAL');
  const [promptVersion, setPromptVersion] = useState('V2_STRUCTURED');
  const [provider, setProvider] = useState('GEMINI');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!emailContent.trim()) {
      toast({
        title: 'Email content required',
        description: 'Please enter the email content you want to generate.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await emailApi.generate({
        emailContent,
        tone,
        promptVersion,
        provider,
      });
      setResult(response.data.generatedEmail || response.data.content || response.data);
      toast({
        title: 'Email generated!',
        description: 'Your AI-powered email is ready.',
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
          <Mail className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Generate Email</h1>
          <p className="text-muted-foreground">Create professional emails with AI assistance</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Compose
            </CardTitle>
            <CardDescription>
              Describe the email you want to create or paste existing content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <TextAreaWithLabel
              id="emailContent"
              label="Email Content"
              value={emailContent}
              onChange={setEmailContent}
              placeholder="Enter the context or main points for your email. For example: 'Write a professional follow-up email to a client about a pending project proposal...'"
              rows={6}
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectTone value={tone} onChange={setTone} />
              <SelectPromptVersion value={promptVersion} onChange={setPromptVersion} />
            </div>

            <ProviderToggle value={provider} onChange={setProvider} />

            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={handleGenerate}
              disabled={isLoading || !emailContent.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {isLoading && <LoadingSkeleton variant="result" />}
          {result && !isLoading && <ApiResultCard content={result} />}
          {!result && !isLoading && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Ready to Generate</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Fill in the form and click "Generate Email" to see your AI-crafted email appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generate;
