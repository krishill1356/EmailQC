
export interface ValidationResult {
  isValid: boolean;
  score: number;
  details: {
    structure: boolean;
    clarity: boolean;
    tone: boolean;
    grammar: boolean;
    completeness: boolean;
    personalization: boolean;
    branding: boolean;
  };
  suggestions?: string[];
  errors?: string[];
}

// Check if email has proper structure (greeting, body, closing)
const validateStructure = (email: string): boolean => {
  // Check for greeting, body paragraphs, and closing signature
  const hasGreeting = /^(Dear|Hello|Hi|Good morning|Good afternoon|Good evening)/im.test(email);
  const hasClosing = /(Thank you|Thanks|Best regards|Sincerely|Kind regards|Regards)/im.test(email);
  const hasMultipleParagraphs = email.split('\n\n').length >= 2;
  
  return hasGreeting && hasClosing && hasMultipleParagraphs;
};

// Check for clarity and conciseness
const validateClarity = (email: string): boolean => {
  // Check for overly long sentences
  const sentences = email.match(/[^.!?]+[.!?]+/g) || [];
  const longSentences = sentences.filter(s => s.split(' ').length > 25).length;
  
  // Check for complex words and jargon
  const complexWords = [
    'utilize', 'implementation', 'subsequently', 'aforementioned', 
    'nevertheless', 'notwithstanding', 'endeavor'
  ];
  const hasComplexWords = complexWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(email));
  
  return longSentences <= 2 && !hasComplexWords;
};

// Check for professional and empathetic tone
const validateTone = (email: string): boolean => {
  // Check for negative or unprofessional terms
  const negativeTerms = [
    'unfortunately', 'regret to inform', 'impossible', 'cannot', 'refuse', 
    'denied', 'reject', 'failed', 'won\'t', 'don\'t', 'complaint', 'sorry'
  ];
  
  const negativeCount = negativeTerms.reduce((count, term) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const matches = email.match(regex) || [];
    return count + matches.length;
  }, 0);
  
  // Check for empathetic and positive language
  const positiveTerms = [
    'understand', 'appreciate', 'assist', 'help', 'support', 'resolve', 
    'ensure', 'pleased', 'happy to', 'thank you', 'value'
  ];
  
  const positiveCount = positiveTerms.reduce((count, term) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const matches = email.match(regex) || [];
    return count + matches.length;
  }, 0);
  
  return negativeCount <= 2 && positiveCount >= 2;
};

// Check for grammar and spelling
const validateGrammar = (email: string): boolean => {
  // Simple grammar checks (very basic implementation)
  const commonErrors = [
    'their is', 'there are', 'your welcome', 'it\'s self', 'alot', 
    'seperate', 'definately', 'recieve', 'accomodate', 'occured'
  ];
  
  const hasGrammarErrors = commonErrors.some(error => 
    new RegExp(`\\b${error}\\b`, 'i').test(email)
  );
  
  // Check for double spaces and repeated words
  const hasDoubleSpaces = email.includes('  ');
  const hasRepeatedWords = /\b(\w+)\s+\1\b/i.test(email);
  
  return !hasGrammarErrors && !hasDoubleSpaces && !hasRepeatedWords;
};

// Check for completeness and necessary information
const validateCompleteness = (email: string): boolean => {
  // Check for key claim information markers
  const hasClaimReference = /claim\s+reference|reference\s+number|booking\s+reference/i.test(email);
  const hasNextSteps = /next\s+steps|following\s+steps|what\s+happens\s+next|we\s+will|our\s+team\s+will/i.test(email);
  const hasContactInfo = /contact|reach\s+us|call|phone|email|support@|questions/i.test(email);
  
  return hasClaimReference && hasNextSteps && hasContactInfo;
};

// Check for personalization
const validatePersonalization = (email: string): boolean => {
  // Check for customer name and specific claim details
  const hasCustomerName = /\b(mr|mrs|ms|miss|dr)\b|dear\s+\w+/i.test(email);
  const hasSpecificDetails = /your\s+(claim|flight|booking|case|request)/i.test(email);
  
  return hasCustomerName && hasSpecificDetails;
};

// Check for consistent branding
const validateBranding = (email: string): boolean => {
  // Check for Air Travel Claim branding elements
  const hasCompanyName = /air\s+travel\s+claim/i.test(email);
  const hasSignature = /thank\s+you\s+for\s+choosing\s+air\s+travel\s+claim/i.test(email);
  
  return hasCompanyName && hasSignature;
};

// Calculate overall quality score
const calculateScore = (details: ValidationResult['details']): number => {
  let score = 0;
  
  if (details.structure) score += 15;
  if (details.clarity) score += 15;
  if (details.tone) score += 15;
  if (details.grammar) score += 15;
  if (details.completeness) score += 15;
  if (details.personalization) score += 15;
  if (details.branding) score += 10;
  
  return score;
};

