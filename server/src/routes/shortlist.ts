import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { aiRateLimiter } from '../middleware/rateLimit.js'
import { callClaude } from '../services/claude.js'
import { buildShortlistPrompt, shortlistResponseSchema } from '../services/prompts.js'
import { saveShortlist, getShortlists } from '../services/db.js'
import { studentProfileSchema } from '../types.js'

const router = Router()

router.post('/shortlist', authMiddleware, aiRateLimiter, async (req, res, next) => {
  try {
    const profile = studentProfileSchema.parse(req.body)
    const { system, user } = buildShortlistPrompt(profile)
    const raw = await callClaude(system, user)
    const result = shortlistResponseSchema.parse(raw)
    const saved = await saveShortlist(req.user!.id, profile, result.universities)
    res.json({ success: true, data: { ...result, id: (saved as { id: string }).id } })
  } catch (err) {
    next(err)
  }
})

router.get('/shortlists', authMiddleware, async (req, res, next) => {
  try {
    const shortlists = await getShortlists(req.user!.id)
    res.json({ success: true, data: shortlists })
  } catch (err) {
    next(err)
  }
})

export default router
