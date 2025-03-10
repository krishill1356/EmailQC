
import React, { useState, useCallback } from 'react';
import { Mail, CheckCircle, XCircle, AlertTriangle, Loader2, Upload, Copy, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { validateEmail, saveValidationHistory, ValidationResult } from '@/services/emailValidation';
import MainLayout from '@/components/layout/MainLayout';
import { cn } from "@/lib/utils";

const ValidateEmail = () => {
  const [emailContent, setEmailContent] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleEmailChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEmailContent(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailContent.trim()) {
      toast({
        title: "Email Content Required",
        description: "Please enter email content to validate.",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    
    try {
      const result = await validateEmail(emailContent.trim());
      setValidationResult(result);
      
      // Save to history
      await saveValidationHistory(emailContent.trim(), result);
      
      // Show toast notification
      toast({
        title: result.isValid ? "Good Quality Email" : "Email Needs Improvement",
        description: result.isValid 
          ? `The email scored ${result.totalScore}/10.` 
          : `The email needs improvement with a score of ${result.totalScore}/10.`,
        variant: result.isValid ? "default" : "destructive",
      });
      
    } catch (error) {
      console.error("Validation error:", error);
      toast({
        title: "Validation Error",
        description: "An error occurred during validation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreText = (score: number) => {
    if (score >= 9) return "Excellent";
    if (score >= 8) return "Very Good";
    if (score >= 7) return "Good";
    if (score >= 6) return "Fair";
    if (score >= 5) return "Needs Improvement";
    return "Poor";
  };

  const getCriteriaScore = (score: number) => {
    return Math.round((score / 2.5) * 10) / 10;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailContent);
    toast({
      title: "Copied to Clipboard",
      description: "Email content has been copied to your clipboard.",
    });
  };

  // File drop handlers
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
          toast({
            title: "Email Loaded",
            description: "Email content has been loaded from file. You can now validate it.",
          });
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "Error Reading File",
          description: "There was an error reading the file. Please try again.",
          variant: "destructive",
        });
      };
      
      reader.readAsText(file);
    }
  }, [toast]);

  // Handle file upload via input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setEmailContent(event.target.result);
          toast({
            title: "Email Loaded",
            description: "Email content has been loaded from file. You can now validate it.",
          });
        }
      };
      
      reader.readAsText(file);
    }
  };

  const renderCriteriaCard = (title: string, description: string, score: number, feedback: string) => {
    const scoreOutOf10 = getCriteriaScore(score);
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>{title}</span>
            <span className={cn("px-2 py-1 rounded text-white text-sm", getScoreColor(scoreOutOf10 * 2))}>
              {scoreOutOf10}/2.5
            </span>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{feedback}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email QC Check</h1>
          <p className="text-muted-foreground mt-2">
            Analyze and improve emails sent to clients and airlines before sending.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Email Content</CardTitle>
            <CardDescription>
              Enter the email content you want to validate for quality and compliance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div 
                className={cn(
                  "relative border-2 border-dashed rounded-md transition-colors", 
                  isDragging ? "border-primary bg-primary/10" : "border-gray-300"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isDragging && (
                  <div className="absolute inset-0 bg-primary/5 flex items-center justify-center rounded-md z-10">
                    <div className="text-center">
                      <Upload className="h-10 w-10 text-primary mx-auto mb-2" />
                      <p className="text-primary font-medium">Drop your email file here</p>
                    </div>
                  </div>
                )}
                <Textarea
                  placeholder="Paste or type email content here... or drag and drop an email file"
                  value={emailContent}
                  onChange={handleEmailChange}
                  className="min-h-[200px] font-mono text-sm border-0 shadow-none"
                  disabled={isValidating}
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-2 top-2"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>Upload email file</span>
                    </div>
                    <input 
                      id="file-upload" 
                      type="file" 
                      accept=".txt,.md,.eml" 
                      className="hidden" 
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                <Button type="submit" disabled={isValidating || !emailContent.trim()}>
                  {isValidating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Check Email Quality'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {isValidating && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Analyzing Email</h3>
                <p className="text-muted-foreground max-w-md">
                  We're checking spelling, tone, structure, and template consistency...
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {!isValidating && !validationResult && (
          <Tabs defaultValue="guidance" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="guidance">QC Guidance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="guidance" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="h-5 w-5 text-blue-500 mr-2" />
                    <span>Email Quality Control Criteria</span>
                  </CardTitle>
                  <CardDescription>
                    Our email quality assessment is based on these key criteria
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-lg mb-2">1. Spelling, Punctuation & Grammar (2.5 points)</h3>
                      <p className="text-sm text-muted-foreground">
                        Emails should be free of spelling errors, use correct punctuation, and follow proper grammar rules.
                        Common errors to avoid include double spaces, repeated words, missing punctuation, and improper capitalization.
                        Professionally written emails reflect attention to detail and company standards.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-lg mb-2">2. Tone & Empathy (2.5 points)</h3>
                      <p className="text-sm text-muted-foreground">
                        Communication should balance professionalism with empathy. Avoid negative expressions and use positive, supportive language.
                        The tone should not be overly formal or informal, but appropriate for the context.
                        Show understanding of the customer's situation and convey willingness to help.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-lg mb-2">3. Welcome & Sign Off (2.5 points)</h3>
                      <p className="text-sm text-muted-foreground">
                        Emails should begin with an appropriate greeting that includes the customer's name when possible.
                        They should end with a professional sign-off such as "Thank you," "Best regards," or "Sincerely."
                        The email should be structured with clear paragraphs for better readability.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-lg mb-2">4. Template Consistency (2.5 points)</h3>
                      <p className="text-sm text-muted-foreground">
                        Emails should include key phrases and information consistent with company templates.
                        Reference to the customer's claim or booking number should be included when relevant.
                        Next steps or what the customer can expect should be clearly outlined.
                        The content should match approved company messaging while maintaining personalization.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-muted">
                      <h3 className="font-medium text-lg mb-2">Overall Score Interpretation</h3>
                      <ul className="space-y-2 text-sm">
                        <li><span className="font-medium">9-10:</span> Excellent - Meets all standards with minimal to no issues</li>
                        <li><span className="font-medium">8-8.9:</span> Very Good - Meets most standards with minor issues</li>
                        <li><span className="font-medium">7-7.9:</span> Good - Acceptable quality with some improvements needed</li>
                        <li><span className="font-medium">6-6.9:</span> Fair - Multiple issues that need addressing</li>
                        <li><span className="font-medium">5-5.9:</span> Needs Improvement - Significant issues affecting quality</li>
                        <li><span className="font-medium">Below 5:</span> Poor - Major issues requiring immediate correction</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
        
        {validationResult && (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="suggestions">Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {validationResult.isValid ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Email Meets Quality Standards</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span>Email Needs Improvement</span>
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Overall quality score and summary
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Quality Score: {validationResult.totalScore}/10</span>
                      <span className="text-sm font-medium">{getScoreText(validationResult.totalScore)}</span>
                    </div>
                    <Progress 
                      value={validationResult.totalScore * 10} 
                      max={100}
                      className={cn("h-2", getScoreColor(validationResult.totalScore))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <span>Spelling & Grammar</span>
                        <span className={cn("ml-auto px-2 py-0.5 rounded text-white text-xs", 
                          getScoreColor(validationResult.details.spelling.score * 4))}>
                          {getCriteriaScore(validationResult.details.spelling.score)}/2.5
                        </span>
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {validationResult.details.spelling.feedback}
                      </p>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <span>Tone & Empathy</span>
                        <span className={cn("ml-auto px-2 py-0.5 rounded text-white text-xs", 
                          getScoreColor(validationResult.details.tone.score * 4))}>
                          {getCriteriaScore(validationResult.details.tone.score)}/2.5
                        </span>
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {validationResult.details.tone.feedback}
                      </p>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <span>Welcome & Sign Off</span>
                        <span className={cn("ml-auto px-2 py-0.5 rounded text-white text-xs", 
                          getScoreColor(validationResult.details.structure.score * 4))}>
                          {getCriteriaScore(validationResult.details.structure.score)}/2.5
                        </span>
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {validationResult.details.structure.feedback}
                      </p>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <span>Template Consistency</span>
                        <span className={cn("ml-auto px-2 py-0.5 rounded text-white text-xs", 
                          getScoreColor(validationResult.details.similarity.score * 4))}>
                          {getCriteriaScore(validationResult.details.similarity.score)}/2.5
                        </span>
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {validationResult.details.similarity.feedback}
                      </p>
                    </div>
                  </div>
                  
                  {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                    <div className="rounded-lg bg-muted p-4">
                      <h4 className="font-medium mb-2">Key Improvement Area</h4>
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          {validationResult.suggestions[0]}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="details" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quality Assessment Details</CardTitle>
                  <CardDescription>
                    Breakdown of score by criteria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderCriteriaCard(
                    "Spelling, Punctuation & Grammar",
                    "Assessing technical correctness of the email",
                    validationResult.details.spelling.score,
                    validationResult.details.spelling.feedback
                  )}
                  
                  {renderCriteriaCard(
                    "Tone & Empathy",
                    "Evaluating the language and emotional impact",
                    validationResult.details.tone.score,
                    validationResult.details.tone.feedback
                  )}
                  
                  {renderCriteriaCard(
                    "Welcome & Sign Off",
                    "Checking for proper greeting and closing",
                    validationResult.details.structure.score,
                    validationResult.details.structure.feedback
                  )}
                  
                  {renderCriteriaCard(
                    "Template Consistency",
                    "Comparing with approved company templates",
                    validationResult.details.similarity.score,
                    validationResult.details.similarity.feedback
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="suggestions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>
                    Specific improvements to enhance email quality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {validationResult.suggestions && validationResult.suggestions.length > 0 ? (
                    <ul className="space-y-3">
                      {validationResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start p-3 rounded-md bg-muted">
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                          <span className="text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <h3 className="text-lg font-medium mb-2">No Issues Found</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        This email meets all quality standards and best practices. No improvements needed.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
};

export default ValidateEmail;
