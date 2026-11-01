import React, { useState } from "react"
import {
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Download,
  Gauge,
  Lightbulb,
  MessageSquareText,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"
import type { AnswerRecord, SetupConfig } from "../types"
import { HighlightedTranscript } from "./HighlightedTranscript"

interface ReportViewProps {
  config: SetupConfig
  answers: Record<string, AnswerRecord>
  overallScore: number
  onPracticeAgain: () => void
  onNavigateTab: (tab: string) => void
}

export const ReportView: React.FC<ReportViewProps> = ({
  config,
  answers,
  overallScore,
  onPracticeAgain,
  onNavigateTab,
}) => {
  const answerList = Object.values(answers)
  const totalQuestions = answerList.length

  // Accordion state for question review
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  // Compute averages
  const validEvaluations = answerList
    .map((a) => a.evaluation)
    .filter((e): e is NonNullable<typeof e> => !!e)

  const avgRelevance = validEvaluations.length
    ? Math.round(
        (validEvaluations.reduce((sum, e) => sum + e.scores.relevance, 0) /
          validEvaluations.length) *
          10
      )
    : 80

  const avgClarity = validEvaluations.length
    ? Math.round(
        (validEvaluations.reduce((sum, e) => sum + e.scores.clarity, 0) /
          validEvaluations.length) *
          10
      )
    : 82

  const avgSpecificity = validEvaluations.length
    ? Math.round(
        (validEvaluations.reduce((sum, e) => sum + e.scores.specificity, 0) /
          validEvaluations.length) *
          10
      )
    : 75

  const avgTechnical = validEvaluations.length
    ? Math.round(
        (validEvaluations.reduce((sum, e) => sum + e.scores.technicalAccuracy, 0) /
          validEvaluations.length) *
          10
      )
    : 85

  const totalFillers = validEvaluations.reduce(
    (sum, e) => sum + (e.speechMetrics?.fillerAnalysis.total || 0),
    0
  )

  const readinessTier =
    overallScore >= 80
      ? { label: "Interview Ready", color: "green", desc: "Strong candidacy with polished delivery." }
      : overallScore >= 65
      ? { label: "Competitive", color: "violet", desc: "Good foundation; minor STAR refinements needed." }
      : { label: "Developing", color: "amber", desc: "Needs further structured practice with concrete metrics." }

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }} className="stack">
      {/* Intro Header */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">MODULE 3 · REPORT</p>
          <h1>Interview Performance Report</h1>
          <p>
            Comprehensive analysis of your responses for {config.role} ({config.type} track).
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn btn-secondary btn-md" onClick={() => window.print()}>
            <Download size={15} /> Export PDF
          </button>
          <button type="button" className="btn btn-primary btn-md" onClick={onPracticeAgain}>
            <RotateCcw size={15} /> Practice Again
          </button>
        </div>
      </div>

      {/* Hero Score Banner */}
      <div className="hero" style={{ minHeight: 180, padding: "28px 34px" }}>
        <div>
          <span className="badge badge-violet" style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>
            COMPLETED SESSION
          </span>
          <h1 style={{ fontSize: 28, margin: "10px 0 6px" }}>{readinessTier.label}</h1>
          <p style={{ maxWidth: 520, margin: 0, color: "#d2daf0", fontSize: 13 }}>
            {readinessTier.desc} You answered all {totalQuestions} questions for the {config.role} role.
          </p>
        </div>

        <div className="hero-score">
          <div className="score-ring score-violet" style={{ "--score": `${overallScore * 3.6}deg` } as any}>
            <div>
              <strong>{overallScore}</strong>
              <span>READINESS</span>
            </div>
          </div>
          <div>
            <strong>Performance Score</strong>
            <span>Based on 4-factor rubric</span>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="icon-box icon-blue">
            <Gauge size={20} />
          </div>
          <div>
            <p>Relevance Rate</p>
            <strong>{avgRelevance}%</strong>
            <small>Direct question alignment</small>
          </div>
        </div>

        <div className="card stat-card">
          <div className="icon-box icon-violet">
            <BarChart3 size={20} />
          </div>
          <div>
            <p>Clarity & Structure</p>
            <strong>{avgClarity}%</strong>
            <small>Coherent communication</small>
          </div>
        </div>

        <div className="card stat-card">
          <div className="icon-box icon-green">
            <Target size={20} />
          </div>
          <div>
            <p>STAR Specificity</p>
            <strong>{avgSpecificity}%</strong>
            <small>Measurable outcomes cited</small>
          </div>
        </div>

        <div className="card stat-card">
          <div className="icon-box icon-amber">
            <Lightbulb size={20} />
          </div>
          <div>
            <p>Filler Words</p>
            <strong>{totalFillers} words</strong>
            <small>Total hesitation count</small>
          </div>
        </div>
      </div>

      {/* Rubric Breakdown Grid */}
      <div className="content-grid">
        <div className="card stack">
          <strong className="section-title">Core Competencies Breakdown</strong>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10 }}>
            <div>
              <div className="row-between" style={{ fontSize: 12, marginBottom: 5 }}>
                <span>Relevance to Question</span>
                <strong>{avgRelevance}%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill progress-blue" style={{ width: `${avgRelevance}%` }} />
              </div>
            </div>

            <div>
              <div className="row-between" style={{ fontSize: 12, marginBottom: 5 }}>
                <span>Clarity & STAR Structure</span>
                <strong>{avgClarity}%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill progress-violet" style={{ width: `${avgClarity}%` }} />
              </div>
            </div>

            <div>
              <div className="row-between" style={{ fontSize: 12, marginBottom: 5 }}>
                <span>Data & Metrics Evidence</span>
                <strong>{avgSpecificity}%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill progress-green" style={{ width: `${avgSpecificity}%` }} />
              </div>
            </div>

            <div>
              <div className="row-between" style={{ fontSize: 12, marginBottom: 5 }}>
                <span>Domain Technical Accuracy</span>
                <strong>{avgTechnical}%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill progress-blue" style={{ width: `${avgTechnical}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Action Plan */}
        <div className="card stack">
          <strong className="section-title">Recommended Action Plan</strong>
          <div className="timeline" style={{ marginTop: 8 }}>
            <div className="timeline-item">
              <span>1</span>
              <div>
                <strong>Sharpen Quantitative Metrics</strong>
                <p>Quantify project results with exact percentages and timelines in Module 4.</p>
              </div>
            </div>

            <div className="timeline-item">
              <span>2</span>
              <div>
                <strong>Minimize Filler Words</strong>
                <p>Practice silent 1-second pauses instead of "um" or "like" before answering.</p>
              </div>
            </div>

            <div className="timeline-item">
              <span>3</span>
              <div>
                <strong>Deepen Technical Case Studies</strong>
                <p>Review role-specific architectural trade-offs in Module 5 learning tracks.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question-By-Question Detailed Review */}
      <div className="card stack">
        <strong className="section-title">Question-by-Question Analysis</strong>
        <p style={{ color: "#6d7891", fontSize: 12, margin: "2px 0 14px" }}>
          Expand each question to review your transcript, score, and AI recommendations.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {answerList.map((item, idx) => {
            const isExpanded = expandedIndex === idx
            const score = item.evaluation?.overallScore ?? 75

            return (
              <div
                key={item.questionId || idx}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: isExpanded ? "#f8fafc" : "white",
                  transition: "background 0.2s ease",
                }}
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    background: "transparent",
                    border: 0,
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: "#eff3ff",
                        color: "#3366e8",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      0{idx + 1}
                    </span>
                    <strong style={{ fontSize: 13, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.questionText}
                    </strong>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <span
                      className={`badge ${score >= 75 ? "badge-green" : score >= 60 ? "badge-violet" : "badge-amber"}`}
                    >
                      Score: {score}/100
                    </span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Accordion Body */}
                {isExpanded && (
                  <div style={{ padding: "0 18px 18px", borderTop: "1px solid #e2e8f0" }} className="stack">
                    {/* Transcript / Answer with Vivid Filler Word Highlighting */}
                    <div style={{ marginTop: 12 }}>
                      <HighlightedTranscript
                        transcript={item.answerText}
                        title="Your Response"
                        fillerAnalysis={item.evaluation?.speechMetrics?.fillerAnalysis}
                      />
                    </div>

                    {/* AI Feedback */}
                    {item.evaluation && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div style={{ fontSize: 11 }}>
                          <strong style={{ color: "#166534", display: "block", marginBottom: 3 }}>
                            What went well
                          </strong>
                          <ul style={{ margin: 0, paddingLeft: 16, color: "#334155", lineHeight: 1.5 }}>
                            {item.evaluation.strengths.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>

                        <div style={{ fontSize: 11 }}>
                          <strong style={{ color: "#9a3412", display: "block", marginBottom: 3 }}>
                            How to improve
                          </strong>
                          <ul style={{ margin: 0, paddingLeft: 16, color: "#334155", lineHeight: 1.5 }}>
                            {item.evaluation.improvements.map((imp, i) => (
                              <li key={i}>{imp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <button type="button" className="btn btn-secondary btn-md" onClick={onPracticeAgain}>
          <RotateCcw size={15} /> Practice Another Session
        </button>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary btn-md"
            onClick={() => onNavigateTab("assessment")}
          >
            Go to Readiness Assessment <ArrowRight size={15} />
          </button>
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={() => onNavigateTab("learning")}
          >
            View Learning Tracks <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

