import type { InterviewType, Difficulty, Language, QuestionItem } from "../types"

export const AVAILABLE_ROLES = [
  "Associate Product Analyst",
  "Software Engineer",
  "Data Analyst",
  "Product Manager",
  "UX Designer",
  "Marketing Specialist",
  "Sales Representative",
  "Business Analyst",
  "Customer Support Specialist",
]

const QUESTIONS_EN: Record<InterviewType, Record<string, string[]>> = {
  hr: {
    default: [
      "Tell me about yourself and what specifically attracted you to this role.",
      "What are your key strengths, and what is one area you are actively working to improve?",
      "Why are you interested in joining our company over other opportunities?",
      "Describe a challenging work situation or tight deadline and how you handled the pressure.",
      "Where do you envision your career progressing in the next three to five years?",
      "How do you handle disagreements or different perspectives when working within a multidisciplinary team?",
      "What type of workplace culture and management style helps you perform at your best?",
    ],
  },
  behavioral: {
    "Associate Product Analyst": [
      "Tell me about a project where you used data or quantitative metrics to improve a product or operational process.",
      "How would you prioritize product features or bug fixes when stakeholders have competing requirements?",
      "Describe a time you received critical or difficult feedback on an analysis. How did you respond?",
      "How would you investigate and troubleshoot a sudden 15% drop in a mobile app's weekly active users?",
      "Walk me through a situation where you had to present complex findings to non-technical business leaders.",
      "Tell me about a time you identified an unmet user need and translated it into actionable user stories.",
    ],
    "Software Engineer": [
      "Describe a challenging bug or performance bottleneck you investigated and resolved in production.",
      "Tell me about a time you had to balance shipping code quickly versus maintaining clean software architecture.",
      "Walk me through a situation where you disagreed with a technical design decision. How was it resolved?",
      "Describe a project where you implemented or improved automated testing and CI/CD pipelines.",
      "Tell me about an instance where you mentored a junior engineer or championed code review best practices.",
    ],
    "Data Analyst": [
      "Walk me through an end-to-end analytics project from data extraction, cleaning, to dashboard delivery.",
      "Describe a situation where the data was messy, incomplete, or contradictory. How did you handle it?",
      "Tell me about a time your data insights directly influenced an important strategic business decision.",
      "How do you ensure data accuracy, validate assumptions, and prevent misleading statistical conclusions?",
    ],
    default: [
      "Describe a challenging project you contributed to. What was your specific role and the measurable outcome?",
      "Tell me about a time you had a conflict with a teammate or stakeholder. How did you resolve it?",
      "Give an example of an ambitious goal you set for yourself and the methodical steps you took to achieve it.",
      "Describe a time a project did not go according to plan. What lessons did you learn from the setback?",
      "Tell me about a time you had to persuade team members or clients to adopt your recommended approach.",
    ],
  },
  technical: {
    "Associate Product Analyst": [
      "What core product metrics (e.g. CAC, LTV, Retention, Churn, NPS) would you monitor for a SaaS platform and why?",
      "How would you design an A/B experiment to validate a new user onboarding flow? Explain hypothesis, sample size, and metrics.",
      "Explain the difference between leading and lagging indicators using a realistic customer funnel example.",
      "If qualitative user feedback conflicts with quantitative analytics data, how do you determine the truth?",
    ],
    "Software Engineer": [
      "Explain how RESTful API design differs from GraphQL or RPC, and when you would choose each.",
      "How do you design database indexes for high-throughput query performance, and what are the trade-offs?",
      "Describe how you handle asynchronous state management, concurrency, and caching in modern web apps.",
      "Walk through how you secure web applications against OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, auth flaws).",
    ],
    "Data Analyst": [
      "Explain the difference between OLTP and OLAP database schemas, including Star and Snowflake schemas.",
      "How do you detect anomalies or outliers in time-series data without discarding valuable signals?",
      "Walk through an advanced SQL query you wrote using Window Functions (e.g., ROW_NUMBER, LAG/LEAD, PARTITION BY).",
    ],
    default: [
      "What is the most critical technical tool or methodology in your workflow, and why do you prefer it?",
      "Explain a complex domain concept in your field as if you were explaining it to a non-technical colleague.",
      "How do you structure your problem-solving process when facing an ambiguous problem with missing information?",
      "Describe how you test, validate, and benchmark your deliverables before releasing them to stakeholders.",
    ],
  },
}

