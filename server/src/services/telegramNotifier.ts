import { Telegram } from 'telegraf'

const telegram = new Telegram(process.env.TELEGRAM_BOT_TOKEN!)

export const sendMessage = async (chatId: number, text: string): Promise<void> => {
  try {
    await telegram.sendMessage(chatId, text, { parse_mode: 'Markdown' })
  } catch (err) {
    console.error(`[telegramNotifier] Failed to send message to chat ${chatId}:`, err)
  }
}

export const sendDeadlineReminder = async (
  chatId: number,
  universityName: string,
  deadline: string,
  type: 'week' | 'day',
): Promise<void> => {
  const text =
    type === 'week'
      ? `One week until your *${universityName}* deadline (${deadline}). Time to check your checklist.`
      : `Tomorrow is the deadline for *${universityName}*! (${deadline}) Open your plan on Unipath to check what's left.`
  await sendMessage(chatId, text)
}