// Generate suggestions based on validation results
const generateSuggestions = (email: string, details: ValidationResult['details']): string[] => {
  const suggestions: string[] = [];
  
  if (!details.structure) {
    suggestions.push('Improve email structure by including a clear greeting, body with paragraphs, and professional closing.');
  }
  
  if (!details.clarity) {
    suggestions.push('Enhance clarity by using shorter sentences and simpler language.');
  }
  
  if (!details.tone) {
    suggestions.push('Adjust tone to be more positive and empathetic, focusing on solutions rather than problems.');
  }
  
  if (!details.grammar) {
    suggestions.push('Review for grammar and spelling errors, including spacing and repeated words.');
  }
  
  if (!details.completeness) {
    suggestions.push('Include all necessary information: claim reference, next steps, and contact details.');
  }
  
  if (!details.personalization) {
    suggestions.push('Personalize the email with the customer\'s name and specific details about their claim.');
  }
  
  if (!details.branding) {
    suggestions.push('Incorporate consistent Air Travel Claim branding and standard signature.');
  }
  
  return suggestions;
};

// Main validation function
export const validateEmail = async (email: string): Promise<ValidationResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const details = {
    structure: validateStructure(email),
    clarity: validateClarity(email),
    tone: validateTone(email),
    grammar: validateGrammar(email),
    completeness: validateCompleteness(email),
    personalization: validatePersonalization(email),
    branding: validateBranding(email)
  };
  
  const score = calculateScore(details);
  const isValid = score >= 70; // Consider valid if score is at least 70
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

// Sample templates for reference
export const emailTemplates = {
  update: `Dear [Customer Name],

Thank you for reaching out for an update. We appreciate your patience as we work on your claim.

[Specific content about claim status]

Please be aware that the time it takes to settle your claim can be influenced by several factors. Each airline has its own strategies, workloads, and in some cases, tactics designed to delay, frustrate, or avoid settling claims. While it may sometimes appear that progression is slow, we want to assure you that we are continuously working to achieve the best possible outcome for you. We regularly review and refine our own strategies to effectively combat these airline tactics and ensure your claim is pursued diligently and efficiently. Thank you for your patience and trust in our efforts on your behalf.

Please be assured that we will keep you informed as your claim progresses and we have new information for you. To ensure you receive these updates, add support@email.airtravelclaim.com to your contacts list. Occasionally, emails may be filtered into your junk or spam folders, so we recommend checking those regularly.

For more information, be sure to check out our frequently asked questions section, where we have answers to common concerns and next steps. We're here to make the process smooth and stress-free.

Thank you for choosing Air Travel Claim.`,

  received: `Dear [Customer Name],

Thank you for submitting the additional information required for your claim. We have successfully received your documents, and they have been forwarded to our case processing team for review. Should we require any further details, we will be in touch with you directly. We appreciate your cooperation in helping us progress your claim efficiently.

Please be aware that the time it takes to settle your claim can be influenced by several factors. Each airline has its own strategies, workloads, and in some cases, tactics designed to delay, frustrate, or avoid settling claims. While it may sometimes appear that progression is slow, we want to assure you that we are continuously working to achieve the best possible outcome for you. We regularly review and refine our own strategies to effectively combat these airline tactics and ensure your claim is pursued diligently and efficiently. Thank you for your patience and trust in our efforts on your behalf.

Please be assured that we will keep you informed as your claim progresses and we have new information for you. To ensure you receive these updates, add support@email.airtravelclaim.com to your contacts list. Occasionally, emails may be filtered into your junk or spam folders, so we recommend checking those regularly.

For more information, be sure to check out our frequently asked questions section, where we have answers to common concerns and next steps. We're here to make the process smooth and stress-free.

Thank you for choosing Air Travel Claim.`,

  payment: `Dear [Customer Name],

We have made you aware that your claim has been successful. The next step is for us to receive the funds from the airline. While airlines typically send payment within 28 days of agreeing a settlement, delays can occasionally occur. Please rest assured that we are actively chasing the airline for payment on your behalf. Once we have received the funds, we aim to distribute them within a week and will contact you to confirm once your payment has been processed.

If you've already provided your bank details, sit back and relax your payment will be on its way to you usually within 14 days of receiving your compensation from the airline.

If you have not provided your details yet? No problem! Keep an eye on your inbox as we'll be reaching out shortly with a simple, secure way to provide this information. We're committed to ensuring this process is quick and seamless for you.

For more information, be sure to check out our frequently asked questions section, where we have answers to common concerns and next steps. We're here to make the process smooth and stress-free.

Thank you for choosing Air Travel Claim.`
};
