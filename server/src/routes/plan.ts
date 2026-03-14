import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth.js'
import { aiRateLimiter } from '../middleware/rateLimit.js'
import { callClaude } from '../services/claude.js'
import { buildPlanPrompt, planResponseSchema } from '../services/prompts.js'
import { savePlan, getPlans } from '../services/db.js'
import { studentProfileSchema, universitySchema } from '../types.js'

const router = Router()

const planRequestSchema = z.object({
  profile: studentProfileSchema,
  university: universitySchema,
})

router.post('/plan', authMiddleware, aiRateLimiter, async (req, res, next) => {
  try {
    const { profile, university } = planRequestSchema.parse(req.body)
    const { system, user } = buildPlanPrompt(profile, university)
    const raw = await callClaude(system, user)
    const result = planResponseSchema.parse(raw)
    const saved = await savePlan(req.user!.id, profile, result)
    res.json({ success: true, data: { ...result, id: (saved as { id: string }).id } })
  } catch (err) {
    next(err)
  }
})

router.get('/plans', authMiddleware, async (req, res, next) => {
  try {
    const plans = await getPlans(req.user!.id)
    res.json({ success: true, data: plans })
  } catch (err) {
    next(err)
  }
})

export default router
