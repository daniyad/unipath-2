export interface User {
  id: string
  email: string
}

export interface Profile {
  // Step 1: Basics
  name: string
  age: number
  grade: number
  country: string
  targetYear: number
  // Step 2: Motivation
  whyAbroad: string
  planToReturn: boolean | null
  // Step 3: Interests
  subjects: string[]
  careerDirection: string
  // Step 4: Languages
  languages: Array<{ language: string; level: string }>
  // Step 5: Budget
  tuitionMin: number
  tuitionMax: number
  openToScholarship: boolean
  // Step 6: Preferences
  preferredCountries: string[]
  cityVibe: string
  // Step 7: Extracurriculars
  activities: string[]
  strengths: string
}

export type PartialProfile = Partial<Profile>

export interface University {
  id: string
  name: string
  program: string
  city: string
  country: string
  language: string
  tuition: number
  level: 'Reach' | 'Match' | 'Safety'
  whyFit: string
  scholarshipInfo?: string
  deadline?: string
  insiderTip?: string
  hasPlan?: boolean
  tasksCompleted?: number
  tasksTotal?: number
}

export interface PlanTask {
  id: string
  month: string
  title: string
  done: boolean
}

export interface UniversityPlan {
  universityId: string
  overview: string
  documents: Array<{ name: string; howToGet: string; urgency: 'high' | 'medium' | 'low' }>
  tests: Array<{ name: string; prepTime: string; startBy: string }>
  applicationSteps: string[]
  monthlyTasks: PlanTask[]
  parentTalkingPoints: string[]
}

export type Lang = 'ru' | 'en'