const QUESTIONS_MS: Record<InterviewType, Record<string, string[]>> = {
  hr: {
    default: [
      "Ceritakan tentang latar belakang diri anda dan mengapa anda berminat dengan jawatan ini.",
      "Apakah kekuatan utama anda, dan apakah satu aspek yang sedang anda perbaiki?",
      "Mengapa anda memilih syarikat kami berbanding peluang kerjaya lain di luar sana?",
      "Ceritakan pengalaman anda menguruskan beban tugas berat atau tarikh akhir yang sangat ketat.",
      "Di manakah anda melihat haluan kerjaya anda dalam tempoh 3 hingga 5 tahun akan datang?",
    ],
  },
  behavioral: {
    default: [
      "Ceritakan satu projek mencabar yang pernah anda kendalikan. Apakah peranan anda dan apakah hasilnya?",
      "Ceritakan pengalaman anda menghadapi perselisihan pendapat dengan rakan sepasukan dan cara anda menyelesaikannya.",
      "Berikan contoh matlamat penting yang anda sasarkan dan tindakan berdisiplin yang anda ambil untuk mencapainya.",
      "Ceritakan pengalaman anda menghadapi kegagalan atau kesilapan kerja. Apakah pengajaran yang anda peroleh?",
      "Kongsi pengalaman anda meyakinkan pihak berkepentingan (stakeholders) untuk menerima cadangan atau idea anda.",
    ],
  },
  technical: {
    default: [
      "Apakah kemahiran atau alatan teknikal paling penting untuk jawatan ini dan bagaimana anda mengaplikasikannya?",
      "Terangkan satu konsep teknikal yang sukar dengan bahasa yang mudah difahami oleh orang bukan teknikal.",
      "Bagaimanakah langkah sistematik anda apabila menyelesaikan masalah atau pepijat yang sukar dikesan?",
      "Ceritakan satu projek yang paling anda banggakan dari aspek perancangan struktur dan kualiti pelaksanaannya.",
    ],
  },
}

export function getQuestionsForSession(
  role: string,
  type: InterviewType,
  count: number,
  language: Language = "en-US",
  difficulty: Difficulty = "Intermediate"
): QuestionItem[] {
  const isMalay = language === "ms-MY"
  const bank = isMalay ? QUESTIONS_MS[type] : QUESTIONS_EN[type]
  const roleBank = bank[role] || bank["default"] || QUESTIONS_EN[type]["default"]

  // Slice to requested count
  const selected = roleBank.slice(0, count)
  
  // If count exceeds bank, cycle through
  const results: QuestionItem[] = []
  for (let i = 0; i < count; i++) {
    const text = selected[i] || roleBank[i % roleBank.length]
    results.push({
      id: `q_${type}_${i + 1}`,
      number: i + 1,
      text,
      type,
      role,
      difficulty,
    })
  }

  return results
}

export function generateProbingFollowUp(question: string, answer: string, isMalay = false): string {
  const ansLower = answer.toLowerCase()
  if (isMalay) {
    if (ansLower.includes("projek") || ansLower.includes("data") || ansLower.includes("pasukan")) {
      return "Anda menyebut tentang penglibatan dalam projek tersebut — apakah cabaran terbesar yang anda hadapi semasa melaksanakannya, dan apakah metrik kejayaan yang dicapai?"
    }
    return "Boleh anda huraikan dengan lebih spesifik langkah tindakan (Actions) yang anda ambil sendiri secara individu berbanding tugas pasukan?"
  }

  if (ansLower.includes("data") || ansLower.includes("metric") || ansLower.includes("improve") || ansLower.includes("result")) {
    return "You touched upon measurable outcomes — could you dive deeper into the specific metric you moved and how you verified it was statistically significant?"
  }
  if (ansLower.includes("team") || ansLower.includes("conflict") || ansLower.includes("stakeholder")) {
    return "You mentioned working through team dynamics — what specific communication tactic did you use to get buy-in when there was initial resistance?"
  }
  return "Could you walk me through the exact 'Action' phase using the STAR framework: what specific decisions were yours alone versus the broader team?"
}

