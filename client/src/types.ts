export interface User {
  id: string
  email: string
}

export interface Profile {
  name: string
  age: number
  grade: number
  country: string
  targetYear: number
  whyAbroad: string
  planToReturn: boolean | null
  subjects: string[]
  careerDirection: string
  languages: Array<{ language: string; level: string }>
  tuitionMin: number
  tuitionMax: number
  openToScholarship: boolean
  preferredCountries: string[]
  cityVibe: string
  activities: string[]
  strengths: string
}

export type PartialProfile = Partial<Profile>

// ─── Client UI types ──────────────────────────────────────────────────────────

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
  planId?: string
  tasksCompleted?: number
  tasksTotal?: number
}

export interface PlanTask {
  id: string
  month: string
  week?: number
  title: string
  done: boolean
}

export interface UniversityPlan {
  universityId: string
  overview: string
  portalUrl: string
  applicationDeadline: string
  tuition: number
  level: 'Reach' | 'Match' | 'Safety'
  documents: Array<{ name: string; howToGet: string; urgency: 'high' | 'medium' | 'low' }>
  tests: Array<{ name: string; prepTime: string; startBy: string }>
  monthlyTasks: PlanTask[]
  parentTalkingPoints: string[]
}

export type Lang = 'ru' | 'en'

// ─── Server response types ────────────────────────────────────────────────────

export interface ServerUniversity {
  name: string
  country: string
  city: string
  program: string
  language: string
  tier: 'Reach' | 'Match' | 'Safety'
  rationale: string
  tuitionUSD: number
  scholarshipPotential: string
}

export interface ServerShortlist {
  id: string
  universities: ServerUniversity[]
  is_stale: boolean
  created_at: string
}

export interface ServerPlanData {
  universityName: string
  applicationDeadline: string
  portalUrl: string
  overview: string
  documents: Array<{ name: string; howToGet: string; urgency: 'high' | 'medium' | 'low' }>
  tests: Array<{ name: string; prepTime: string; startBy: string }>
  applicationSteps: Array<{ step: string; deadline?: string }>
  monthlyChecklist: Array<{ month: string; tasks: Array<{ week: number; task: string }> }>
  parentTalkingPoints: string[]
}

export interface ServerPlan {
  id: string
  university_name: string
  plan: ServerPlanData
  is_stale: boolean
  task_completions: Record<string, boolean>
  created_at: string
}

// ─── Mapping helpers ──────────────────────────────────────────────────────────

export const toClientUniversity = (
  s: ServerUniversity,
  planId?: string,
  completions?: Record<string, boolean>,
): University => ({
  id: s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  name: s.name,
  program: s.program,
  city: s.city,
  country: s.country,
  language: s.language,
  tuition: s.tuitionUSD,
  level: s.tier,
  whyFit: s.rationale,
  scholarshipInfo: s.scholarshipPotential,
  hasPlan: !!planId,
  planId,
  tasksCompleted: completions ? Object.values(completions).filter(Boolean).length : undefined,
  tasksTotal: undefined,
})

export const toClientPlan = (serverPlan: ServerPlan, university: University): UniversityPlan => {
  const completions = serverPlan.task_completions ?? {}
  let taskIndex = 0

  const monthlyTasks: PlanTask[] = serverPlan.plan.monthlyChecklist.flatMap((month, mi) =>
    month.tasks.map((t, ti) => {
      const id = `m${mi}-t${ti}`
      taskIndex++
      return { id, month: month.month, week: t.week, title: t.task, done: !!completions[id] }
    }),
  )

  void taskIndex

  return {
    universityId: university.id,
    overview: serverPlan.plan.overview,
    portalUrl: serverPlan.plan.portalUrl,
    applicationDeadline: serverPlan.plan.applicationDeadline,
    tuition: university.tuition,
    level: university.level,
    documents: serverPlan.plan.documents,
    tests: serverPlan.plan.tests,
    monthlyTasks,
    parentTalkingPoints: serverPlan.plan.parentTalkingPoints,
  }
}
