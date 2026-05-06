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

  const plansText = plans
    .map(
      (p) =>
        `- ${p.universityName} (${p.level}): ${p.completedTasks} of ${p.totalTasks} tasks done, deadline ${p.deadline}`,
    )
    .join('\n')

  const urgentTasks = plans
    .flatMap((p) =>
      p.urgentIncompleteTasks
        .slice(0, 2)
        .map((t) => `${t.title} — ${p.universityName} (${t.month})`),
    )
    .slice(0, 3)

  const urgentText =
    urgentTasks.length > 0 ? urgentTasks.join('\n') : 'No urgent upcoming tasks identified.'

  return `You are writing a brief progress update for someone checking in on a student's university applications.

Student first name: ${firstName}
Language to write in: ${langLabel}

Their university applications:
${plansText}

Most urgent upcoming tasks across all applications:
${urgentText}

Write 3–4 sentences in ${langLabel}:
1. Where the student is overall in their journey (early, mid, or late stage)
2. Which application needs the most attention right now and why
3. The single most important thing to do next

Tone: warm, clear, encouraging. No bullet points. Plain prose only. Do not use markdown.`
}
