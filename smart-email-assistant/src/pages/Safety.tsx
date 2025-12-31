import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextAreaWithLabel } from '@/components/common/TextAreaWithLabel';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { emailApi } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { Shield, Loader2, CheckCircle, AlertTriangle, XCircle, Gauge, ThumbsUp, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QualityScore {
  sentiment: string;
  politenessScore: number;
  professionalismScore: number;
}

interface RiskResult {
  severity: string;
  recommendation: string;
  issues?: string[];
}

const Safety: React.FC = () => {
  const [emailContent, setEmailContent] = useState('');
  const [qualityScore, setQualityScore] = useState<QualityScore | null>(null);
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [isLoadingQuality, setIsLoadingQuality] = useState(false);
  const [isLoadingRisk, setIsLoadingRisk] = useState(false);

  const handleScoreQuality = async () => {
    if (!emailContent.trim()) {
      toast({
        title: 'Email content required',
        description: 'Please enter the email content to analyze.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingQuality(true);
    setQualityScore(null);

    try {
      const response = await emailApi.scoreQuality({ emailContent });
      setQualityScore(response.data);
      toast({
        title: 'Quality analysis complete',
        description: 'Your email has been analyzed for quality.',
      });
    } catch (error: any) {
      toast({
        title: 'Analysis failed',
        description: error.response?.data?.message || 'Unable to analyze email quality.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingQuality(false);
    }
  };

  const handleDetectRisk = async () => {
    if (!emailContent.trim()) {
      toast({
        title: 'Email content required',
        description: 'Please enter the email content to analyze.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingRisk(true);
    setRiskResult(null);

    try {
      const response = await emailApi.detectRisk({ emailContent });
      setRiskResult(response.data);
      toast({
        title: 'Risk analysis complete',
        description: 'Your email has been analyzed for potential risks.',
      });
    } catch (error: any) {
      toast({
        title: 'Analysis failed',
        description: error.response?.data?.message || 'Unable to detect risks.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingRisk(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-success/10';
    if (score >= 60) return 'bg-warning/10';
    return 'bg-destructive/10';
  };

  const getSeverityConfig = (severity: string) => {
    const configs: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
      LOW: { color: 'text-success', bg: 'bg-success/10 border-success/20', icon: CheckCircle },
      MEDIUM: { color: 'text-warning', bg: 'bg-warning/10 border-warning/20', icon: AlertTriangle },
      HIGH: { color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20', icon: XCircle },
    };
    return configs[severity?.toUpperCase()] || configs.MEDIUM;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Safety & Quality</h1>
          <p className="text-muted-foreground">Analyze email quality and detect potential risks</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" />
              Email Analysis
            </CardTitle>
            <CardDescription>
              Enter an email to check its quality and detect risks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <TextAreaWithLabel
              id="emailContent"
              label="Email Content"
              value={emailContent}
              onChange={setEmailContent}
              placeholder="Paste the email you want to analyze for quality and potential risks..."
              rows={8}
              required
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="default"
                size="lg"
                className="w-full"
                onClick={handleScoreQuality}
                disabled={isLoadingQuality || !emailContent.trim()}
              >
                {isLoadingQuality ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Score Quality
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleDetectRisk}
                disabled={isLoadingRisk || !emailContent.trim()}
              >
                {isLoadingRisk ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Detect Risk
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {isLoadingQuality && <LoadingSkeleton variant="card" />}
          {qualityScore && !isLoadingQuality && (
            <Card variant="elevated" className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-primary" />
                  Quality Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Gauge className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sentiment</p>
                    <p className="font-semibold capitalize">{qualityScore.sentiment}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className={cn("p-4 rounded-lg text-center", getScoreBackground(qualityScore.politenessScore))}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <ThumbsUp className={cn("h-4 w-4", getScoreColor(qualityScore.politenessScore))} />
                      <span className="text-sm text-muted-foreground">Politeness</span>
                    </div>
                    <p className={cn("text-3xl font-bold", getScoreColor(qualityScore.politenessScore))}>
                      {qualityScore.politenessScore}%
                    </p>
                  </div>
                  <div className={cn("p-4 rounded-lg text-center", getScoreBackground(qualityScore.professionalismScore))}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Briefcase className={cn("h-4 w-4", getScoreColor(qualityScore.professionalismScore))} />
                      <span className="text-sm text-muted-foreground">Professionalism</span>
                    </div>
                    <p className={cn("text-3xl font-bold", getScoreColor(qualityScore.professionalismScore))}>
                      {qualityScore.professionalismScore}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoadingRisk && <LoadingSkeleton variant="card" />}
          {riskResult && !isLoadingRisk && (
            <Card variant="elevated" className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const config = getSeverityConfig(riskResult.severity);
                  const Icon = config.icon;
                  return (
                    <div className={cn("p-4 rounded-lg border", config.bg)}>
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className={cn("h-6 w-6", config.color)} />
                        <div>
                          <p className="text-sm text-muted-foreground">Severity Level</p>
                          <p className={cn("font-bold text-lg uppercase", config.color)}>
                            {riskResult.severity}
                          </p>
                        </div>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-sm font-medium mb-1">Recommendation</p>
                        <p className="text-sm text-muted-foreground">{riskResult.recommendation}</p>
                      </div>
                      {riskResult.issues && riskResult.issues.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Issues Found:</p>
                          <ul className="space-y-1">
                            {riskResult.issues.map((issue, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-destructive">•</span>
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {!qualityScore && !riskResult && !isLoadingQuality && !isLoadingRisk && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Shield className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Ready to Analyze</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Enter an email and click one of the analysis buttons to see quality scores and risk detection results.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Safety;
