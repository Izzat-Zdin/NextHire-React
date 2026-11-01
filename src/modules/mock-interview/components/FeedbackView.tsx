import React from "react"
import { AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react"
import type { EvaluationResult } from "../types"
import { HighlightedTranscript } from "./HighlightedTranscript"

interface FeedbackViewProps {
  evaluation: EvaluationResult
  answerText: string
}

function ScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#1e293b",
        }}
      >
        <span>{label}</span>
        <strong style={{ fontFamily: "monospace" }}>{score}/10</strong>
      </div>
      <div
        style={{
          width: "100%",
          height: 6,
          background: "#e2e8f0",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${score * 10}%`,
            background: "#0f172a",
            borderRadius: 999,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  )
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({ evaluation, answerText }) => {
  const { scores, overallScore, strengths, weaknesses, improvements, speechMetrics } = evaluation

  const fillerData = speechMetrics?.fillerAnalysis
  const fillerRate = fillerData?.ratePer100Words ?? 0
  const fillerTotal = fillerData?.total ?? 0

  const fillerBadge =
    fillerTotal === 0 ? (
      <span
        style={{
          border: "1px solid #16a34a",
          color: "#16a34a",
          padding: "1px 8px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        Excellent
      </span>
    ) : fillerRate <= 5 ? (
      <span
        style={{
          border: "1px solid #f59e0b",
          color: "#d97706",
          padding: "1px 8px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        Needs work
      </span>
    ) : (
      <span
        style={{
          border: "1px solid #ef4444",
          color: "#dc2626",
          padding: "1px 8px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        High fillers
      </span>
    )

  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        background: "white",
        padding: "20px 22px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      {/* Overall Score Header */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 13, color: "#64748b" }}>Overall Score</span>
          <span
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              padding: "2px 10px",
              fontFamily: "monospace",
              fontSize: 14,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {overallScore}/100
          </span>
        </div>

        {/* Overall progress bar */}
        <div
          style={{
            width: "100%",
            height: 7,
            background: "#e2e8f0",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${overallScore}%`,
              background: "#0f172a",
              borderRadius: 999,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* 4 Rubric Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <ScoreRow label="Relevance" score={scores.relevance} />
        <ScoreRow label="Clarity & Structure" score={scores.clarity} />
        <ScoreRow label="Specificity" score={scores.specificity} />
        <ScoreRow label="Technical Accuracy" score={scores.technicalAccuracy} />
      </div>

      {/* Your answer (read-back) with inline highlights */}
      <HighlightedTranscript transcript={answerText} fillerAnalysis={fillerData} />

      {/* Speech analysis card */}
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          background: "#f8fafc",
          padding: "14px 16px",
          fontSize: 13,
          color: "#334155",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <strong style={{ fontSize: 13, color: "#0f172a", marginBottom: 2 }}>Speech analysis</strong>
        <div>Words: {speechMetrics?.wordCount ?? answerText.split(/\s+/).filter(Boolean).length}</div>
        <div>
          Speaking rate:{" "}
          {speechMetrics?.speakingRateWordsPerMinute
            ? `${speechMetrics.speakingRateWordsPerMinute} wpm`
            : "130.0 wpm"}
        </div>

        {/* Filler words count and chips */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
          <span>
            Filler words: <strong>{fillerTotal}</strong> ({fillerRate}/100 words)
          </span>
          {fillerBadge}
        </div>

        {fillerData && Object.keys(fillerData.perWord).length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "4px 0" }}>
            {Object.entries(fillerData.perWord).map(([word, count]) => (
              <span
                key={word}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  borderRadius: 999,
                  background: "#fee2e2",
                  color: "#b91c1c",
                  padding: "1px 8px",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                “{word}” ×{count}
              </span>
            ))}
          </div>
        )}

        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b" }}>
          {fillerTotal === 0
            ? "Clean delivery — no filler words detected."
            : fillerRate <= 5
            ? "A few fillers are natural, but try pausing silently instead of saying them."
            : "High filler word usage detected. Tip: slow down, breathe, and replace verbal pauses with 1 second of silence."}
        </p>
      </div>

      {/* What went well */}
      <div style={{ fontSize: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#16a34a",
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          <CheckCircle2 size={15} />
          <span>What went well</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: 20, color: "#334155", lineHeight: 1.6 }}>
          {strengths.map((str, i) => (
            <li key={i}>{str}</li>
          ))}
        </ul>
      </div>

      {/* Slightly off / needs polish */}
      <div style={{ fontSize: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#d97706",
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          <AlertTriangle size={15} />
          <span>Slightly off / needs polish</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: 20, color: "#334155", lineHeight: 1.6 }}>
          {weaknesses.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      </div>

      {/* How to improve next time (Blue Card) */}
      <div
        style={{
          border: "1.5px solid #93c5fd",
          borderRadius: 12,
          background: "#eff6ff",
          padding: "14px 18px",
          fontSize: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#1d4ed8",
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          <Lightbulb size={15} />
          <span>How to improve next time</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: 20, color: "#1e3a8a", lineHeight: 1.6 }}>
          {improvements.map((imp, i) => (
            <li key={i}>{imp}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

