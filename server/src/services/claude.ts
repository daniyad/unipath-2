import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL = process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-6'

async function runCall(systemPrompt: string, userMessage: string): Promise<unknown> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected non-text response from Claude')
  }

  console.log(
    `Claude usage: input_tokens=${message.usage.input_tokens} output_tokens=${message.usage.output_tokens}`,
  )

  const text = content.text.trim()

  // Strip markdown code fences if present
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  const jsonStr = fenceMatch ? fenceMatch[1] : text

  const objectMatch = jsonStr.match(/\{[\s\S]*\}/)
  if (!objectMatch) {
    throw new Error('No JSON object found in Claude response')
  }

  return JSON.parse(objectMatch[0])
}

export async function callClaude(systemPrompt: string, userMessage: string): Promise<unknown> {
  try {
    return await runCall(systemPrompt, userMessage)
  } catch (err) {
    console.warn('Claude call failed, retrying once:', err instanceof Error ? err.message : err)
    return await runCall(systemPrompt, userMessage)
  }
}
