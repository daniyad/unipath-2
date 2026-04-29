import { callClaude } from './claude.js'
import {
  buildShortlistPrompt,
  buildPlanPrompt,
  shortlistResponseSchema,
  planResponseSchema,
  type ShortlistResult,
  type PlanResult,
} from './prompts.js'
import type { StudentProfile, University } from '../types.js'

// ─── Discriminated union input types ─────────────────────────────────────────
// V2: add { type: 'scholarship'; ... } | { type: 'chat'; ... }

export type AgentInput =
  | { type: 'shortlist'; profile: StudentProfile }
  | { type: 'plan'; profile: StudentProfile; university: University }

export type AgentOutput =
  | { type: 'shortlist'; result: ShortlistResult }
  | { type: 'plan'; result: PlanResult }

// ─── Dispatch ─────────────────────────────────────────────────────────────────

export const runAgent = async (input: AgentInput): Promise<AgentOutput> => {
  switch (input.type) {
    case 'shortlist': {
      const { system, user } = buildShortlistPrompt(input.profile)
      const raw = await callClaude(system, user)
      const result = shortlistResponseSchema.parse(raw)
      return { type: 'shortlist', result }
    }
    case 'plan': {
      const { system, user } = buildPlanPrompt(input.profile, input.university)
      const raw = await callClaude(system, user)
      const result = planResponseSchema.parse(raw)
      return { type: 'plan', result }
    }
    default: {
      const _: never = input
      throw new Error(`Unknown agent type: ${JSON.stringify(_)}`)
    }
  }
}
