import React, { useEffect, useState } from "react"
import { AudioLines, BrainCircuit, CheckCircle2, Loader2, ScanSearch, Sparkles, Timer } from "lucide-react"

interface EvaluationLoadingCardProps {
  totalSeconds?: number
  hasAudio?: boolean
  onComplete?: () => void
}

export const EvaluationLoadingCard: React.FC<EvaluationLoadingCardProps> = ({
  totalSeconds = 3,
  hasAudio = true,
  onComplete,
}) => {
  const [elapsedMs, setElapsedMs] = useState(0)
  const totalMs = totalSeconds * 1000

  useEffect(() => {
    const stepMs = 100
    const timer = setInterval(() => {
      setElapsedMs((prev) => {
        const next = prev + stepMs
        if (next >= totalMs) {
          clearInterval(timer)
          if (onComplete) onComplete()
        }
        return next
      })
    }, stepMs)

    return () => clearInterval(timer)
  }, [totalMs, onComplete])

  const remainingSeconds = Math.max(0, Math.ceil((totalMs - elapsedMs) / 1000))
  const progressPct = Math.min(100, Math.round((elapsedMs / totalMs) * 100))

  // Determine active stage
  // Stage 1 (0 to 35%): Transcribing
  // Stage 2 (35% to 75%): AI Analyzing content, fillers & delivery
  // Stage 3 (75% to 100%): Preparing feedback
  const stage =
    progressPct < 35 ? "transcribing" : progressPct < 75 ? "evaluating" : "preparing"

  return (
    <div
      style={{
        border: "1.5px solid #bfdbfe",
        borderRadius: 14,
        background: "rgba(239, 246, 255, 0.7)",
        padding: "18px 20px",
        boxShadow: "0 4px 15px rgba(59, 130, 246, 0.06)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Sparkles
            size={20}
            style={{ color: "#2563eb", animation: "pulse 1.5s infinite" }}
          />
          <div>
            <strong style={{ fontSize: 14, color: "#1e3a8a", display: "block" }}>
              Analyzing your answer…
            </strong>
            <span style={{ fontSize: 11, color: "#1d4ed8" }}>
              Fast AI pipeline in progress — hang tight!
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={() => {
              if (onComplete) onComplete()
            }}
            title="Fast forward to results"
            style={{
              background: "transparent",
              border: 0,
              color: "#3b82f6",
              fontSize: 10,
              cursor: "pointer",
              textDecoration: "underline",
              padding: "2px 4px",
            }}
          >
            Skip wait ⚡
          </button>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: 999,
              background: "#dbeafe",
              color: "#1e40af",
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "monospace",
            }}
          >
            <Timer size={13} />
            {remainingSeconds > 0 ? `~${remainingSeconds}s left` : "Done!"}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: "100%",
          height: 7,
          borderRadius: 999,
          background: "#e2e8f0",
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPct}%`,
            background: "#0f172a",
            borderRadius: 999,
            transition: "width 0.15s linear",
          }}
        />
      </div>

      {/* 3 Pipeline Checklist Stages */}
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {/* Step 1 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
          {stage === "transcribing" ? (
            <Loader2 size={16} className="spinner" style={{ color: "#2563eb" }} />
          ) : (
            <CheckCircle2 size={16} style={{ color: "#16a34a" }} />
          )}
          <AudioLines
            size={16}
            style={{ color: stage === "transcribing" ? "#1d4ed8" : "#16a34a" }}
          />
          <span
            style={{
              fontWeight: stage === "transcribing" ? 700 : 500,
              color: stage === "transcribing" ? "#1e3a8a" : "#16a34a",
            }}
          >
            Transcribing your voice with Whisper
          </span>
        </div>

        {/* Step 2 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
          {stage === "transcribing" ? (
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "2px solid #cbd5e1",
              }}
            />
          ) : stage === "evaluating" ? (
            <Loader2 size={16} className="spinner" style={{ color: "#2563eb" }} />
          ) : (
            <CheckCircle2 size={16} style={{ color: "#16a34a" }} />
          )}
          <BrainCircuit
            size={16}
            style={{
              color:
                stage === "evaluating"
                  ? "#1d4ed8"
                  : stage === "preparing"
                  ? "#16a34a"
                  : "#94a3b8",
            }}
          />
          <span
            style={{
              fontWeight: stage === "evaluating" ? 700 : 500,
              color:
                stage === "evaluating"
                  ? "#1e3a8a"
                  : stage === "preparing"
                  ? "#16a34a"
                  : "#64748b",
            }}
          >
            AI analyzing content, fillers & delivery
          </span>
        </div>

        {/* Step 3 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
          {stage === "preparing" ? (
            <Loader2 size={16} className="spinner" style={{ color: "#2563eb" }} />
          ) : (
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "2px solid #cbd5e1",
              }}
            />
          )}
          <ScanSearch
            size={16}
            style={{ color: stage === "preparing" ? "#1d4ed8" : "#94a3b8" }}
          />
          <span
            style={{
              fontWeight: stage === "preparing" ? 700 : 500,
              color: stage === "preparing" ? "#1e3a8a" : "#64748b",
            }}
          >
            Preparing your feedback — strengths, improvements & example answer
          </span>
        </div>
      </div>
    </div>
  )
}
