import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import profileRouter from './routes/profile.js'
import shortlistRouter from './routes/shortlist.js'
import planRouter from './routes/plan.js'
import telegramRouter from './routes/telegram.js'
import shareRouter from './routes/share.js'
import universitiesRouter from './routes/universities.js'
import { startDeadlineReminderCron } from './services/telegramCron.js'

const app = express()
const PORT = process.env.PORT ?? 4000

const allowedOrigins = [
  'https://joinunipath.com',
  'https://www.joinunipath.com',
  'http://localhost:3000',
  'http://localhost:3001',
]

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', profileRouter)
app.use('/api', shortlistRouter)
app.use('/api', planRouter)
app.use('/api', telegramRouter)
app.use('/api/share', shareRouter)
app.use('/api', universitiesRouter)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ success: false, error: err.issues[0]?.message ?? 'Validation error' })
    return
  }
  console.error('Unhandled error:', err)
  res.status(500).json({ success: false, error: 'Internal server error' })
}

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  startDeadlineReminderCron()
})
