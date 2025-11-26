/**
 * backend/src/utils/promptBuilder.ts
 * 
 * Utility functions for constructing AI prompts
 */

/**
 * buildDisputePrompt
 * 
 * Constructs a structured prompt for AI analysis of dispute cases
 * 
 * @param input - Dispute context and evidence
 * @param input.projectDescription - Description of the overall project
 * @param input.milestoneDescription - Description of the disputed milestone
 * @param input.clientStatement - Client's dispute statement/reason
 * @param input.freelancerStatement - Freelancer's response/statement
 * @param input.evidenceFiles - Array of evidence file names or IPFS CIDs
 * @returns Structured prompt string for LLM
 */
export function buildDisputePrompt({
  projectDescription,
  milestoneDescription,
  clientStatement,
  freelancerStatement,
  evidenceFiles,
}: {
  projectDescription: string;
  milestoneDescription: string;
  clientStatement: string;
  freelancerStatement: string;
  evidenceFiles: string[];
}): string {
  // Format evidence list
  const evidenceSummary = evidenceFiles.length > 0
    ? `Evidence files provided:\n${evidenceFiles.map((file, idx) => `${idx + 1}. ${file}`).join('\n')}`
    : 'No evidence files provided';

  // Construct deterministic, structured prompt
  return `
You are an impartial dispute resolution analyst for a freelance platform. Your role is to analyze dispute cases objectively and provide structured guidance.

**CRITICAL INSTRUCTIONS:**
- Analyze only the information provided below
- Do NOT fabricate details or make assumptions beyond the given facts
- Do NOT generate code or technical implementations
- Do NOT access or reference private keys, secrets, or sensitive data
- Provide deterministic, structured analysis only

---

**PROJECT CONTEXT:**
${projectDescription}

**MILESTONE DESCRIPTION:**
${milestoneDescription}

**CLIENT'S STATEMENT:**
${clientStatement}

**FREELANCER'S STATEMENT:**
${freelancerStatement}

**EVIDENCE:**
${evidenceSummary}

---

**YOUR ANALYSIS TASKS:**

1. **SUMMARIZE THE DISPUTE:**
   - Provide a brief, neutral summary of the core issue
   - Identify the main point of disagreement

2. **COMPARE STATEMENTS:**
   - What key claims does the client make?
   - What key claims does the freelancer make?
   - Where do the statements align?
   - Where do the statements diverge?

3. **IDENTIFY CONTRADICTIONS:**
   - List specific contradictions between the two accounts
   - Note any inconsistencies within each party's statement
   - Highlight factual discrepancies

4. **EVALUATE EVIDENCE RELEVANCE:**
   - How does the provided evidence relate to the dispute?
   - Does the evidence support the client's claims, the freelancer's claims, or neither?
   - What key evidence appears to be missing?

5. **ASSESS DELIVERABLES:**
   - Based on the milestone description, what deliverables were expected?
   - What deliverables does each party claim were/were not provided?
   - Are there incomplete or partially completed deliverables?
   - Are there quality concerns mentioned by either party?

6. **RECOMMEND DIRECTION:**
   - Based solely on the information provided, which direction seems most appropriate:
     * "approve" - Evidence suggests milestone requirements were substantially met
     * "reject" - Evidence suggests milestone requirements were not met
     * "partial" - Mixed evidence, both parties have valid concerns
   - Provide reasoning for your recommendation
   - Note any critical information gaps that prevent a definitive assessment

---

**OUTPUT FORMAT:**
Respond in valid JSON format with the following structure:

{
  "summaryText": "Brief neutral summary of the dispute (2-3 sentences)",
  "clientStrengths": ["Key strength 1", "Key strength 2"],
  "freelancerStrengths": ["Key strength 1", "Key strength 2"],
  "inconsistencies": ["Inconsistency 1", "Inconsistency 2"],
  "suggestedOutcome": "approve" | "reject" | "partial"
}

**IMPORTANT:**
- Keep all fields concise and factual
- Base analysis strictly on provided information
- Do not add speculative or fabricated details
- Ensure valid JSON syntax
`.trim();
}
