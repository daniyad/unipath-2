import { z } from 'zod'
import type { StudentProfile, University } from '../types.js'

// ─── Response validation schemas ───────────────────────────────────────────

export const shortlistResponseSchema = z.object({
  universities: z
    .array(
      z.object({
        name: z.string(),
        country: z.string(),
        program: z.string(),
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
  documents: z.array(
    z.object({
      name: z.string(),
      deadline: z.string().optional(),
      notes: z.string().optional(),
    }),
  ),
  tests: z.array(
    z.object({
      name: z.string(),
      targetScore: z.string().optional(),
      deadline: z.string().optional(),
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
      tasks: z.array(z.string()),
    }),
  ),
  parentTalkingPoints: z.array(z.string()),
})

export type ShortlistResult = z.infer<typeof shortlistResponseSchema>
export type PlanResult = z.infer<typeof planResponseSchema>

// ─── Prompt builders ────────────────────────────────────────────────────────

const SHORTLIST_SYSTEM = `You are an expert university admissions counselor specializing in helping Central Asian high school students find universities abroad. You have deep knowledge of international admissions, scholarship opportunities, and programs in countries commonly chosen by Central Asian students (USA, UK, Germany, Netherlands, Czech Republic, Turkey, Russia, South Korea, UAE, and others).

Recommend exactly 3 universities:
- 1 Reach: student is slightly below the typical admitted profile but has a realistic chance
- 1 Match: student meets the typical admitted profile well
- 1 Safety: student clearly exceeds requirements — near-certain admission

Prioritize universities that:
1. Offer strong programs in the student's intended major
2. Are within or near the student's budget, or offer substantial scholarships to close the gap
3. Are in one of the student's target countries
4. Have a track record of admitting international or Central Asian students
5. Offer scholarships or financial aid to international applicants where possible

Respond with ONLY a valid JSON object — no explanation, no markdown, no code fences:
{
  "universities": [
    {
      "name": "string",
      "country": "string",
      "program": "string",
      "tier": "Reach" | "Match" | "Safety",
      "rationale": "string (2-3 sentences on why this is a good fit)",
      "tuitionUSD": number,
      "scholarshipPotential": "string (brief description of scholarship opportunities)"
    }
  ]
}`

const PLAN_SYSTEM = `You are an expert university admissions counselor. Create a detailed, actionable application plan for a Central Asian student applying to a specific university.

The plan must be:
- Specific to the university and student profile provided
- Realistic in timelines (assume applying for the next academic intake)
- Tailored to international student requirements at the given university
- Actionable with clear, concrete next steps

Include language test requirements appropriate for the destination country (e.g., IELTS/TOEFL for English-speaking countries, Goethe/TestDaF for Germany).

Respond with ONLY a valid JSON object — no explanation, no markdown, no code fences:
{
  "universityName": "string",
  "documents": [
    { "name": "string", "deadline": "string", "notes": "string" }
  ],
  "tests": [
    { "name": "string", "targetScore": "string", "deadline": "string" }
  ],
  "applicationSteps": [
    { "step": "string", "deadline": "string" }
  ],
  "monthlyChecklist": [
    { "month": "string", "tasks": ["string"] }
  ],
  "parentTalkingPoints": ["string"]
}`

function formatLanguageProficiency(lp: StudentProfile['languageProficiency']): string {
  if (lp.length === 0) return 'Not specified'
  return lp.map((l) => `${l.test}: ${l.score}`).join(', ')
}

export function buildShortlistPrompt(profile: StudentProfile): { system: string; user: string } {
  const user = `Student profile:
- Name: ${profile.name}
- Nationality: ${profile.nationality}
- GPA: ${profile.gpa}/4.0
- Intended major: ${profile.intendedMajor}
- Target countries: ${profile.targetCountries.join(', ')}
- Annual budget (USD): $${profile.budgetUSD.toLocaleString()}
- Language proficiency: ${formatLanguageProficiency(profile.languageProficiency)}
- Extracurriculars: ${profile.extracurriculars.length > 0 ? profile.extracurriculars.join('; ') : 'None listed'}
- Special circumstances: ${profile.specialCircumstances ?? 'None'}

Please recommend 3 universities for this student.`

  return { system: SHORTLIST_SYSTEM, user }
}

export function buildPlanPrompt(
  profile: StudentProfile,
  university: University,
): { system: string; user: string } {
  const user = `Student profile:
- Name: ${profile.name}
- Nationality: ${profile.nationality}
- GPA: ${profile.gpa}/4.0
- Intended major: ${profile.intendedMajor}
- Annual budget (USD): $${profile.budgetUSD.toLocaleString()}
- Language proficiency: ${formatLanguageProficiency(profile.languageProficiency)}
- Extracurriculars: ${profile.extracurriculars.length > 0 ? profile.extracurriculars.join('; ') : 'None listed'}
- Special circumstances: ${profile.specialCircumstances ?? 'None'}

Target university: ${university.name} (${university.country})
Program: ${university.program}
Admission tier: ${university.tier}

Please create a detailed application plan for this student to apply to ${university.name}.`

  return { system: PLAN_SYSTEM, user }
}
