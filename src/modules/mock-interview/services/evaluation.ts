import type { EvaluationResult, FacialMetrics, SpeechMetrics, InterviewType } from "../types"

interface EvaluateInput {
  question: string
  answer: string
  type: InterviewType
  role: string
  speechMetrics?: SpeechMetrics | null
  facialMetrics?: FacialMetrics | null
  isMalay?: boolean
}

export function evaluateAnswerLocally({
  question,
  answer,
  type,
  role,
  speechMetrics,
  facialMetrics,
  isMalay = false,
}: EvaluateInput): EvaluationResult {
  const cleanAnswer = (answer || "").trim()

  if (!cleanAnswer) {
    return {
      scores: { relevance: 0, clarity: 0, specificity: 0, technicalAccuracy: 0 },
      overallScore: 0,
      strengths: [],
      weaknesses: [isMalay ? "Tiada jawapan diberikan." : "No answer was provided."],
      improvements: [
        isMalay
          ? "Sila berikan jawapan lisan atau bertulis supaya AI dapat menganalisis prestasi anda."
          : "Provide a response so we can analyze your interview content and delivery.",
      ],
      exampleAnswer: "",
      summary: isMalay ? "Tiada jawapan dikesan." : "No answer provided.",
    }
  }

  const normalizedAnswer = cleanAnswer.toLowerCase()
  const normalizedQuestion = question.toLowerCase()
  const words = normalizedAnswer.split(/\s+/).filter(Boolean)
  const sentences = normalizedAnswer.split(/[.!?]+/).filter((s) => s.trim().length > 0)

  // 1. Relevance Score (0-10)
  const questionWords = new Set(normalizedQuestion.split(/\W+/).filter((w) => w.length > 3))
  const answerWords = new Set(words.filter((w) => w.length > 3))
  const overlap = [...questionWords].filter((w) => answerWords.has(w)).length
  let relevance = Math.min(10, Math.max(3, Math.round((overlap / Math.max(1, questionWords.size)) * 10) + 3))
  if (words.length > 25) relevance = Math.min(10, relevance + 1)

  // 2. Clarity & Structure (0-10)
  const avgSentenceLength = words.length / Math.max(1, sentences.length)
  let clarity = 6
  if (avgSentenceLength >= 6 && avgSentenceLength <= 24) clarity += 2
  if (sentences.length >= 2) clarity += 1
  if (speechMetrics && speechMetrics.fillerAnalysis.ratePer100Words > 6) clarity -= 2
  clarity = Math.min(10, Math.max(2, clarity))

  // 3. Specificity & STAR (0-10)
  const hasExample = /\b(for example|such as|like when|instance|project|team|company|client|projek|contohnya|misalnya)\b/i.test(
    cleanAnswer
  )
  const hasNumber = /\d+[%kKmM]?|\b(one|two|three|four|five|first|second)\b/i.test(cleanAnswer)
  const hasSTAR = /\b(situation|task|action|result|challenge|goal|outcome|achieved|improved|keadaan|tindakan|hasil|mencapai)\b/i.test(
    cleanAnswer
  )
  let specificity = 5
  if (hasExample) specificity += 2
  if (hasNumber) specificity += 2
  if (hasSTAR) specificity += 1
  if (words.length > 50) specificity += 1
  specificity = Math.min(10, Math.max(2, specificity))

  // 4. Technical Accuracy (0-10)
  const technicalTerms = /\b(api|database|framework|algorithm|component|architecture|deploy|test|function|class|module|schema|query|sql|server|client|json|rest|git|ci\/cd|metrics|cac|ltv|churn|retention|kpi|analytics|funnel|a\/b|sprint|scrum)\b/i
  let technicalAccuracy = type === "technical" ? 5 : 6
  if (technicalTerms.test(cleanAnswer)) technicalAccuracy += 3
  if (words.length > 40) technicalAccuracy += 1
  technicalAccuracy = Math.min(10, Math.max(2, technicalAccuracy))

  // Overall Score (0-100)
  const overallScore = Math.min(
    100,
    Math.max(
      15,
      Math.round((relevance * 0.25 + clarity * 0.25 + specificity * 0.25 + technicalAccuracy * 0.25) * 10)
    )
  )

  // Strengths
  const strengths: string[] = []
  if (isMalay) {
    if (relevance >= 7) strengths.push("Jawapan anda kekal fokus kepada soalan yang ditanya.")
    if (clarity >= 7) strengths.push("Struktur huraian tersusun dan mudah difahami.")
    if (specificity >= 7) strengths.push("Anda memberikan contoh spesifik dengan impak yang meyakinkan.")
    if (technicalAccuracy >= 7) strengths.push("Penggunaan terminologi industri yang relevan dan tepat.")
    if (strengths.length === 0) strengths.push("Percubaan yang baik; asas mesej anda telah berjaya disampaikan.")
  } else {
    if (relevance >= 7) strengths.push("Your answer directly addresses the core objective of the question.")
    if (clarity >= 7) strengths.push("Well-structured phrasing with clear transitions between key points.")
    if (specificity >= 7) strengths.push("You backed your points with tangible actions and measurable outcomes.")
    if (technicalAccuracy >= 7) strengths.push("Effective use of domain terminology and methodical logic.")
    if (strengths.length === 0) strengths.push("Good effort; the foundational concept of your answer is clear.")
  }

  // Weaknesses
  const weaknesses: string[] = []
  if (isMalay) {
    if (words.length < 35) weaknesses.push("Huraian agak ringkas — penemuduga mengharapkan perincian yang lebih mendalam.")
    if (specificity < 6) weaknesses.push("Kurang contoh metrik atau angka kuantitatif untuk membuktikan hasil.")
    if (speechMetrics && speechMetrics.fillerAnalysis.ratePer100Words > 5) {
      weaknesses.push(`Kadar perkataan 'filler' agak tinggi (${speechMetrics.fillerAnalysis.total} perkataan penampal).`)
    }
  } else {
    if (words.length < 35) weaknesses.push("The answer is relatively brief; interviewers expect deeper context.")
    if (specificity < 6) weaknesses.push("Lacks concrete metrics, KPIs, or quantitative evidence of impact.")
    if (speechMetrics && speechMetrics.fillerAnalysis.ratePer100Words > 5) {
      weaknesses.push(`High filler word frequency (${speechMetrics.fillerAnalysis.total} fillers detected).`)
    }
    if (speechMetrics?.speakingRateWordsPerMinute && speechMetrics.speakingRateWordsPerMinute > 175) {
      weaknesses.push(`Speaking pace was hurried (${speechMetrics.speakingRateWordsPerMinute} WPM).`)
    }
  }

  // Improvements
  const improvements: string[] = []
  if (isMalay) {
    improvements.push("Gunakan formula STAR (Situation, Task, Action, Result) secara berurutan.")
    if (specificity < 7) improvements.push("Sertakan sekurang-kurangnya satu metrik bernombor (cth: 'meningkatkan kecekapan sebanyak 25%').")
    if (speechMetrics && speechMetrics.fillerAnalysis.ratePer100Words > 4) {
      improvements.push("Gantikan perkataan 'um/err/macam' dengan jeda senyap (pause) 1 saat.")
    }
  } else {
    improvements.push("Structure your thoughts using the STAR method: Situation → Task → Action → Result.")
    if (specificity < 7) improvements.push("Include at least one measurable KPI (e.g. 'improved user retention by 18%').")
    if (speechMetrics && speechMetrics.fillerAnalysis.ratePer100Words > 4) {
      improvements.push("Replace verbal fillers with a confident 1-second silent pause.")
    }
    if (improvements.length < 3) {
      improvements.push("Close your answer by summarizing the key takeaway or lesson learned.")
    }
  }

  // Model STAR Answer
  const exampleAnswer = isMalay
    ? `Dalam peranan terdahulu saya, pasukan menghadapi penurunan penglibatan pengguna sebanyak 12%. Saya memimpin analisis kohort untuk mengenal pasti titik rintangan dalam proses onboarding, kemudian mencadangkan 3 penambahbaikan UI berimpak tinggi. Hasilnya, kadar pengekalan pengguna meningkat 18% dalam tempoh suku pertama.`
    : `In my previous role, our team noticed a 15% drop-off during the checkout funnel. I conducted an exploratory funnel audit, identified friction on mobile input fields, and partnered with engineering to implement one-click autofill. Within six weeks, checkout completion rebounded by 22%, driving an additional $45,000 in monthly ARR.`

  const summary = isMalay
    ? `Prestasi keseluruhannya adalah ${overallScore >= 75 ? "cemerlang" : overallScore >= 55 ? "baik dengan ruang peningkatan" : "memerlukan latihan lanjut"}. Skor keseluruhan dinilai pada ${overallScore}/100.`
    : `Overall evaluation: ${overallScore >= 75 ? "Strong, credible response" : overallScore >= 55 ? "Solid foundation with actionable room for depth" : "Needs further structured practice"}. Assessed score: ${overallScore}/100.`

  return {
    scores: {
      relevance,
      clarity,
      specificity,
      technicalAccuracy,
    },
    overallScore,
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    improvements: improvements.slice(0, 3),
    exampleAnswer,
    summary,
    speechMetrics: speechMetrics || undefined,
    facialMetrics: facialMetrics || undefined,
  }
}

