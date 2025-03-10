
import React, { useState } from 'react';
import { Mail, CheckCircle, XCircle, AlertTriangle, Loader2, FileText, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { validateEmail, saveValidationHistory, ValidationResult, emailTemplates } from '@/services/emailValidation';
import MainLayout from '@/components/layout/MainLayout';

const ValidateEmail = () => {
  const [emailContent, setEmailContent] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
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
          ? `The email passed quality check with a score of ${result.score}/100.` 
          : `The email needs improvement with a score of ${result.score}/100.`,
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
    if (score >= 80) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 50) return "Needs Improvement";
    return "Poor";
  };

  const getStatusIcon = (status: boolean) => {
    return status 
      ? <CheckCircle className="h-5 w-5 text-green-500" /> 
      : <XCircle className="h-5 w-5 text-red-500" />;
  };

  const loadTemplate = (template: keyof typeof emailTemplates) => {
    setEmailContent(emailTemplates[template]);
    toast({
      title: "Template Loaded",
      description: "You can now edit the template before validating.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailContent);
    toast({
      title: "Copied to Clipboard",
      description: "Email content has been copied to your clipboard.",
    });
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
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Load Template:</div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => loadTemplate('update')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Update Template
                </Button>
                <Button variant="outline" size="sm" onClick={() => loadTemplate('received')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Documents Received
                </Button>
                <Button variant="outline" size="sm" onClick={() => loadTemplate('payment')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Payment Update
                </Button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="Paste or type email content here..."
                  value={emailContent}
                  onChange={handleEmailChange}
                  className="min-h-[200px] font-mono text-sm"
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
              
              <div className="flex justify-end">
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
                  We're checking structure, tone, clarity, grammar, and more...
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {validationResult && (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
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
                      <span className="text-sm font-medium">Quality Score: {validationResult.score}/100</span>
                      <span className="text-sm font-medium">{getScoreText(validationResult.score)}</span>
                    </div>
                    <Progress 
                      value={validationResult.score} 
                      max={100}
                      className="h-2"
                      indicatorClassName={getScoreColor(validationResult.score)}
                    />
                  </div>
                  
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {validationResult.isValid 
                        ? "This email meets the quality standards for customer communication. It uses appropriate structure, tone, and contains all necessary information." 
                        : "This email needs improvement in some areas to meet quality standards for customer communication."
                      }
                    </p>
                    {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                      <div className="mt-3 flex items-start">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          {validationResult.suggestions[0]}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="details" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quality Check Details</CardTitle>
                  <CardDescription>
                    Detailed results of each quality check
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-center justify-between p-3 rounded-md bg-muted">
                      <div>
                        <h4 className="font-medium">Email Structure</h4>
                        <p className="text-sm text-muted-foreground">Proper greeting, body, and closing</p>
                      </div>
                      {getStatusIcon(validationResult.details.structure)}
                    </li>
                    
                    <li className="flex items-center justify-between p-3 rounded-md bg-muted">
                      <div>
                        <h4 className="font-medium">Clarity & Conciseness</h4>
                        <p className="text-sm text-muted-foreground">Clear language with appropriate sentence length</p>
                      </div>
                      {getStatusIcon(validationResult.details.clarity)}
                    </li>
                    
                    <li className="flex items-center justify-between p-3 rounded-md bg-muted">
                      <div>
                        <h4 className="font-medium">Tone & Empathy</h4>
                        <p className="text-sm text-muted-foreground">Professional and customer-focused language</p>
                      </div>
                      {getStatusIcon(validationResult.details.tone)}
                    </li>
                    
                    <li className="flex items-center justify-between p-3 rounded-md bg-muted">
                      <div>
                        <h4 className="font-medium">Grammar & Spelling</h4>
                        <p className="text-sm text-muted-foreground">Correct grammar, spelling, and punctuation</p>
                      </div>
                      {getStatusIcon(validationResult.details.grammar)}
                    </li>
                    
                    <li className="flex items-center justify-between p-3 rounded-md bg-muted">
                      <div>
                        <h4 className="font-medium">Completeness</h4>
                        <p className="text-sm text-muted-foreground">Includes all necessary information</p>
                      </div>
                      {getStatusIcon(validationResult.details.completeness)}
                    </li>
                    
                    <li className="flex items-center justify-between p-3 rounded-md bg-muted">
                      <div>
                        <h4 className="font-medium">Personalization</h4>
                        <p className="text-sm text-muted-foreground">Customized to the specific customer and claim</p>
                      </div>
                      {getStatusIcon(validationResult.details.personalization)}
                    </li>
                    
                    <li className="flex items-center justify-between p-3 rounded-md bg-muted">
                      <div>
                        <h4 className="font-medium">Branding Consistency</h4>
                        <p className="text-sm text-muted-foreground">Proper company representation and signature</p>
                      </div>
                      {getStatusIcon(validationResult.details.branding)}
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="suggestions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Suggestions & Improvements</CardTitle>
                  <CardDescription>
                    Recommendations to improve email quality
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
