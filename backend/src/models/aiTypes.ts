/**
 * backend/src/models/aiTypes.ts
 * 
 * TypeScript interfaces and types for AI-related data structures
 */

/**
 * AIResult
 * 
 * Represents the structured output from AI dispute analysis
 */
export interface AIResult {
  /** Brief neutral summary of the dispute */
  summaryText: string;
  
  /** List of the client's strongest arguments */
  clientStrengths: string[];
  
  /** List of the freelancer's strongest arguments */
  freelancerStrengths: string[];
  
  /** List of contradictions or inconsistencies identified */
  inconsistencies: string[];
  
  /** Suggested outcome direction based on analysis */
  suggestedOutcome: "client" | "freelancer" | "unclear";
}
