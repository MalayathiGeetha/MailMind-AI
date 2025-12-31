// pages/SubjectGenerator.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { emailApi } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { Hash, Copy, Sparkles } from 'lucide-react';

const SubjectGenerator: React.FC = () => {
  const [emailContent, setEmailContent] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateSubjects = async () => {
    if (!emailContent.trim()) {
      toast({ title: 'Enter email content', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await emailApi.generateSubject({ emailContent });
      setSubjects(response.data);
      toast({ title: 'Subjects generated!', description: `${response.data.length} options created` });
    } catch (error) {
      toast({ title: 'Generation failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const copySubject = (subject: string) => {
    navigator.clipboard.writeText(subject);
    toast({ title: 'Copied to clipboard!' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
          <Hash className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subject Generator</h1>
          <p className="text-muted-foreground">AI creates click-worthy subject lines</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate subjects from your email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email Content</Label>
            <textarea
              className="w-full h-32 p-4 border rounded-xl resize-vertical focus:ring-2 focus:ring-primary/20 text-foreground bg-background"
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Describe your email..."
            />
          </div>
          <Button onClick={generateSubjects} className="w-full" disabled={isLoading}>
            {isLoading ? 'Generating...' : '✉️ Generate Subjects'}
          </Button>
        </CardContent>
      </Card>

      {subjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Subject Line Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {subjects.map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-muted to-background rounded-xl border group hover:shadow-md transition-all">
                  <span className="font-medium truncate flex-1 mr-2">{subject}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copySubject(subject)}
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubjectGenerator;

