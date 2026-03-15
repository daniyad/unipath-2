import { z } from 'zod'

export const languageScoreSchema = z.object({
  test: z.string(),
  score: z.string(),
})

export const studentProfileSchema = z.object({
  name: z.string().min(1),
  nationality: z.string().min(1),
  gpa: z.number().min(0).max(4),
  targetCountries: z.array(z.string()).min(1),
  budgetUSD: z.number().positive(),
  intendedMajor: z.string().min(1),
  extracurriculars: z.array(z.string()),
  languageProficiency: z.array(languageScoreSchema),
  specialCircumstances: z.string().optional(),
})

export const universitySchema = z.object({
  name: z.string(),
  country: z.string(),
  program: z.string(),
  tier: z.enum(['Reach', 'Match', 'Safety']),
  rationale: z.string(),
  tuitionUSD: z.number(),
  scholarshipPotential: z.string(),
})

export type StudentProfile = z.infer<typeof studentProfileSchema>
export type University = z.infer<typeof universitySchema>

// Augment Express Request type
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string
        email?: string
      }
    }
  }
}
