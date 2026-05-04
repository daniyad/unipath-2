import { z } from 'zod'
import type { StudentProfile, University, ChatMessage } from '../types.js'

// ─── Response validation schemas ───────────────────────────────────────────

export const shortlistResponseSchema = z.object({
  universities: z
    .array(
      z.object({
        name: z.string(),
        country: z.string(),
        city: z.string(),
        program: z.string(),
        language: z.string(),
        tier: z.enum(['Reach', 'Match', 'Safety']),
        rationale: z.string(),
        tuitionUSD: z.number(),
        scholarshipPotential: z.string(),
      }),
    )
    .length(3),
})

export const planResponseSchema = z.object({
  universityName: z.string(),
  applicationDeadline: z.string(),
  portalUrl: z.string(),
  overview: z.string(),
  documents: z.array(
    z.object({
      name: z.string(),
      howToGet: z.string(),
      urgency: z.enum(['high', 'medium', 'low']),
    }),
  ),
  tests: z.array(
    z.object({
      name: z.string(),
      prepTime: z.string(),
      startBy: z.string(),
    }),
  ),
  applicationSteps: z.array(
    z.object({
      step: z.string(),
      deadline: z.string().optional(),
    }),
  ),
  monthlyChecklist: z.array(
    z.object({
      month: z.string(),
      tasks: z.array(
        z.object({
          week: z.number(),
          task: z.string(),
          importance: z.enum(['critical', 'important', 'nice-to-have']),
        }),
      ),
    }),
  ),
  parentTalkingPoints: z.array(z.string()),
})

export type ShortlistResult = z.infer<typeof shortlistResponseSchema>
export type PlanResult = z.infer<typeof planResponseSchema>

export const chatResponseSchema = z.object({
  answer: z.string(),
})
export type ChatResult = z.infer<typeof chatResponseSchema>

export interface ChatContext {
  profile: StudentProfile
  shortlistUniversities: Array<{ name: string; tier: string; tuitionUSD: number }>
  upcomingDeadlines: Array<{ universityName: string; applicationDeadline: string }>
  history: ChatMessage[]
  userMessage: string
}

// ─── Prompt builders ────────────────────────────────────────────────────────

const SHORTLIST_SYSTEM = `You are an expert university admissions counselor specializing in helping Central Asian high school students find universities abroad. You have deep knowledge of international admissions, scholarship opportunities, visa processes, and programs at universities in the UK, USA, Canada, Germany, South Korea, and UAE.

IMPORTANT: Only recommend universities located in the student's target countries. Do not suggest universities in any other country, even if they are a strong academic fit.

Recommend exactly 3 universities:
- 1 Reach: student is slightly below the typical admitted profile but has a realistic chance
- 1 Match: student meets the typical admitted profile well
- 1 Safety: student clearly exceeds requirements — near-certain admission

Always include at least one affordable or tuition-free option.

Prioritize universities that:
1. Offer strong programs in the student's intended major
2. Are within or near the student's budget, or offer substantial scholarships to close the gap
3. Are in one of the student's target countries
4. Have a track record of admitting international or Central Asian students

DEADLINE RULES — apply these strictly before recommending any university:
1. Never recommend a university where the application deadline for the target enrollment year has already passed (deadline is before today's date).
2. Never recommend a university where fewer than 90 days remain between today and the deadline — the student cannot prepare a competitive application in that time.
3. For universities with 90–180 days until the deadline, flag the tight timeline in the rationale and note the student must act immediately. Still include them if they are otherwise the best fit.
4. Prefer universities where the student has the most time to prepare.

Use web search to verify that each university's program exists, the tuition is current, and the application deadline is accurate. Drop or replace any candidate that doesn't check out.

Respond with ONLY a valid JSON object — no explanation, no markdown, no code fences:
{
  "universities": [
    {
      "name": "string",
      "country": "string",
      "city": "string",
      "program": "string",
      "language": "string (teaching language, e.g. 'English' or 'English / German')",
      "tier": "Reach" | "Match" | "Safety",
      "rationale": "string (2-3 sentences on why this fits this specific student)",
      "tuitionUSD": number,
      "scholarshipPotential": "string (brief description of scholarship opportunities)"
    }
  ]
}`

