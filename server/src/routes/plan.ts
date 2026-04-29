import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth.js'
import { aiRateLimiter } from '../middleware/rateLimit.js'
import { runAgent, type AgentOutput } from '../services/agent.js'
import { toStudentProfile } from '../services/profileAdapter.js'
import { savePlan, getPlans, updateTaskCompletion } from '../services/db.js'
import { universitySchema } from '../types.js'

const router = Router()

const planRequestSchema = z.object({
  profile: z.record(z.string(), z.unknown()),
  university: universitySchema,
})

const taskUpdateSchema = z.object({
  taskId: z.string().min(1),
  done: z.boolean(),
})

router.post('/plan', authMiddleware, aiRateLimiter, async (req, res, next) => {
  try {
    const { profile: profileData, university } = planRequestSchema.parse(req.body)
    const profile = toStudentProfile(profileData)
    const output = (await runAgent({ type: 'plan', profile, university })) as Extract<
      AgentOutput,
      { type: 'plan' }
    >
    const saved = await savePlan(req.user!.id, university, output.result)
    res.json({ success: true, data: { id: (saved as { id: string }).id, ...output.result } })
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

router.patch('/plans/:id/tasks', authMiddleware, async (req, res, next) => {
  try {
    const { taskId, done } = taskUpdateSchema.parse(req.body)
    const updated = await updateTaskCompletion(req.user!.id, String(req.params.id), taskId, done)
    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
})

export default router
