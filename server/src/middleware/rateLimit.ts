import rateLimit from 'express-rate-limit'

export const aiRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  limit: 10,
  keyGenerator: (req) => req.user?.id ?? req.ip ?? 'unknown',
  message: {
    success: false,
    error: 'Daily limit reached. You can make 10 AI requests per day.',
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
})
