import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextAreaWithLabel } from '@/components/common/TextAreaWithLabel';
import { SelectTone } from '@/components/common/SelectTone';
import { SelectPromptVersion } from '@/components/common/SelectPromptVersion';
import { SelectMode } from '@/components/common/SelectMode';
import { ProviderToggle } from '@/components/common/ProviderToggle';
import { ApiResultCard } from '@/components/common/ApiResultCard';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { emailApi } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { Settings2, Loader2, Sparkles, Zap } from 'lucide-react';

const Advanced: React.FC = () => {
  const [emailContent, setEmailContent] = useState('');
  const [mode, setMode] = useState('GENERATE_REPLY');
  const [tone, setTone] = useState('FORMAL');
  const [promptVersion, setPromptVersion] = useState('V2_STRUCTURED');
  const [provider, setProvider] = useState('GEMINI');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!emailContent.trim()) {
      toast({
        title: 'Email content required',
        description: 'Please enter the email content you want to process.',
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
        mode,
      });
      setResult(response.data.generatedEmail || response.data.content || response.data);
      toast({
        title: 'Processing complete!',
        description: `Email ${mode.toLowerCase().replace('_', ' ')} successful.`,
      });
    } catch (error: any) {
      toast({
        title: 'Processing failed',
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
          <Settings2 className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Advanced Mode</h1>
          <p className="text-muted-foreground">Fine-tune your email generation with advanced options</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Advanced Settings
            </CardTitle>
            <CardDescription>
              Choose a processing mode and customize every aspect
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <SelectMode value={mode} onChange={setMode} />

            <TextAreaWithLabel
              id="emailContent"
              label="Email Content"
              value={emailContent}
              onChange={setEmailContent}
              placeholder="Enter the email content you want to process. The AI will apply the selected mode to transform it..."
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
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Process Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {isLoading && <LoadingSkeleton variant="result" />}
          {result && !isLoading && <ApiResultCard title="Processed Email" content={result} />}
          {!result && !isLoading && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Settings2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Advanced Processing</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Select a mode like Polish, Shorten, or Expand, then process your email to see the result.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Advanced;
