import { callClaudeHaikuText } from './claude.js'
import { getSummary, saveSummary } from './shareDb.js'

const SUMMARY_TTL_MS = 7 * 24 * 60 * 60 * 1000

export interface PlanSummaryInfo {
  universityName: string
  level: 'Reach' | 'Match' | 'Safety'
  completedTasks: number
  totalTasks: number
  deadline: string
  urgentIncompleteTasks: Array<{ title: string; month: string }>
  hasPlan: boolean
}

export const getOrGenerateSummary = async (
  userId: string,
  plans: PlanSummaryInfo[],
  firstName: string,
  lang: 'en' | 'ru',
): Promise<string> => {
  const cached = await getSummary(userId)
  if (cached) {
    const ageMs = Date.now() - new Date(cached.generated_at).getTime()
    if (ageMs < SUMMARY_TTL_MS) return cached.summary
  }

  const prompt = buildPrompt(firstName, lang, plans)
  const summary = await callClaudeHaikuText(prompt)
  await saveSummary(userId, summary)
  return summary
}

const buildPrompt = (firstName: string, lang: 'en' | 'ru', plans: PlanSummaryInfo[]): string => {
  const langLabel = lang === 'ru' ? 'Russian' : 'English'

  const withPlan = plans.filter((p) => p.hasPlan)
  const noPlan = plans.filter((p) => !p.hasPlan)

  const plansText = withPlan
    .map(
      (p) =>
        `- ${p.universityName} (${p.level}): ${p.completedTasks} of ${p.totalTasks} tasks done, deadline ${p.deadline}`,
    )
    .join('\n')

  const noPlanText =
    noPlan.length > 0
      ? `\nAlso shortlisted but no action plan started yet:\n${noPlan.map((p) => `- ${p.universityName} (${p.level})`).join('\n')}`
      : ''

  const urgentTasks = withPlan
    .flatMap((p) =>
      p.urgentIncompleteTasks
        .slice(0, 2)
        .map((t) => `${t.title} — ${p.universityName} (${t.month})`),
    )
    .slice(0, 3)

  const urgentText =
    urgentTasks.length > 0 ? urgentTasks.join('\n') : 'No urgent upcoming tasks identified.'

  const hasActivePlans = withPlan.length > 0

  return `You are writing a brief progress update for someone checking in on a student's university applications.

Student first name: ${firstName}
Language to write in: ${langLabel}

Their university shortlist:
${hasActivePlans ? plansText : '(no action plans started yet)'}${noPlanText}

${hasActivePlans ? `Most urgent upcoming tasks:\n${urgentText}` : ''}

Write 3–4 sentences in ${langLabel}:
1. Where the student is in their journey overall
2. ${hasActivePlans ? 'Which application needs the most attention and why' : 'That they have shortlisted universities and should start their action plans'}
3. The single most important next step

Tone: warm, clear, encouraging. No bullet points. Plain prose only. Do not use markdown.`
}
