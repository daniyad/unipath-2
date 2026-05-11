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
  academicScore: number
  academicScoreMax: number
  universitySelectionMode: 'auto' | 'manual'
  selectedUniversities: Array<{ name: string; country: string }>
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
  level: 'Reach' | 'Match' | 'Safety' | 'Unlikely'
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
  importance: 'critical' | 'important' | 'nice-to-have'
}

export interface UniversityPlan {
  universityId: string
  overview: string
  portalUrl: string
  applicationDeadline: string
  tuition: number
  level: 'Reach' | 'Match' | 'Safety' | 'Unlikely'
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
  tier: 'Reach' | 'Match' | 'Safety' | 'Unlikely'
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
  monthlyChecklist: Array<{
    month: string
    tasks: Array<{
      week: number
      task: string
      importance: 'critical' | 'important' | 'nice-to-have'
    }>
  }>
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

// ─── Shared dashboard (public read-only view) ─────────────────────────────────

export interface ShareSettings {
  expiresIn: '24h' | '7d' | '30d' | 'never'
  showTuition: boolean
}

export interface ShareDetails {
  token: string
  viewCount: number
  settings: ShareSettings
}

export interface WeekTaskShareData {
  title: string
  uniName: string
  urgency: 'urgent' | 'important' | 'later'
  dueLabel: string
  dueShort: string
}

export interface SharedUniversityData {
  universityName: string
  program: string
  country: string
  language: string
  tuition: number
  level: 'Reach' | 'Match' | 'Safety' | 'Unlikely'
  deadline: string
  totalTasks: number
  completedTasks: number
  dueThisWeek: number
  hasPlan: boolean
}

export interface SharedDashboardData {
  student: { firstName: string }
  settings: ShareSettings
  universities: SharedUniversityData[]
  weekTasks: WeekTaskShareData[]
  helpItems: string[]
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
      return {
        id,
        month: month.month,
        week: t.week,
        title: t.task,
        done: !!completions[id],
        importance: t.importance ?? 'important',
      }
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
