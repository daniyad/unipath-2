import type { StudentProfile } from '../types.js'

type ProfileData = Record<string, unknown>

const mapLanguages = (raw: unknown): StudentProfile['languageProficiency'] => {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((l) => l && typeof l === 'object' && l.language && l.level)
    .map((l) => ({ test: String(l.language), score: String(l.level) }))
}

export const toStudentProfile = (data: ProfileData): StudentProfile => ({
  name: String(data.name ?? 'Student'),
  nationality: String(data.country ?? ''),
  gpa: Number(data.gpa ?? 3.0),
  targetCountries:
    Array.isArray(data.preferredCountries) && data.preferredCountries.length > 0
      ? (data.preferredCountries as string[])
      : ['USA', 'Canada', 'UK', 'Germany', 'South Korea', 'UAE'],
  budgetUSD: Number(data.tuitionMax ?? 10000) || 10000,
  intendedMajor: String(data.careerDirection ?? 'Undecided'),
  extracurriculars: Array.isArray(data.activities) ? (data.activities as string[]) : [],
  languageProficiency: mapLanguages(data.languages),
  specialCircumstances: data.strengths ? String(data.strengths) : undefined,
})
