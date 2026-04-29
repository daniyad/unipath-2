import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { getProfile, upsertProfile, markAllStale } from '../services/db.js'
import { diffProfile } from '../services/profileDiff.js'

const router = Router()

router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const row = await getProfile(req.user!.id)
    res.json({ success: true, data: row?.data ?? null })
  } catch (err) {
    next(err)
  }
})

router.patch('/profile', authMiddleware, async (req, res, next) => {
  try {
    const incoming = req.body as Record<string, unknown>
    const existing = await getProfile(req.user!.id)
    const staleFields = existing
      ? diffProfile(existing.data as Record<string, unknown>, incoming)
      : []

    const saved = await upsertProfile(req.user!.id, incoming)

    if (staleFields.length > 0) {
      await markAllStale(req.user!.id)
    }

    res.json({ success: true, data: { profile: saved.data, staleFields } })
  } catch (err) {
    next(err)
  }
})

export default router
