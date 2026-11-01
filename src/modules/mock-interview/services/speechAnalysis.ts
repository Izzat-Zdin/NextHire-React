import type { SpeechMetrics } from "../types"

export const FILLER_WORDS = [
  // English fillers, vocal hesitations & pauses
  "um",
  "umm",
  "ummm",
  "uh",
  "uhh",
  "uhhh",
  "ah",
  "ahh",
  "ahhh",
  "aah",
  "er",
  "err",
  "errr",
  "erm",
  "ermm",
  "hmm",
  "hmmm",
  "aaa",
  "eee",
  "like",
  "you know",
  "i mean",
  "sort of",
  "kind of",
  "basically",
  "actually",
  // Malay vocal hesitations & colloquial fillers
  "ha",
  "haa",
  "haah",
  "mmm",
  "kot",
  "tahu tak",
  "macam",
  "apa tu",
  "apa ni",
  "apa benda",
  "apa nama",
  "tu lah",
]

export function detectFillers(transcript: string): {
  total: number
  perWord: Record<string, number>
  ratePer100Words: number
} {
  if (!transcript || !transcript.trim()) {
    return { total: 0, perWord: {}, ratePer100Words: 0 }
  }

  const text = ` ${transcript.toLowerCase().replace(/[.,!?;:'"-]/g, " ")} `
  const totalWords = text.trim().split(/\s+/).filter(Boolean).length
  const counts: Record<string, number> = {}
  let total = 0

  for (const phrase of FILLER_WORDS) {
    const regex = new RegExp(`(?<=^|\\s)${phrase.replace(/\s+/g, "\\s+")}(?=$|\\s)`, "gi")
    const matches = (text.match(regex) || []).length

    if (phrase === "like") {
      // Exclude "like" followed by common articles/determiners
      const falsePositiveRegex = /\blike\s+(a|an|the|this|that|these|those|my|your|his|her|our|their|its|to|of|in|on|at|for|with)\b/gi
      const falsePositives = (text.match(falsePositiveRegex) || []).length
      const adjusted = Math.max(0, matches - falsePositives)
      if (adjusted > 0) {
        counts[phrase] = adjusted
        total += adjusted
      }
    } else if (matches > 0) {
      counts[phrase] = matches
      total += matches
    }
  }

  return {
    total,
    perWord: counts,
    ratePer100Words: totalWords > 0 ? Number(((total / totalWords) * 100).toFixed(1)) : 0,
  }
}

export function analyzeTranscript(transcript: string, durationSeconds: number): SpeechMetrics {
  const words = transcript.trim().split(/\s+/).filter(Boolean)
  const fillerAnalysis = detectFillers(transcript)
  const duration = Math.max(1, Number(durationSeconds) || 1)

  const speakingRate = Number((words.length / (duration / 60)).toFixed(1))

  return {
    wordCount: words.length,
    durationSeconds: Math.round(duration),
    speakingRateWordsPerMinute: speakingRate,
    fillerAnalysis,
  }
}
