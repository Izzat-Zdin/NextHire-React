import React, { useMemo } from "react"
import { FILLER_WORDS, detectFillers } from "../services/speechAnalysis"

interface HighlightedTranscriptProps {
  transcript: string
  title?: string
  fillerAnalysis?: {
    total: number
    perWord: Record<string, number>
    ratePer100Words: number
  }
}

export const HighlightedTranscript: React.FC<HighlightedTranscriptProps> = ({
  transcript,
  title = "Your Response",
  fillerAnalysis,
}) => {
  const activeAnalysis = useMemo(() => {
    return fillerAnalysis || detectFillers(transcript || "")
  }, [transcript, fillerAnalysis])

  const segments = useMemo(() => {
    if (!transcript) return []

    // Sort longest first so phrases like "you know" match before "you"
    const escaped = [...FILLER_WORDS]
      .sort((a, b) => b.length - a.length)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"))
    const regex = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi")

    const parts: { text: string; filler: boolean }[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(transcript)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: transcript.slice(lastIndex, match.index), filler: false })
      }
      parts.push({ text: match[0], filler: true })
      lastIndex = regex.lastIndex
    }

    if (lastIndex < transcript.length) {
      parts.push({ text: transcript.slice(lastIndex), filler: false })
    }

    return parts
  }, [transcript])

  if (!transcript) return null

  const fillerCounts = activeAnalysis?.perWord || {}
  const totalFillers = activeAnalysis?.total ?? 0

  return (
    <div
      style={{
        borderRadius: 10,
        border: "1.5px solid #e2e8f0",
        background: "#fafbfd",
        padding: "14px 16px",
        fontSize: 13,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: 8,
        }}
      >
        <span style={{ fontWeight: 700, color: "#1e293b", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <span>{title}</span>
        </span>
        {totalFillers > 0 ? (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#b91c1c",
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              padding: "2px 9px",
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>⚠️</span> {totalFillers} {totalFillers === 1 ? "filler word" : "filler words"} dikesan
          </span>
        ) : (
          <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>
            ✓ 0 filler words (pertuturan lancar)
          </span>
        )}
      </div>

      {/* Transcript with Vivid Highlight Marks on Every Filler */}
      <p style={{ lineHeight: 1.8, color: "#334155", margin: "0 0 10px" }}>
        {segments.map((seg, i) =>
          seg.filler ? (
            <mark
              key={i}
              style={{
                borderRadius: 5,
                background: "#fee2e2",
                border: "1.5px solid #ef4444",
                color: "#991b1b",
                padding: "1px 6px",
                margin: "0 2px",
                fontWeight: 700,
                display: "inline-inline",
                boxShadow: "0 1px 4px rgba(239, 68, 68, 0.15)",
              }}
              title={`Perkataan penampal: "${seg.text}" — cuba gantikan dengan jeda senyap (silent pause)`}
            >
              <span style={{ fontSize: 9, opacity: 0.8, marginRight: 2 }}>⚠️</span>
              {seg.text}
            </mark>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </p>

      {/* Bottom Summary Tags for Detected Fillers */}
      {Object.keys(fillerCounts).length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 6,
            borderTop: "1px solid #f1f5f9",
            paddingTop: 9,
          }}
        >
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginRight: 4 }}>
            Filler yang dikesan:
          </span>
          {Object.entries(fillerCounts).map(([word, count]) => (
            <span
              key={word}
              style={{
                display: "inline-flex",
                alignItems: "center",
                borderRadius: 999,
                background: "#fee2e2",
                border: "1px solid #fca5a5",
                color: "#991b1b",
                padding: "2px 9px",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              “{word}” ×{count}
            </span>
          ))}
        </div>
      )}

      {totalFillers === 0 && (
        <p style={{ margin: 0, fontSize: 11, color: "#15803d", fontWeight: 500 }}>
          ✓ Tiada sebarang perkataan filler dikesan dalam jawapan ini.
        </p>
      )}
    </div>
  )
}
