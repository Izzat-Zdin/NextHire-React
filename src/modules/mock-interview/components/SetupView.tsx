import React from "react"
import {
  Activity,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Gauge,
  MessageSquareText,
  Play,
  ShieldCheck,
  UserRound,
  Globe,
  Smile,
} from "lucide-react"
import type { SetupConfig, InterviewType, Difficulty, Language, Persona } from "../types"
import { AVAILABLE_ROLES } from "../services/questions"
import { isSupabaseConfigured } from "@/lib/supabase"

interface SetupViewProps {
  config: SetupConfig
  onChange: (newConfig: SetupConfig) => void
  onStart: () => void
  loading?: boolean
}

export const SetupView: React.FC<SetupViewProps> = ({ config, onChange, onStart, loading }) => {
  const estMinutes = config.questionCount * 3

  const interviewTypes: { id: InterviewType; label: string; desc: string; icon: typeof UserRound }[] = [
    {
      id: "hr",
      label: "HR",
      desc: "Motivation and role fit",
      icon: UserRound,
    },
    {
      id: "behavioral",
      label: "Behavioural",
      desc: "Experiences and soft skills",
      icon: MessageSquareText,
    },
    {
      id: "technical",
      label: "Technical",
      desc: "Role-specific knowledge",
      icon: Activity,
    },
  ]

  const typeDisplayTitle =
    config.type === "hr"
      ? "HR interview"
      : config.type === "technical"
      ? "Technical interview"
      : "Behavioural interview"

  return (
    <>
      {/* Intro Header matching Screenshot */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">MODULE 3 · PRACTISE</p>
          <h1>Practise with purpose</h1>
          <p>Configure a realistic interview session and build confidence one answer at a time.</p>
        </div>
      </div>

      {/* Supabase Notice Banner */}
      <div className="prototype-note" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ShieldCheck size={18} style={{ color: "#3366e8", flexShrink: 0 }} />
        <span>
          {isSupabaseConfigured
            ? "Sesi dan jawapan teks akan disimpan ke Supabase secara langsung. AI evaluation & live speech recognition sedia aktif."
            : "Sesi dan jawapan teks disimpan selamat di local storage. Audio transcription, camera HUD, and AI evaluation are fully functional."}
        </span>
      </div>

      {/* Main Grid: Left Setup Card | Right Preview & Tips Cards */}
      <div className="content-grid wide-left">
        {/* Left Column: Set up your interview */}
        <div className="card stack">
          <strong className="section-title">Set up your interview</strong>

          {/* 3 Type Selector Cards */}
          <div className="interview-type-grid">
            {interviewTypes.map((item) => {
              const active = config.type === item.id
              const IconComp = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`type-card ${active ? "active" : ""}`}
                  onClick={() => onChange({ ...config, type: item.id })}
                >
                  <IconComp size={20} />
                  <strong>{item.label}</strong>
                  <span>{item.desc}</span>
                  {active && <CheckCircle2 size={16} />}
                </button>
              )
            })}
          </div>

          {/* Dropdown Fields */}
          <div className="form-grid">
            <label className="field">
              <span>Target job role</span>
              <select
                value={config.role}
                onChange={(e) => onChange({ ...config, role: e.target.value })}
              >
                {AVAILABLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Difficulty</span>
              <select
                value={config.difficulty}
                onChange={(e) => onChange({ ...config, difficulty: e.target.value as Difficulty })}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Number of questions</span>
              <select
                value={config.questionCount}
                onChange={(e) => onChange({ ...config, questionCount: Number(e.target.value) })}
              >
                <option value={3}>3 questions</option>
                <option value={5}>5 questions</option>
                <option value={7}>7 questions</option>
              </select>
            </label>

            <label className="field">
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Globe size={13} /> Interview language
              </span>
              <select
                value={config.language}
                onChange={(e) => onChange({ ...config, language: e.target.value as Language })}
              >
                <option value="en-US">English (Standard / US)</option>
                <option value="en-MY">English (Malaysia)</option>
                <option value="ms-MY">Bahasa Melayu (Malaysia)</option>
              </select>
            </label>
          </div>

          {/* Persona selector (Subtle bonus from ai-readiness) */}
          <div className="form-grid">
            <label className="field" style={{ gridColumn: "span 2" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Smile size={13} /> Interviewer Persona
              </span>
              <select
                value={config.persona}
                onChange={(e) => onChange({ ...config, persona: e.target.value as Persona })}
              >
                <option value="neutral">Standard Interviewer (Balanced & Professional)</option>
                <option value="friendly">Friendly HR (Warm, Encouraging & Supportive)</option>
                <option value="strict">Strict Technical Lead (Direct, Probing & Challenging)</option>
              </select>
            </label>
          </div>

          <div className="mt-4">
            <button
              type="button"
              className="btn btn-primary btn-md"
              style={{ width: "fit-content", minWidth: 190 }}
              onClick={onStart}
              disabled={loading}
            >
              <Play size={16} />
              <span>{loading ? "Preparing room..." : "Enter interview room"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Preview & Tips Cards */}
        <div className="stack">
          {/* Session preview card */}
          <div className="card session-preview">
            <span
              className="badge badge-violet"
              style={{ padding: "4px 10px", borderRadius: 999, fontSize: 10 }}
            >
              Session preview
            </span>

            <div className="preview-icon">
              <MessageSquareText size={28} />
            </div>

            <h3 style={{ margin: "4px 0 2px" }}>{typeDisplayTitle}</h3>
            <p>{config.role}</p>

            <div className="preview-facts">
              <span>
                <Gauge size={14} /> {config.difficulty}
              </span>
              <span>
                <Clock3 size={14} /> About {estMinutes} min
              </span>
              <span>
                <FileText size={14} /> {config.questionCount} questions
              </span>
            </div>
          </div>

          {/* Tips before you start card */}
          <div className="card">
            <strong className="section-title">Tips before you start</strong>
            <ul className="tips-list mt-4">
              <li>Find a quiet, well-lit space.</li>
              <li>Use specific examples and measurable outcomes.</li>
              <li>Keep most answers between 60–120 seconds.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

