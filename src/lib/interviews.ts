import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { AnswerRecord, SetupConfig } from "../modules/mock-interview/types"

export interface InterviewSessionPayload {
  role: string
  interviewType: "hr" | "behavioral" | "technical"
  totalQuestions: number
  questions: string[]
  language?: string
  difficulty?: string
}

const LOCAL_STORAGE_KEY = "nexthire_mock_interview_sessions"

export function getLocalSessions(): any[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveLocalSession(session: any) {
  try {
    const sessions = getLocalSessions()
    const index = sessions.findIndex((s) => s.id === session.id)
    if (index >= 0) {
      sessions[index] = session
    } else {
      sessions.unshift(session)
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions))
  } catch (err) {
    console.warn("Failed to persist session to localStorage", err)
  }
}

export async function createInterviewSession(input: InterviewSessionPayload): Promise<string> {
  const localId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

  // Store local copy first
  saveLocalSession({
    id: localId,
    started_at: new Date().toISOString(),
    status: "in_progress",
    role: input.role,
    interview_type: input.interviewType,
    total_questions: input.totalQuestions,
    questions: input.questions,
    answers: [],
  })

  if (!isSupabaseConfigured || !supabase) {
    return localId
  }

  try {
    const { data: auth } = await supabase.auth.getUser()
    const userId = auth?.user?.id || null

    if (userId) {
      const { error: profileError } = await supabase.from("users").upsert(
        {
          user_id: userId,
          email: auth.user?.email ?? "",
          full_name:
            typeof auth.user?.user_metadata?.full_name === "string"
              ? auth.user.user_metadata.full_name
              : "NextHire Candidate",
        },
        { onConflict: "user_id", ignoreDuplicates: true }
      )
      if (profileError) console.warn("Supabase user upsert notice:", profileError.message)
    }

    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .insert({
        ...(userId ? { user_id: userId } : {}),
        role: input.role,
        interview_type: input.interviewType,
        total_questions: input.totalQuestions,
      })
      .select("session_id")
      .single()

    if (sessionError) {
      console.warn("Supabase interview_sessions insert fallback to localId:", sessionError.message)
      return localId
    }

    const sessionId = session.session_id

    const { error: questionsError } = await supabase.from("interview_questions").insert(
      input.questions.map((questionText, index) => ({
        session_id: sessionId,
        question_no: index + 1,
        question_text: questionText,
        question_type: input.interviewType,
      }))
    )

    if (questionsError) {
      console.warn("Supabase interview_questions insert warning:", questionsError.message)
    }

    return sessionId
  } catch (err) {
    console.warn("Supabase unavailable, using localId session:", err)
    return localId
  }
}

export async function saveInterviewAnswer(
  sessionId: string,
  questionNo: number,
  answerText: string,
  meta?: any
) {
  // Update local storage
  const sessions = getLocalSessions()
  const current = sessions.find((s) => s.id === sessionId)
  if (current) {
    current.answers = current.answers || []
    current.answers.push({
      question_no: questionNo,
      answer_text: answerText,
      meta,
      timestamp: new Date().toISOString(),
    })
    saveLocalSession(current)
  }

  if (!isSupabaseConfigured || !supabase || sessionId.startsWith("session_")) {
    return
  }

  try {
    const { data: question } = await supabase
      .from("interview_questions")
      .select("question_id")
      .eq("session_id", sessionId)
      .eq("question_no", questionNo)
      .single()

    if (question?.question_id) {
      await supabase.from("interview_answers").insert({
        session_id: sessionId,
        question_id: question.question_id,
        answer_text: answerText || null,
      })
    }
  } catch (err) {
    console.warn("Supabase saveInterviewAnswer notice:", err)
  }
}

export async function completeInterviewSession(sessionId: string, overallScore?: number) {
  // Update local storage
  const sessions = getLocalSessions()
  const current = sessions.find((s) => s.id === sessionId)
  if (current) {
    current.status = "completed"
    current.completed_at = new Date().toISOString()
    if (overallScore !== undefined) current.overall_score = overallScore
    saveLocalSession(current)
  }

  if (!isSupabaseConfigured || !supabase || sessionId.startsWith("session_")) {
    return
  }

  try {
    await supabase
      .from("interview_sessions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId)
  } catch (err) {
    console.warn("Supabase completeInterviewSession notice:", err)
  }
}
