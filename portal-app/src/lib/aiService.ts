// Mock AI Service for Requirements Intelligence Portal

import { Requirement } from './store';

export interface AIAnalysisResult {
  extractedGoals: string;
  extractedScope: string;
  constraints: string;
  dependencies: string;
  risks: string;
  missingFields: string[];
  clarificationQuestions: string[];
  readinessScore: number;
}

export interface AIRecommendation {
  id: string;
  type: 'scope_creep' | 'conflict' | 'general';
  suggestion: string;
  status: 'pending' | 'accepted' | 'edited' | 'rejected';
}

/**
 * Mocks an AI extraction process based on raw input text.
 */
export async function analyzeRequirementInput(rawInput: string, roleType: 'freelancer' | 'pm'): Promise<AIAnalysisResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock logic: detect some missing fields based on input length or keywords
      const missingFields = [];
      const questions = [];
      let score = 85;

      if (!rawInput.toLowerCase().includes('budget')) {
        missingFields.push('budget');
        questions.push('What is the allocated budget for this requirement?');
        score -= 15;
      }
      if (!rawInput.toLowerCase().includes('timeline') && !rawInput.toLowerCase().includes('due')) {
        missingFields.push('timeline');
        questions.push('Is there a strict deadline or timeline for delivery?');
        score -= 15;
      }

      if (rawInput.length < 50) {
        questions.push('Can you provide more specific details about the deliverables?');
        score -= 20;
      }

      const isPM = roleType === 'pm';

      resolve({
        extractedGoals: isPM ? 'Align stakeholder expectations and deliver core features.' : 'Complete requested client deliverables within constraints.',
        extractedScope: rawInput.slice(0, 100) + (rawInput.length > 100 ? '...' : ''),
        constraints: 'Standard company policies apply.',
        dependencies: isPM ? 'Requires sign-off from Legal and Marketing.' : 'Needs client assets before starting.',
        risks: score < 70 ? 'High risk due to missing information.' : 'Low risk.',
        missingFields,
        clarificationQuestions: questions,
        readinessScore: Math.max(0, score),
      });
    }, 1500); // simulate network delay
  });
}

/**
 * Generates recommendations like scope creep or stakeholder conflicts.
 */
export async function generateRecommendations(req: Partial<Requirement>): Promise<AIRecommendation[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const recs: AIRecommendation[] = [];
      
      if (req.roleType === 'freelancer' && req.budget && req.budget < 5000 && (req.extractedScope?.length || 0) > 200) {
        recs.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'scope_creep',
          suggestion: 'The requested scope appears too large for the allocated budget. Consider revising the budget or reducing deliverables.',
          status: 'pending'
        });
      }

      if (req.roleType === 'pm' && req.rawInput?.toLowerCase().includes('urgent') && req.priority === 'low') {
        recs.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'conflict',
          suggestion: 'Stakeholder mentioned "urgent", but priority is set to Low. Review priority level.',
          status: 'pending'
        });
      }

      resolve(recs);
    }, 1000);
  });
}
