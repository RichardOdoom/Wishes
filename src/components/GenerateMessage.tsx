"use client";

import { useState } from 'react';
import { generateBirthdayMessage } from '@/ai/flows/generate-birthday-message';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Copy, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

interface GenerateMessageProps {
  profileDescription: string;
}

export default function GenerateMessage({ profileDescription }: GenerateMessageProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const result = await generateBirthdayMessage({ profileDescription });
      setMessage(result.birthdayMessage);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "Couldn't generate a message. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    toast({
      title: "Copied to clipboard!",
      description: "Your birthday message is ready to be shared.",
    });
  };

  return (
    <Card className="bg-background/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-primary-foreground/80">
          <Sparkles className="text-primary h-5 w-5" />
          AI Message Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? 'Generating...' : 'Generate a birthday message'}
          </Button>
          {isLoading && (
             <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
             </div>
          )}
          {message && (
            <div className="relative">
              <Textarea
                readOnly
                value={message}
                className="w-full h-32 resize-none"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
