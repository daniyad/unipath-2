import type { Request, Response, NextFunction } from 'express'
import { supabase } from '../services/db.js'

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Missing or invalid Authorization header' })
    return
  }

  const token = authHeader.slice(7)
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' })
    return
  }

  req.user = { id: data.user.id, email: data.user.email ?? undefined }
  next()
}