const PLAN_SYSTEM = `You are an expert university admissions counselor. Create a detailed, actionable application plan for a Central Asian student applying to a specific university.

The plan must be:
- Specific to the university and student profile provided
- Grounded in today's actual date — all months in the checklist must be today or in the future
- Tailored to international student requirements at this university
- Include country-specific processes (Campus France, uni-assist, OUAC, etc.) where relevant

CHECKLIST RULES — follow these exactly:
1. The monthlyChecklist must start from the current month and year. Never include any month that has already passed.
2. Calculate the number of months between today and the application deadline. The checklist covers exactly that window.
3. If 6+ months remain: produce a full plan covering all task types (documents, tests, essays, financial aid, visa prep).
4. If 3–6 months remain: compress the plan — prioritize 'critical' and 'important' tasks, reduce 'nice-to-have' tasks, and open the overview with a clear note that the timeline is tight and the student must act immediately.
5. If fewer than 3 months remain: focus exclusively on 'critical' tasks, open the overview with a strong warning about the compressed timeline, and note which steps may need to be rushed or done in parallel.

Use web search to verify: the application portal URL, the current application deadline, and any country-specific requirements.

For portalUrl: use web search to confirm the URL actually loads. If you can verify the exact application portal page, use it. If you cannot confirm the specific path works, use the university's top-level homepage (e.g. https://www.ouac.on.ca/ not https://www.ouac.on.ca/apply/101). If you are not confident in any URL, return an empty string — never fabricate a URL.

Respond with ONLY a valid JSON object — no explanation, no markdown, no code fences:
{
  "universityName": "string",
  "applicationDeadline": "string (e.g. 'March 31, 2026')",
  "portalUrl": "string (verified URL or empty string)",
  "overview": "string (2-3 sentence summary of what the student should know going in)",
  "documents": [
    { "name": "string", "howToGet": "string (specific to the student's home country)", "urgency": "high" | "medium" | "low" }
  ],
  "tests": [
    { "name": "string", "prepTime": "string (e.g. '3-4 months')", "startBy": "string (e.g. 'September 2026')" }
  ],
  "applicationSteps": [
    { "step": "string", "deadline": "string" }
  ],
  "monthlyChecklist": [
    { "month": "string (e.g. 'May 2026')", "tasks": [{ "week": 1, "task": "string", "importance": "critical" | "important" | "nice-to-have" }] }
  ],
  "parentTalkingPoints": ["string (2-3 key points: cost, timeline, why this is a real plan)"]
}`

const formatLanguages = (lp: StudentProfile['languageProficiency']): string =>
  lp.length === 0 ? 'Not specified' : lp.map((l) => `${l.test}: ${l.score}`).join(', ')

const formatDate = (d: Date): string =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

const langLabel = (lang: 'en' | 'ru'): string => (lang === 'ru' ? 'Russian' : 'English')

export const buildShortlistPrompt = (profile: StudentProfile): { system: string; user: string } => {
  const today = new Date()
  return {
    system: SHORTLIST_SYSTEM,
    user: `Today's date: ${formatDate(today)}
Target enrollment year: ${profile.targetYear}
Response language: ${langLabel(profile.lang)} — write the entire response (all string fields) in ${langLabel(profile.lang)}

Student profile:
- Name: ${profile.name}
- Nationality: ${profile.nationality}
- GPA: ${profile.gpa}/4.0
- Intended major: ${profile.intendedMajor}
- Target countries: ${profile.targetCountries.join(', ')}
- Annual budget (USD): $${profile.budgetUSD.toLocaleString()}
- Language proficiency: ${formatLanguages(profile.languageProficiency)}
- Extracurriculars: ${profile.extracurriculars.length > 0 ? profile.extracurriculars.join('; ') : 'None listed'}
- Special circumstances: ${profile.specialCircumstances ?? 'None'}

Please recommend 3 universities for this student. Apply the deadline rules from the system prompt strictly.`,
  }
}

