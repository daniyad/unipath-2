import { useState, useEffect, useRef, useCallback } from 'react'
import type { ShareDetails, ShareSettings } from '../types'
import styles from './ShareDialog.module.css'

interface ShareDialogProps {
  details: ShareDetails
  onClose: () => void
  onRevoke: () => void
  onSettingsChange: (settings: ShareSettings) => void
}

export function ShareDialog({ details, onClose, onRevoke, onSettingsChange }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const [localSettings, setLocalSettings] = useState<ShareSettings>(details.settings)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep local settings in sync if parent passes new details
  useEffect(() => {
    setLocalSettings(details.settings)
  }, [details.settings])

  const shareUrl = `${window.location.origin}/share/${details.token}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Fallback: select the text
    }
  }

  const applySettings = useCallback(
    (next: ShareSettings) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onSettingsChange(next)
      }, 500)
    },
    [onSettingsChange],
  )

  const setExpiresIn = (value: ShareSettings['expiresIn']) => {
    const next = { ...localSettings, expiresIn: value }
    setLocalSettings(next)
    applySettings(next)
  }

  const setShowTuition = (value: boolean) => {
    const next = { ...localSettings, showTuition: value }
    setLocalSettings(next)
    applySettings(next)
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  const urlHost = `${window.location.host}/share/`
  const urlPath = details.token.slice(0, 12) + '…'

  const EXP_OPTIONS: Array<{ value: ShareSettings['expiresIn']; label: string }> = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: 'never', label: 'Never' },
  ]

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Head */}
        <div className={styles.head}>
          <div>
            <div className={styles.eyebrow}>Read-only link</div>
            <div className={styles.title} id="share-dialog-title">
              Share your dashboard
            </div>
            <div className={styles.sub}>
              Anyone with this link can see your shortlist, plan, and progress — nothing else. They
              can&apos;t edit, message, or sign in.
            </div>
          </div>
          <button className={styles.closeBtn} aria-label="Close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        {/* Link box */}
        <div className={styles.linkRow}>
          <div className={styles.linkUrl}>
            <span className={styles.linkHost}>{urlHost}</span>
            <span className={styles.linkPath}>{urlPath}</span>
          </div>
          <button
            type="button"
            className={copied ? `${styles.copyBtn} ${styles.copyBtnDone}` : styles.copyBtn}
            onClick={() => void handleCopy()}
          >
            {copied ? <>✓ Copied</> : 'Copy link'}
          </button>
        </div>

        {/* Settings */}
        <div className={styles.settings}>
          <div className={styles.settingsTitle}>Link settings</div>

          <div className={styles.settingRow}>
            <div className={styles.settingLabel}>
              <span className={styles.settingName}>Expires</span>
              <span className={styles.settingHint}>
                Auto-revoke after this much time. You can always revoke manually.
              </span>
            </div>
            <div className={styles.seg} role="radiogroup" aria-label="Expires">
              {EXP_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={
                    localSettings.expiresIn === opt.value
                      ? `${styles.segOpt} ${styles.segOptActive}`
                      : styles.segOpt
                  }
                  onClick={() => setExpiresIn(opt.value)}
                  aria-pressed={localSettings.expiresIn === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingLabel}>
              <span className={styles.settingName}>Show tuition</span>
              <span className={styles.settingHint}>
                Show the dollar amounts for each university.
              </span>
            </div>
            <button
              type="button"
              className={
                localSettings.showTuition ? `${styles.toggle} ${styles.toggleOn}` : styles.toggle
              }
              onClick={() => setShowTuition(!localSettings.showTuition)}
              aria-pressed={localSettings.showTuition}
              aria-label="Show tuition"
            />
          </div>
        </div>

        {/* Footer */}
        <div className={styles.foot}>
          <button type="button" className={styles.revokeBtn} onClick={onRevoke}>
            Revoke link
          </button>
          <span className={styles.viewCount}>
            VIEWED{' '}
            <strong>
              {details.viewCount} {details.viewCount === 1 ? 'time' : 'times'}
            </strong>
          </span>
        </div>
      </div>
    </div>
  )
}
