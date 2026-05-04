import { callClaude, callClaudeChat } from './claude.js'
import {
  buildShortlistPrompt,
  buildPlanPrompt,
  buildChatPrompt,
  shortlistResponseSchema,
  planResponseSchema,
  chatResponseSchema,
  type ShortlistResult,
  type PlanResult,
  type ChatResult,
  type ChatContext,
} from './prompts.js'
import type { StudentProfile, University } from '../types.js'

// ─── Discriminated union input types ─────────────────────────────────────────

export type AgentInput =
  | { type: 'shortlist'; profile: StudentProfile }
  | { type: 'plan'; profile: StudentProfile; university: University }
  | (Omit<ChatContext, 'userMessage'> & { type: 'chat'; userMessage: string })

export type AgentOutput =
  | { type: 'shortlist'; result: ShortlistResult }
  | { type: 'plan'; result: PlanResult }
  | { type: 'chat'; result: ChatResult }

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
    case 'chat': {
      const { system } = buildChatPrompt(input)
      const raw = await callClaudeChat(system, input.history, input.userMessage)
      const result = chatResponseSchema.parse(raw)
      return { type: 'chat', result }
    }
    default: {
      const _: never = input
      throw new Error(`Unknown agent type: ${JSON.stringify(_)}`)
    }
  }
}
