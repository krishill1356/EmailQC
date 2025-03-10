import React, { useState } from 'react';
import { Mail, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { validateEmail, saveValidationHistory, ValidationResult } from '@/services/emailValidation';
import MainLayout from '@/components/layout/MainLayout';

const ValidateEmail = () => {
  const [email, setEmail] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const { toast } = useToast();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to validate.",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    
    try {
      const result = await validateEmail(email.trim());
      setValidationResult(result);
      
      // Save to history
      await saveValidationHistory(email.trim(), result);
      
      // Show toast notification
      toast({
        title: result.isValid ? "Valid Email" : "Invalid Email",
        description: result.isValid 
          ? `The email "${email}" passed validation with a score of ${result.score}/100.` 
          : `The email "${email}" failed validation with a score of ${result.score}/100.`,
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
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  const getStatusIcon = (status: boolean) => {
    return status 
      ? <CheckCircle className="h-5 w-5 text-green-500" /> 
      : <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Validate Email</h1>
          <p className="text-muted-foreground mt-2">
            Check email quality, deliverability, and compliance with best practices.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Email Validation</CardTitle>
            <CardDescription>
              Enter an email address to validate its quality and deliverability.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={handleEmailChange}
                    className="pl-10"
                    disabled={isValidating}
                  />
                </div>
                <Button type="submit" disabled={isValidating || !email.trim()}>
                  {isValidating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    'Validate Email'
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
                <Loader2 className="h-12 w-12 animate-spin text-email-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Validating Email</h3>
                <p className="text-muted-foreground max-w-md">
                  We're checking format, DNS records, deliverability, and more...
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
                        <span>Email is Valid</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span>Email is Invalid</span>
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
                      {email} {validationResult.isValid 
                        ? "is a valid email address that meets quality standards." 
                        : "has quality issues that may affect deliverability."
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
                  <CardTitle>Validation Details</CardTitle>
                  <CardDescription>
                    Detailed results of each validation check
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-center justify-between p-3 rounded-md bg-muted">
                      <div>
                        <h4 className="font-medium">Email Format</h4>
                        <p className="text-sm text-muted-foreground">Checks if the email follows the correct syntax</p>
                      </div>
                      {getStatusIcon(validationResult.details.format)}
                    </li>
                    
                    <li className="flex items-center justify-between p-3 rounded-md bg-muted">
                      <div>
                        <h4 className="font-medium">DNS Records</h4>
                        <p className="text-sm text-muted-foreground">Verifies if the domain exists and has valid DNS records</p>
                      </div>
                      {getStatusIcon(validationResult.details.dns)}
                    </li>
                    
                    <li className="flex items-center justify-between p-3 rounded-md bg-muted">
                      <div>
                        <h4 className="font-medium">Disposable Email</h4>
                        <p className="text-sm text-muted-foreground">Checks if the email is from a disposable provider</p>
                      </div>
                      {getStatusIcon(!validationResult.details.disposable)}
                    </li>
                    
                    <li className="flex items-center justify-between p-3 rounded-md bg-muted">
                      <div>
                        <h4 className="font-medium">Spam Patterns</h4>
                        <p className="text-sm text-muted-foreground">Examines if the email contains spam-like patterns</p>
                      </div>
                      {getStatusIcon(!validationResult.details.spam)}
                    </li>
                    
                    <li className="flex items-center justify-between p-3 rounded-md bg-muted">
                      <div>
                        <h4 className="font-medium">Deliverability</h4>
                        <p className="text-sm text-muted-foreground">Assesses if the email is likely to be deliverable</p>
                      </div>
                      {getStatusIcon(validationResult.details.deliverable)}
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
                        This email address meets all quality standards and best practices. No improvements needed.
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
