import { z } from 'zod'
import type { StudentProfile, University } from '../types.js'

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

// ─── Prompt builders ────────────────────────────────────────────────────────

const SHORTLIST_SYSTEM = `You are an expert university admissions counselor specializing in helping Central Asian high school students find universities abroad. You have deep knowledge of international admissions, scholarship opportunities, visa processes, and programs at universities in the USA, Canada, UK, Germany, and South Korea.

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
- Realistic in timelines (assume applying for the next academic intake)
- Tailored to international student requirements at this university
- Include country-specific processes (Campus France, uni-assist, OUAC, etc.) where relevant

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
    { "name": "string", "prepTime": "string (e.g. '3-4 months')", "startBy": "string (e.g. 'September 2025')" }
  ],
  "applicationSteps": [
    { "step": "string", "deadline": "string" }
  ],
  "monthlyChecklist": [
    { "month": "string (e.g. 'May 2025')", "tasks": [{ "week": 1, "task": "string", "importance": "critical" | "important" | "nice-to-have" }] }
  ],
  "parentTalkingPoints": ["string (2-3 key points: cost, timeline, why this is a real plan)"]
}`

const formatLanguages = (lp: StudentProfile['languageProficiency']): string =>
  lp.length === 0 ? 'Not specified' : lp.map((l) => `${l.test}: ${l.score}`).join(', ')

export const buildShortlistPrompt = (
  profile: StudentProfile,
): { system: string; user: string } => ({
  system: SHORTLIST_SYSTEM,
  user: `Student profile:
- Name: ${profile.name}
- Nationality: ${profile.nationality}
- GPA: ${profile.gpa}/4.0
- Intended major: ${profile.intendedMajor}
- Target countries: ${profile.targetCountries.join(', ')}
- Annual budget (USD): $${profile.budgetUSD.toLocaleString()}
- Language proficiency: ${formatLanguages(profile.languageProficiency)}
- Extracurriculars: ${profile.extracurriculars.length > 0 ? profile.extracurriculars.join('; ') : 'None listed'}
- Special circumstances: ${profile.specialCircumstances ?? 'None'}

Please recommend 3 universities for this student.`,
})

export const buildPlanPrompt = (
  profile: StudentProfile,
  university: University,
): { system: string; user: string } => ({
  system: PLAN_SYSTEM,
  user: `Student profile:
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

Please create a detailed application plan for this student.`,
})
