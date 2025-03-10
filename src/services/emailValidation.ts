
export interface ValidationResult {
  isValid: boolean;
  score: number;
  details: {
    spelling: { score: number; feedback: string; };
    tone: { score: number; feedback: string; };
    structure: { score: number; feedback: string; };
    similarity: { score: number; feedback: string; };
  };
  suggestions?: string[];
  totalScore: number; // Out of 10
}

// Check for spelling, punctuation, and grammar
const validateSpelling = (email: string): { score: number; feedback: string; } => {
  // Check for common spelling mistakes
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
  
  // Check for proper punctuation
  const sentences = email.match(/[^.!?]+[.!?]+/g) || [];
  const missingPunctuation = sentences.some(s => !s.trim().match(/[.!?]$/));
  
  let score = 2.5;
  let feedback = "Excellent spelling, punctuation, and grammar throughout the email.";
  
  if (hasGrammarErrors) {
    score -= 1;
    feedback = "There are some spelling or grammar errors that need correction.";
  }
  
  if (hasDoubleSpaces || hasRepeatedWords) {
    score -= 0.5;
    feedback = "Check for formatting issues like double spaces or repeated words.";
  }
  
  if (missingPunctuation) {
    score -= 0.5;
    feedback = "Some sentences are missing proper punctuation.";
  }
  
  return { score, feedback };
};

// Check for professional and empathetic tone
const validateTone = (email: string): { score: number; feedback: string; } => {
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
  
  let score = 2.5;
  let feedback = "Excellent tone balancing professionalism and empathy.";
  
  if (negativeCount > 2) {
    score -= negativeCount * 0.2;
    feedback = "The tone contains too many negative expressions which may impact customer experience.";
  }
  
  if (positiveCount < 2) {
    score -= (2 - positiveCount) * 0.3;
    feedback = "Include more positive and empathetic language to enhance customer experience.";
  }
  
  // Check if the tone is overly formal or informal
  const formalMarkers = /pursuant to|aforementioned|herewith|heretofore|hereby/gi;
  const informalMarkers = /hey there|cheers|btw|cool|awesome|gonna|wanna/gi;
  
  const formalMatches = (email.match(formalMarkers) || []).length;
  const informalMatches = (email.match(informalMarkers) || []).length;
  
  if (formalMatches > 2) {
    score -= 0.5;
    feedback = "The tone is overly formal. Consider a more balanced approach.";
  }
  
  if (informalMatches > 2) {
    score -= 0.5;
    feedback = "The tone is too casual for a professional email.";
  }
  
  return { score: Math.max(0, score), feedback };
};

// Check for proper welcome and sign off
const validateStructure = (email: string): { score: number; feedback: string; } => {
  // Check for greeting
  const hasGreeting = /^(Dear|Hello|Hi|Good morning|Good afternoon|Good evening)/im.test(email);
  
  // Check for closing
  const hasClosing = /(Thank you|Thanks|Best regards|Sincerely|Kind regards|Regards)/im.test(email);
  
  // Check for proper paragraphs
  const hasMultipleParagraphs = email.split('\n\n').length >= 2;
  
  // Check for customer name in greeting
  const hasCustomerName = /\b(mr|mrs|ms|miss|dr)\b|dear\s+\w+/i.test(email);
  
  let score = 2.5;
  let feedback = "Excellent structure with proper greeting and sign-off.";
  
  if (!hasGreeting) {
    score -= 1;
    feedback = "Missing a proper greeting at the start of the email.";
  }
  
  if (!hasClosing) {
    score -= 1;
    feedback = "Missing a professional sign-off at the end of the email.";
  }
  
  if (!hasMultipleParagraphs) {
    score -= 0.5;
    feedback = "Email should be structured with clear paragraphs for better readability.";
  }
  
  if (!hasCustomerName) {
    score -= 0.5;
    feedback = "Consider personalizing the greeting with the customer's name.";
  }
  
  return { score: Math.max(0, score), feedback };
};

// Check similarity to templates
const validateSimilarity = (email: string): { score: number; feedback: string; } => {
  // Key phrases that should be included from templates
  const keyPhrases = [
    "thank you for choosing air travel claim",
    "please be assured",
    "we will keep you informed",
    "for more information",
    "please be aware that the time it takes to settle your claim",
    "we are continuously working",
  ];
  
  // Count how many key phrases are included
  const matchedPhrases = keyPhrases.filter(phrase => 
    email.toLowerCase().includes(phrase.toLowerCase())
  );
  
  // Check if the email includes claim or booking reference
  const hasClaimReference = /claim\s+reference|reference\s+number|booking\s+reference/i.test(email);
  
  // Check if the email includes next steps
  const hasNextSteps = /next\s+steps|following\s+steps|what\s+happens\s+next|we\s+will|our\s+team\s+will/i.test(email);
  
  let score = 2.5;
  let feedback = "Excellent consistency with company templates while maintaining personalization.";
  
  // Score based on matched phrases
  if (matchedPhrases.length < 3) {
    score -= (3 - matchedPhrases.length) * 0.3;
    feedback = "The email is missing key phrases used in our standard templates.";
  }
  
  if (!hasClaimReference) {
    score -= 0.5;
    feedback = "Include a reference to the customer's claim or booking number.";
  }
  
  if (!hasNextSteps) {
    score -= 0.5;
    feedback = "Make sure to outline the next steps or what the customer can expect.";
  }
  
  return { score: Math.max(0, score), feedback };
};

// Calculate overall quality score
const calculateScore = (details: ValidationResult['details']): number => {
  const totalPoints = details.spelling.score + details.tone.score + 
                      details.structure.score + details.similarity.score;
  
  // Convert to score out of 10
  return Math.round((totalPoints / 10) * 10);
};

// Generate suggestions based on validation results
const generateSuggestions = (details: ValidationResult['details']): string[] => {
  const suggestions: string[] = [];
  
  if (details.spelling.score < 2) {
    suggestions.push(details.spelling.feedback);
  }
  
  if (details.tone.score < 2) {
    suggestions.push(details.tone.feedback);
  }
  
  if (details.structure.score < 2) {
    suggestions.push(details.structure.feedback);
  }
  
  if (details.similarity.score < 2) {
    suggestions.push(details.similarity.feedback);
  }
  
  return suggestions;
};

// Main validation function
export const validateEmail = async (email: string): Promise<ValidationResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const details = {
    spelling: validateSpelling(email),
    tone: validateTone(email),
    structure: validateStructure(email),
    similarity: validateSimilarity(email)
  };
  
  const totalScore = calculateScore(details);
  const isValid = totalScore >= 7; // Consider valid if score is at least 7 out of 10
  const suggestions = generateSuggestions(details);
  
  return {
    isValid,
    score: Math.min(100, totalScore * 10), // For backward compatibility
    details,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
    totalScore
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
