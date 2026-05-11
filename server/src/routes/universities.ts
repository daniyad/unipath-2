import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

const SUPPORTED_COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'South Korea',
  'United Arab Emirates',
]

interface HiPolabsUniversity {
  name: string
  country: string
  'state-province': string | null
  alpha_two_code: string
  domains: string[]
  web_pages: string[]
}

router.get('/universities/search', authMiddleware, async (req, res, next) => {
  try {
    const q = req.query.q as string | undefined
    if (!q || q.trim().length < 2) {
      res.status(400).json({ success: false, error: 'Query must be at least 2 characters.' })
      return
    }

    const query = q.trim()
    const fetches = SUPPORTED_COUNTRIES.map((country) =>
      fetch(
        `http://universities.hipolabs.com/search?name=${encodeURIComponent(query)}&country=${encodeURIComponent(country)}`,
      )
        .then(async (r) => (r.ok ? (r.json() as Promise<HiPolabsUniversity[]>) : []))
        .catch(() => [] as HiPolabsUniversity[]),
    )

    const batches = await Promise.all(fetches)
    const seen = new Set<string>()
    const merged = batches
      .flat()
      .filter((u) => {
        const key = u.name.toLowerCase().trim()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .map((u) => ({
        name: u.name,
        country: u.country,
        web: u.web_pages[0] ?? '',
      }))
      .slice(0, 20)

    res.json({ success: true, data: merged })
  } catch (err) {
    next(err)
  }
})

export default router
