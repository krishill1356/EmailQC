import React, { useState, useCallback, useRef } from 'react';
import { Mail, CheckCircle, XCircle, AlertTriangle, Loader2, Upload, Copy, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { validateEmail, saveValidationHistory, ValidationResult } from '@/services/emailValidation';
import MainLayout from '@/components/layout/MainLayout';
import { cn } from "@/lib/utils";

const ValidateEmail = () => {
  const [emailContent, setEmailContent] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleEmailChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEmailContent(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailContent.trim()) {
      toast({ title: "Email Content Required", description: "Please enter email content to validate.", variant: "destructive" });
      return;
    }
    setIsValidating(true);
    setValidationResult(null);
    try {
      const result = await validateEmail(emailContent.trim());
      setValidationResult(result);
      await saveValidationHistory(emailContent.trim(), result);
      toast({
        title: result.isValid ? "Good Quality Email" : "Email Needs Improvement",
        description: `The email scored ${result.totalScore}/10.`,
        variant: result.isValid ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Validation error:", error);
      toast({ title: "Validation Error", description: "An error occurred during validation. Please try again.", variant: "destructive" });
    } finally {
      setIsValidating(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setEmailContent(event.target.result);
          toast({ title: "Email Loaded", description: "Email content has been loaded from file. You can now validate it." });
        }
      };
      reader.readAsText(file);
    }
  }, [toast]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Content</CardTitle>
            <CardDescription>Enter the email content you want to validate.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Paste or type email content here..."
                value={emailContent}
                onChange={handleEmailChange}
                className="min-h-[200px] font-mono text-sm border-0 shadow-none"
                disabled={isValidating}
              />
              <Button type="submit" disabled={isValidating || !emailContent.trim()}>
                {isValidating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>) : ('Check Email Quality')}
              </Button>
            </form>
          </CardContent>
        </Card>
        {validationResult && (
          <Card>
            <CardHeader>
              <CardTitle>Validation Results</CardTitle>
              <CardDescription>Email quality assessment based on multiple criteria.</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={validationResult.totalScore * 10} max={100} className="h-2" />
              <p className="text-sm">Score: {validationResult.totalScore}/10</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ValidateEmail;
