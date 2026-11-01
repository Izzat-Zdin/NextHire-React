export type InterviewType = "hr" | "behavioral" | "technical"

export type Difficulty = "Beginner" | "Intermediate" | "Advanced"

export type Persona = "neutral" | "friendly" | "strict"

export type Language = "en-US" | "en-MY" | "ms-MY"

export interface SetupConfig {
  role: string
  type: InterviewType
  difficulty: Difficulty
  questionCount: number
  language: Language
  persona: Persona
}

export interface QuestionItem {
  id: string
  number: number
  text: string
  type: InterviewType
  role: string
  difficulty: Difficulty
}

export interface RubricScores {
  relevance: number
  clarity: number
  specificity: number
  technicalAccuracy: number
}

export interface SpeechMetrics {
  wordCount: number
  durationSeconds: number
  speakingRateWordsPerMinute: number | null
  fillerAnalysis: {
    total: number
    perWord: Record<string, number>
    ratePer100Words: number
  }
}

export interface FacialMetrics {
  nervousPercent: number
  dominantExpression: string
}

export interface EvaluationResult {
  scores: RubricScores
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
  exampleAnswer: string
  summary: string
  speechMetrics?: SpeechMetrics
  facialMetrics?: FacialMetrics
}

export interface AnswerRecord {
  questionId: string
  questionNumber: number
  questionText: string
  answerText: string
  audioBlobUrl?: string | null
  mediaFileName?: string | null
  durationSeconds: number
  evaluation?: EvaluationResult | null
  retried?: boolean
  previousAttempt?: {
    answerText: string
    overallScore: number
    fillerCount: number
    speakingRate: number | null
    nervousPercent: number
  } | null
  followUpQuestion?: string | null
  followUpAnswer?: string | null
}

export interface InterviewSessionData {
  id: string
  startedAt: string
  completedAt?: string
  config: SetupConfig
  questions: QuestionItem[]
  answers: Record<string, AnswerRecord>
  overallScore?: number
}

