
export interface GlossarySuggestion {
  term: string;
  suggestedDefinition: string;
}

export interface Suggestion {
  id: string;
  category: string;
  originalSnippet: string;
  issue: string;
  suggestionSummary: string;
  rewrittenText: string;
}

export interface FinalEvaluation {
  readiness: string;
  reason: string;
}

export interface AnalysisResult {
  clarityDiagnosis: string;
  contextGaps: string;
  suggestedMetadata: string;
  dataSensitivity: string;
  glossarySuggestions: GlossarySuggestion[];
  recommendedImprovements: Suggestion[];
  finalEvaluation: FinalEvaluation;
}

export enum KanbanStatus {
  TODO = 'TODO',
  ADOPTED = 'ADOPTED',
  DISMISSED = 'DISMISSED',
}

export interface SuggestionWithStatus extends Suggestion {
  status: KanbanStatus;
}