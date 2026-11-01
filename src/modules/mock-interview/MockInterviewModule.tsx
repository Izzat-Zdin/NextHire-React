import React, { useState } from "react"
import type { SetupConfig, QuestionItem, AnswerRecord } from "./types"
import { SetupView } from "./components/SetupView"
import { RoomView } from "./components/RoomView"
import { ReportView } from "./components/ReportView"
import { getQuestionsForSession } from "./services/questions"
import {
  createInterviewSession,
  saveInterviewAnswer,
  completeInterviewSession,
} from "@/lib/interviews"

interface MockInterviewModuleProps {
  onNavigateTab?: (tab: string) => void
}

export const MockInterviewModule: React.FC<MockInterviewModuleProps> = ({ onNavigateTab }) => {
  const [phase, setPhase] = useState<"setup" | "room" | "report">("setup")

  const [config, setConfig] = useState<SetupConfig>({
    role: "Associate Product Analyst",
    type: "behavioral",
    difficulty: "Intermediate",
    questionCount: 5,
    language: "en-US",
    persona: "neutral",
  })

  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({})
  const [overallScore, setOverallScore] = useState<number>(82)
  const [loading, setLoading] = useState(false)

  // 1. Start Session
  const handleStartSession = async () => {
    setLoading(true)
    const sessionQuestions = getQuestionsForSession(
      config.role,
      config.type,
      config.questionCount,
      config.language,
      config.difficulty
    )
    setQuestions(sessionQuestions)

    try {
      const newSessionId = await createInterviewSession({
        role: config.role,
        interviewType: config.type,
        totalQuestions: sessionQuestions.length,
        questions: sessionQuestions.map((q) => q.text),
        language: config.language,
        difficulty: config.difficulty,
      })
      setSessionId(newSessionId)
    } catch (err) {
      console.warn("Backend session creation warning:", err)
    } finally {
      setLoading(false)
      setPhase("room")
    }
  }

  // 2. Save individual answer
  const handleSaveAnswerToBackend = async (questionNo: number, text: string) => {
    if (!sessionId) return
    try {
      await saveInterviewAnswer(sessionId, questionNo, text)
    } catch (err) {
      console.warn("Save answer warning:", err)
    }
  }

  // 3. Complete Session
  const handleFinishSession = async (
    completedAnswers: Record<string, AnswerRecord>,
    finalScore: number
  ) => {
    setAnswers(completedAnswers)
    setOverallScore(finalScore)

    if (sessionId) {
      try {
        await completeInterviewSession(sessionId, finalScore)
      } catch (err) {
        console.warn("Complete session warning:", err)
      }
    }

    setPhase("report")
  }

  // 4. Practice Again
  const handlePracticeAgain = () => {
    setAnswers({})
    setPhase("setup")
  }

  if (phase === "room") {
    return (
      <RoomView
        config={config}
        questions={questions}
        onFinishSession={handleFinishSession}
        onExit={() => setPhase("setup")}
        onSaveAnswerToBackend={handleSaveAnswerToBackend}
      />
    )
  }

  if (phase === "report") {
    return (
      <ReportView
        config={config}
        answers={answers}
        overallScore={overallScore}
        onPracticeAgain={handlePracticeAgain}
        onNavigateTab={(tab) => {
          if (onNavigateTab) onNavigateTab(tab)
          else {
            window.location.hash = tab
            window.dispatchEvent(new HashChangeEvent("hashchange"))
          }
        }}
      />
    )
  }

  // Default: Setup screen (exact screenshot interface)
  return (
    <SetupView
      config={config}
      onChange={setConfig}
      onStart={handleStartSession}
      loading={loading}
    />
  )
}

