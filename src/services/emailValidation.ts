
export interface ValidationResult {
  isValid: boolean;
  score: number;
  details: {
    format: boolean;
    dns: boolean;
    disposable: boolean;
    spam: boolean;
    deliverable: boolean;
  };
  suggestions?: string[];
  errors?: string[];
}

// List of common disposable email domains
const disposableDomains = [
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  'tempinbox.com',
  'yopmail.com',
  'sharklasers.com',
  '10minutemail.com',
  'trashmail.com',
  'mailnesia.com',
  'throwawaymail.com',
];

// Simple email format validation using regex
const validateEmailFormat = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Check if domain is disposable
const isDisposable = (email: string): boolean => {
  const domain = email.split('@')[1].toLowerCase();
  return disposableDomains.includes(domain);
};

// Simulating a DNS check
const checkDNS = (email: string): boolean => {
  const domain = email.split('@')[1].toLowerCase();
  
  // Simulated DNS check - in a real app, this would make an actual DNS lookup
  // For this demo, we'll consider most domains valid, except a few known invalid ones
  const invalidDomains = ['invalid.com', 'notreal.org', 'fakeemail.net'];
  return !invalidDomains.includes(domain);
};

// Simulated spam check
const isSpamLikely = (email: string): boolean => {
  // In a real app, this would check against spam databases or use ML models
  // For this demo, we'll use some simple heuristics
  const localPart = email.split('@')[0].toLowerCase();
  
  // Check for spam-like patterns in the local part
  return (
    localPart.includes('admin') ||
    localPart.includes('info') ||
    localPart.includes('noreply') ||
    localPart.includes('spam') ||
    localPart.includes('test')
  );
};

// Simulated deliverability check
const isDeliverable = (email: string): boolean => {
  // In a real app, this would make actual SMTP connections or use an email verification API
  // For this demo, we'll return true for most emails
  const domain = email.split('@')[1].toLowerCase();
  const nonDeliverabeDomains = ['example.com', 'test.com', 'domain.com'];
  
  return !nonDeliverabeDomains.includes(domain);
};

// Calculate overall quality score
const calculateScore = (details: ValidationResult['details']): number => {
  let score = 0;
  
  if (details.format) score += 20;
  if (details.dns) score += 20;
  if (!details.disposable) score += 20;
  if (!details.spam) score += 20;
  if (details.deliverable) score += 20;
  
  return score;
};

// Generate suggestions based on validation results
const generateSuggestions = (email: string, details: ValidationResult['details']): string[] => {
  const suggestions: string[] = [];
  
  if (!details.format) {
    suggestions.push('Email format is invalid. Please check for typos.');
  }
  
  if (!details.dns) {
    suggestions.push('The domain appears to be invalid or non-existent.');
  }
  
  if (details.disposable) {
    suggestions.push('Disposable email addresses may have deliverability issues.');
  }
  
  if (details.spam) {
    suggestions.push('This email address matches patterns commonly used in spam.');
  }
  
  if (!details.deliverable) {
    suggestions.push('This email address may not be deliverable.');
  }
  
  return suggestions;
};

// Main validation function
export const validateEmail = async (email: string): Promise<ValidationResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const formatValid = validateEmailFormat(email);
  
  // If format is invalid, return early
  if (!formatValid) {
    return {
      isValid: false,
      score: 0,
      details: {
        format: false,
        dns: false,
        disposable: false,
        spam: false,
        deliverable: false,
      },
      suggestions: ['Email format is invalid. Please check for typos.'],
    };
  }
  
  // If format is valid, perform the rest of the checks
  const details = {
    format: formatValid,
    dns: checkDNS(email),
    disposable: isDisposable(email),
    spam: isSpamLikely(email),
    deliverable: isDeliverable(email),
  };
  
  const score = calculateScore(details);
  const isValid = score >= 60; // Consider valid if score is at least 60
  const suggestions = generateSuggestions(email, details);
  
  return {
    isValid,
    score,
    details,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
};

// Mock function to save validation history
export const saveValidationHistory = async (email: string, result: ValidationResult): Promise<boolean> => {
  // In a real app, this would save to a database
  // For this demo, we'll just simulate a successful save
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get existing history from localStorage or initialize new array
  const historyStr = localStorage.getItem('emailValidationHistory');
  const history = historyStr ? JSON.parse(historyStr) : [];
  
  // Add new entry
  history.push({
    email,
    result,
    timestamp: new Date().toISOString(),
  });
  
  // Save back to localStorage
  localStorage.setItem('emailValidationHistory', JSON.stringify(history));
  
  return true;
};

// Mock function to get validation history
export const getValidationHistory = async (): Promise<Array<{email: string, result: ValidationResult, timestamp: string}>> => {
  // In a real app, this would fetch from a database
  // For this demo, we'll just return what's in localStorage
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const historyStr = localStorage.getItem('emailValidationHistory');
  return historyStr ? JSON.parse(historyStr) : [];
};
