export type PollMode = "design" | "poker" | "review";

export interface Question {
  id: string;
  text: string;
  recommendation?: string;
  options?: string[]; // for structured A/B choices
}

export interface Response {
  responderId: string;
  name?: string;
  answers: Record<string, { selected?: string; freeform?: string }>;
  submittedAt: string;
}

export interface Poll {
  id: string;
  mode: PollMode;
  title: string;
  context: string;
  questions: Question[];
  responses: Response[];
  createdAt: string;
  consensusReport?: string;
}
