import cron from 'node-cron'
import { getUsersWithDeadlineInDays } from './telegramDb.js'
import { sendDeadlineReminder } from './telegramNotifier.js'

export const startDeadlineReminderCron = (): void => {
  cron.schedule('0 9 * * *', async () => {
    console.log('[cron] Running deadline reminder job')
    try {
      const [weekRows, dayRows] = await Promise.all([
        getUsersWithDeadlineInDays(7),
        getUsersWithDeadlineInDays(1),
      ])

      for (const row of weekRows) {
        await sendDeadlineReminder(
          row.telegramChatId,
          row.universityName,
          row.applicationDeadline,
          'week',
        )
      }
      for (const row of dayRows) {
        await sendDeadlineReminder(
          row.telegramChatId,
          row.universityName,
          row.applicationDeadline,
          'day',
        )
      }

      console.log(`[cron] Reminders sent: ${weekRows.length} week, ${dayRows.length} day`)
    } catch (err) {
      console.error('[cron] Deadline reminder job failed:', err)
    }
  })
}