const CHAT_SYSTEM = `You are Unipath, a university admissions assistant for Central Asian high school students. You answer questions strictly about university applications, admissions, deadlines, documents, tests, scholarships, and programs.

STRICT RULES:
1. If the user's message is NOT about university admissions or their application — respond with exactly one sentence redirecting them: "I can only help with university admissions questions." Do not expand on it.
2. Never fabricate deadlines, test scores, acceptance rates, or URLs. If you don't have the data, say so in one sentence.
3. Reply in the SAME language as the user's message. If they write in Russian, reply in Russian. If English, reply in English.
4. Be concise — under 200 words. No unnecessary preamble.
5. Use the student context below. Do not ask for information you already have.

Respond with ONLY a valid JSON object:
{"answer": "your response here"}`

export const buildChatPrompt = (ctx: ChatContext): { system: string } => {
  const profileBlock = [
    `Name: ${ctx.profile.name}`,
    `Nationality: ${ctx.profile.nationality}`,
    `GPA: ${ctx.profile.gpa}/4.0`,
    `Target year: ${ctx.profile.targetYear}`,
    `Major: ${ctx.profile.intendedMajor}`,
    `Countries: ${ctx.profile.targetCountries.join(', ')}`,
    `Budget: $${ctx.profile.budgetUSD.toLocaleString()}/yr`,
    `Languages: ${ctx.profile.languageProficiency.length > 0 ? ctx.profile.languageProficiency.map((l) => `${l.test} ${l.score}`).join(', ') : 'not specified'}`,
  ].join('\n')

  const shortlistBlock =
    ctx.shortlistUniversities.length > 0
      ? ctx.shortlistUniversities
          .map((u) => `- ${u.name} (${u.tier}) — $${u.tuitionUSD.toLocaleString()}/yr`)
          .join('\n')
      : 'No shortlist yet'

  const deadlineBlock =
    ctx.upcomingDeadlines.length > 0
      ? ctx.upcomingDeadlines
          .map((d) => `- ${d.universityName}: ${d.applicationDeadline}`)
          .join('\n')
      : 'No upcoming deadlines'

  return {
    system: `${CHAT_SYSTEM}

--- Student profile ---
${profileBlock}

--- Shortlist ---
${shortlistBlock}

--- Upcoming deadlines ---
${deadlineBlock}`,
  }
}

export const buildPlanPrompt = (
  profile: StudentProfile,
  university: University,
): { system: string; user: string } => {
  const today = new Date()
  const monthYear = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  return {
    system: PLAN_SYSTEM,
    user: `Today's date: ${formatDate(today)} — the monthlyChecklist must start from ${monthYear} or later, never before.
Target enrollment year: ${profile.targetYear}
Response language: ${langLabel(profile.lang)} — write the entire response (all string fields) in ${langLabel(profile.lang)}

Student profile:
- Name: ${profile.name}
- Nationality: ${profile.nationality}
- GPA: ${profile.gpa}/4.0
- Intended major: ${profile.intendedMajor}
- Annual budget (USD): $${profile.budgetUSD.toLocaleString()}
- Language proficiency: ${formatLanguages(profile.languageProficiency)}
- Extracurriculars: ${profile.extracurriculars.length > 0 ? profile.extracurriculars.join('; ') : 'None listed'}
- Special circumstances: ${profile.specialCircumstances ?? 'None'}

Target university: ${university.name} (${university.city}, ${university.country})
Program: ${university.program}
Teaching language: ${university.language}
Admission tier: ${university.tier}
Estimated tuition: $${university.tuitionUSD.toLocaleString()}/yr

Please create a detailed application plan for this student. Apply the checklist rules from the system prompt strictly — all months must be ${monthYear} or later.`,
  }
}
