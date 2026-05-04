import Anthropic from '@anthropic-ai/sdk'
import type { ChatMessage } from '../types.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL = process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-6'
const CHAT_MODEL = 'claude-haiku-4-5-20251001'

const extractJson = (text: string): unknown => {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  const jsonStr = fenceMatch ? fenceMatch[1] : text
  const objectMatch = jsonStr.match(/\{[\s\S]*\}/)
  if (!objectMatch) throw new Error('No JSON object found in Claude response')
  return JSON.parse(objectMatch[0])
}

// ─── Standard call (no tools) ───────────────────────────────────────────────

const runCall = async (systemPrompt: string, userMessage: string): Promise<unknown> => {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected non-text response from Claude')

  console.log(
    `Claude usage: input=${message.usage.input_tokens} output=${message.usage.output_tokens}`,
  )
  return extractJson(content.text.trim())
}

export const callClaude = async (systemPrompt: string, userMessage: string): Promise<unknown> => {
  try {
    return await runCall(systemPrompt, userMessage)
  } catch (err) {
    console.warn('Claude call failed, retrying once:', err instanceof Error ? err.message : err)
    return await runCall(systemPrompt, userMessage)
  }
}

// ─── Chat call (Haiku, conversation history, no tools) ───────────────────────

export const callClaudeChat = async (
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string,
): Promise<unknown> => {
  const message = await client.messages.create({
    model: CHAT_MODEL,
    max_tokens: 400,
    system: systemPrompt,
    messages: [...history, { role: 'user', content: userMessage }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected non-text response from Claude')

  console.log(
    `Claude chat usage: input=${message.usage.input_tokens} output=${message.usage.output_tokens}`,
  )
  return extractJson(content.text.trim())
}

// ─── Web search call ─────────────────────────────────────────────────────────

const runCallWithSearch = async (systemPrompt: string, userMessage: string): Promise<unknown> => {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    tools: [{ type: 'web_search_20250305' as const, name: 'web_search' }],
  })

  // Find the last text block — Claude's final synthesised answer after any search tool calls
  const textBlock = [...message.content].reverse().find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text')
    throw new Error('No text block in web-search response')

  console.log(
    `Claude (search) usage: input=${message.usage.input_tokens} output=${message.usage.output_tokens}`,
  )
  return extractJson(textBlock.text.trim())
}

export const callClaudeWithSearch = async (
  systemPrompt: string,
  userMessage: string,
): Promise<unknown> => {
  try {
    return await runCallWithSearch(systemPrompt, userMessage)
  } catch (err) {
    console.warn(
      'Claude search call failed, retrying once:',
      err instanceof Error ? err.message : err,
    )
    return await runCallWithSearch(systemPrompt, userMessage)
  }
}
