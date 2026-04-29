import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { aiRateLimiter } from '../middleware/rateLimit.js'
import { runAgent, type AgentOutput } from '../services/agent.js'
import { toStudentProfile } from '../services/profileAdapter.js'
import { saveShortlist, getShortlists } from '../services/db.js'

const router = Router()

router.post('/shortlist', authMiddleware, aiRateLimiter, async (req, res, next) => {
  try {
    const profile = toStudentProfile(req.body as Record<string, unknown>)
    const output = (await runAgent({ type: 'shortlist', profile })) as Extract<
      AgentOutput,
      { type: 'shortlist' }
    >
    const saved = await saveShortlist(
      req.user!.id,
      req.body as Record<string, unknown>,
      output.result.universities,
    )
    res.json({ success: true, data: { id: (saved as { id: string }).id, ...output.result } })
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
