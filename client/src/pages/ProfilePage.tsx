import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
import { useApi } from '../contexts/ApiContext'
import { Navbar } from '../components/Navbar'
import { ShareDialog } from '../components/ShareDialog'
import type { ShareDetails, ShareSettings } from '../types'
import styles from './ProfilePage.module.css'

// ─── Block frame ──────────────────────────────────────────────────────────────

interface BlockProps {
  eyebrow: string
  title: string
  sub?: string
  action?: React.ReactNode
  children: React.ReactNode
  danger?: boolean
  defaultOpen?: boolean
}

function Block({
  eyebrow,
  title,
  sub,
  action,
  children,
  danger,
  defaultOpen = false,
}: Readonly<BlockProps>) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className={`${styles.block} ${danger ? styles.blockDanger : ''}`}>
      <button
        className={`${styles.blockHead} ${open ? styles.blockHeadOpen : ''}`}
        onClick={() => setOpen((v) => !v)}
        type="button"
        aria-expanded={open}
      >
        <div className={styles.blockHeadText}>
          <span className={`${styles.eyebrow} ${danger ? styles.eyebrowDanger : ''}`}>
            {eyebrow}
          </span>
          <h2 className={`${styles.blockTitle} ${danger ? styles.titleDanger : ''}`}>{title}</h2>
        </div>
        <div className={styles.blockHeadRight}>
          {action && !open && (
            <div className={styles.blockAction} onClick={(e) => e.stopPropagation()}>
              {action}
            </div>
          )}
          <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>›</span>
        </div>
      </button>

      {open && (
        <>
          {sub && <p className={styles.blockSub}>{sub}</p>}
          {action && open && <div className={styles.blockActionInline}>{action}</div>}
          <div className={styles.blockBody}>{children}</div>
        </>
      )}
    </section>
  )
}

interface FieldProps {
  label: string
  children: React.ReactNode
}

function Field({ label, children }: Readonly<FieldProps>) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldLabel}>{label}</div>
      <div className={styles.fieldValue}>{children}</div>
    </div>
  )
}

// ─── Sections ─────────────────────────────────────────────────────────────────

interface AccountInfoProps {
  name: string | undefined
  email: string
  country: string | undefined
  targetYear: number | undefined
}

function AccountInfo({ name, email, country, targetYear }: Readonly<AccountInfoProps>) {
  const { t } = useTranslation()
  const gradYear = targetYear ? t('profile.classOf', { year: targetYear }) : '—'

  return (
    <Block
      eyebrow={t('profile.accountEyebrow')}
      title={t('profile.accountTitle')}
      sub={t('profile.accountSub')}
      defaultOpen
    >
      <div className={styles.grid}>
        <Field label={t('profile.fieldName')}>{name || '—'}</Field>
        <Field label={t('profile.fieldEmail')}>{email}</Field>
        <Field label={t('profile.fieldCountry')}>{country || '—'}</Field>
        <Field label={t('profile.fieldGraduating')}>{gradYear}</Field>
      </div>
    </Block>
  )
}

interface ProfileAnswersProps {
  careerDirection: string | undefined
  academicScore: number | undefined
  academicScoreMax: number | undefined
  languages: Array<{ language: string; level: string }> | undefined
  tuitionMin: number | undefined
  tuitionMax: number | undefined
  preferredCountries: string[] | undefined
  whyAbroad: string | undefined
  onEditAnswers: () => void
}

function ProfileAnswers({
  careerDirection,
  academicScore,
  academicScoreMax,
  languages,
  tuitionMin,
  tuitionMax,
  preferredCountries,
  whyAbroad,
  onEditAnswers,
}: Readonly<ProfileAnswersProps>) {
  const { t } = useTranslation()
  const gpa =
    academicScore != null && academicScoreMax != null
      ? `${academicScore} / ${academicScoreMax}`
      : '—'

  const englishLang = languages?.find(
    (l) => l.language.toLowerCase().includes('english') || l.language.toLowerCase() === 'en',
  )
  const englishLevel = englishLang ? `${englishLang.language} — ${englishLang.level}` : '—'

  const budget =
    tuitionMin != null && tuitionMax != null
      ? `$${tuitionMin.toLocaleString()}–$${tuitionMax.toLocaleString()}`
      : '—'

  const regions = preferredCountries ?? []

  return (
    <Block
      eyebrow={t('profile.answersEyebrow')}
      title={t('profile.answersTitle')}
      sub={t('profile.answersSub')}
      action={
        <button className={styles.editLink} onClick={onEditAnswers} type="button">
          {t('profile.editAnswers')}
        </button>
      }
    >
      <div className={styles.grid}>
        <Field label={t('profile.fieldStudy')}>{careerDirection || '—'}</Field>
        <Field label={t('profile.fieldGpa')}>{gpa}</Field>
        <Field label={t('profile.fieldEnglish')}>{englishLevel}</Field>
        <Field label={t('profile.fieldBudget')}>{budget}</Field>
      </div>

      <div className={styles.divider} />

      <div className={styles.stack}>
        <div className={styles.fieldLabel}>{t('profile.regionsLabel')}</div>
        <div className={styles.chipRow}>
          {regions.length > 0 ? (
            regions.map((r) => (
              <span key={r} className={styles.chip}>
                {r}
              </span>
            ))
          ) : (
            <span className={styles.fieldValue}>—</span>
          )}
        </div>
      </div>

      {whyAbroad && (
        <div className={`${styles.stack} ${styles.stackGap}`}>
          <div className={styles.fieldLabel}>{t('profile.whyAbroadLabel')}</div>
          <p className={styles.quote}>{whyAbroad}</p>
        </div>
      )}
    </Block>
  )
}

interface TelegramBlockProps {
  linked: boolean
  loading: boolean
  generating: boolean
  linkedAt: string | undefined
  remindersEnabled: boolean
  onConnect: () => Promise<void>
  onToggleReminders: (enabled: boolean) => Promise<void>
}

function Toggle({
  on,
  onChange,
  label,
}: Readonly<{ on: boolean; onChange: (v: boolean) => void; label: string }>) {
  return (
    <button
      className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      type="button"
    >
      <span className={styles.toggleKnob} />
    </button>
  )
}

function TelegramBlock({
  linked,
  loading,
  generating,
  linkedAt,
  remindersEnabled,
  onConnect,
  onToggleReminders,
}: Readonly<TelegramBlockProps>) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Block eyebrow={t('profile.telegramEyebrow')} title={t('profile.telegramTitle')}>
        <p className={styles.hint}>{t('profile.checkingConnection')}</p>
      </Block>
    )
  }

  if (linked) {
    const linkedDate = linkedAt ? new Date(linkedAt).toLocaleDateString() : null
    return (
      <Block
        eyebrow={t('profile.telegramEyebrow')}
        title={t('profile.telegramConnectedTitle')}
        sub={
          linkedDate
            ? t('profile.telegramConnectedSubDate', { date: linkedDate })
            : t('profile.telegramConnectedSub')
        }
      >
        <ul className={styles.prefList}>
          <li className={styles.prefRow}>
            <div className={styles.prefText}>
              <div className={styles.prefTitle}>{t('profile.dailyReminders')}</div>
              <div className={styles.prefSub}>{t('profile.dailyRemindersSub')}</div>
            </div>
            <Toggle
              on={remindersEnabled}
              onChange={(v) => void onToggleReminders(v)}
              label={t('profile.dailyReminders')}
            />
          </li>
        </ul>
      </Block>
    )
  }

  return (
    <Block
      eyebrow={t('profile.telegramEyebrow')}
      title={t('profile.telegramTitle')}
      sub={t('profile.telegramSub')}
    >
      <button
        className="btn btn-primary"
        onClick={() => void onConnect()}
        disabled={generating}
        type="button"
      >
        {generating ? t('profile.connectingTelegram') : t('profile.connectTelegram')}
      </button>
    </Block>
  )
}

interface NotificationsProps {
  deadlinesEnabled: boolean
  onDeadlinesChange: (enabled: boolean) => void
}

function Notifications({ deadlinesEnabled, onDeadlinesChange }: Readonly<NotificationsProps>) {
  const { t } = useTranslation()
  return (
    <Block
      eyebrow={t('profile.remindersEyebrow')}
      title={t('profile.remindersTitle')}
      sub={t('profile.remindersSub')}
    >
      <ul className={styles.prefList}>
        <li className={styles.prefRow}>
          <div className={styles.prefText}>
            <div className={styles.prefTitle}>{t('profile.deadlineCountdowns')}</div>
            <div className={styles.prefSub}>{t('profile.deadlineCountdownsSub')}</div>
          </div>
          <Toggle
            on={deadlinesEnabled}
            onChange={onDeadlinesChange}
            label={t('profile.deadlineCountdowns')}
          />
        </li>
      </ul>
    </Block>
  )
}

interface SharingBlockProps {
  shareDetails: ShareDetails | null | undefined
  onShare: () => void
  onManage: () => void
}

function SharingBlock({ shareDetails, onShare, onManage }: Readonly<SharingBlockProps>) {
  const { t } = useTranslation()
  return (
    <Block
      eyebrow={t('profile.sharingEyebrow')}
      title={t('profile.sharingTitle')}
      sub={t('profile.sharingSub')}
    >
      {shareDetails === undefined ? (
        <p className={styles.hint}>{t('profile.sharingLoading')}</p>
      ) : shareDetails ? (
        <div className={styles.shareRow}>
          <span className={styles.shareActiveLabel}>{t('profile.linkActive')}</span>
          <button type="button" className={styles.shareAction} onClick={onManage}>
            {t('profile.manageLink')}
          </button>
        </div>
      ) : (
        <button type="button" className="btn btn-primary" onClick={onShare}>
          {t('profile.createShareLink')}
        </button>
      )}
    </Block>
  )
}

interface DeleteProfileProps {
  onDelete: () => Promise<void>
}

function DeleteProfile({ onDelete }: Readonly<DeleteProfileProps>) {
  const { t } = useTranslation()
  const [confirming, setConfirming] = useState(false)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Block
      eyebrow={t('profile.dangerEyebrow')}
      title={t('profile.dangerTitle')}
      sub={t('profile.dangerSub')}
      danger
    >
      {!confirming ? (
        <button className={styles.btnDanger} onClick={() => setConfirming(true)} type="button">
          {t('profile.deleteBtn')}
        </button>
      ) : (
        <div className={styles.dangerConfirm}>
          <div className={styles.fieldLabel}>
            {t('profile.deleteConfirmBefore')}
            <strong>{t('profile.deleteConfirmBold')}</strong>
            {t('profile.deleteConfirmAfter')}
          </div>
          <input
            className="input"
            placeholder={t('profile.deleteConfirmBold')}
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
          <div className={styles.dangerActions}>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setConfirming(false)
                setText('')
              }}
              type="button"
            >
              {t('profile.cancel')}
            </button>
            <button
              className={styles.btnDanger}
              disabled={text.trim().toLowerCase() !== t('profile.deleteConfirmBold') || deleting}
              onClick={() => void handleDelete()}
              type="button"
            >
              {deleting ? t('profile.deleting') : t('profile.deleteForever')}
            </button>
          </div>
        </div>
      )}
    </Block>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { profile, clearProfile } = useProfile()
  const api = useApi()
  const navigate = useNavigate()

  const [tg, setTg] = useState<{
    linked: boolean
    linkedAt?: string
    remindersEnabled: boolean
    loading: boolean
    generating: boolean
  }>({ linked: false, remindersEnabled: true, loading: true, generating: false })

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    void api
      .getTelegramLinkStatus()
      .then((d) =>
        setTg((s) => ({
          ...s,
          linked: !!d,
          linkedAt: d?.linked_at,
          remindersEnabled: d?.reminders_enabled ?? true,
          loading: false,
        })),
      )
      .catch(() => setTg((s) => ({ ...s, loading: false })))
  }, [api])

  useEffect(
    () => () => {
      if (pollRef.current) clearInterval(pollRef.current)
    },
    [],
  )

  const handleConnect = async () => {
    setTg((s) => ({ ...s, generating: true }))
    try {
      const { deeplinkUrl } = await api.generateTelegramLinkToken()
      window.open(deeplinkUrl, '_blank', 'noopener,noreferrer')
      pollRef.current = setInterval(() => {
        void api.getTelegramLinkStatus().then((d) => {
          if (d) {
            setTg({
              linked: true,
              linkedAt: d.linked_at,
              remindersEnabled: d.reminders_enabled ?? true,
              loading: false,
              generating: false,
            })
            if (pollRef.current) clearInterval(pollRef.current)
          }
        })
      }, 3000)
      setTimeout(() => {
        if (pollRef.current) clearInterval(pollRef.current)
        setTg((s) => ({ ...s, generating: false }))
      }, 120_000)
    } catch {
      setTg((s) => ({ ...s, generating: false }))
    }
  }

  const handleToggleReminders = async (enabled: boolean) => {
    setTg((s) => ({ ...s, remindersEnabled: enabled }))
    try {
      await api.updateTelegramReminder(enabled)
    } catch {
      setTg((s) => ({ ...s, remindersEnabled: !enabled }))
    }
  }

  const [shareDetails, setShareDetails] = useState<ShareDetails | null | undefined>(undefined)
  const [showShareDialog, setShowShareDialog] = useState(false)

  useEffect(() => {
    void api
      .getShareDetails()
      .then((data) => setShareDetails(data))
      .catch(() => setShareDetails(null))
  }, [api])

  const handleShare = async () => {
    try {
      const data = await api.createShareLink()
      setShareDetails(data)
      setShowShareDialog(true)
    } catch {
      // ignore
    }
  }

  const handleRevoke = async () => {
    try {
      await api.deleteShareLink()
      setShareDetails(null)
      setShowShareDialog(false)
    } catch {
      // ignore
    }
  }

  const handleSettingsChange = async (settings: ShareSettings) => {
    try {
      const updated = await api.updateShareSettings(settings)
      setShareDetails(updated)
    } catch {
      // ignore
    }
  }

  const handleDelete = async () => {
    await api.deleteAccount()
    clearProfile()
    await logout()
  }

  const name = profile?.name
  const email = user?.email ?? ''

  return (
    <div className={styles.page}>
      <Navbar showProfileActions />

      <div className={styles.profPage}>
        {/* Header */}
        <header className={styles.profHeader}>
          <h1 className={styles.profName}>{name || t('profile.title')}</h1>
          <p className={styles.profMeta}>
            <a href={`mailto:${email}`}>{email}</a>
          </p>
        </header>

        <div className={styles.stackBlocks}>
          <AccountInfo
            name={name}
            email={email}
            country={profile?.country}
            targetYear={profile?.targetYear}
          />

          <ProfileAnswers
            careerDirection={profile?.careerDirection}
            academicScore={profile?.academicScore}
            academicScoreMax={profile?.academicScoreMax}
            languages={profile?.languages}
            tuitionMin={profile?.tuitionMin}
            tuitionMax={profile?.tuitionMax}
            preferredCountries={profile?.preferredCountries}
            whyAbroad={profile?.whyAbroad}
            onEditAnswers={() => navigate('/setup')}
          />

          <TelegramBlock
            linked={tg.linked}
            loading={tg.loading}
            generating={tg.generating}
            linkedAt={tg.linkedAt}
            remindersEnabled={tg.remindersEnabled}
            onConnect={handleConnect}
            onToggleReminders={handleToggleReminders}
          />

          <Notifications
            deadlinesEnabled={tg.remindersEnabled}
            onDeadlinesChange={(enabled) => void handleToggleReminders(enabled)}
          />

          {profile?.name && (
            <SharingBlock
              shareDetails={shareDetails}
              onShare={() => void handleShare()}
              onManage={() => setShowShareDialog(true)}
            />
          )}

          <DeleteProfile onDelete={handleDelete} />
        </div>
      </div>

      {showShareDialog && shareDetails && (
        <ShareDialog
          details={shareDetails}
          onClose={() => setShowShareDialog(false)}
          onRevoke={() => void handleRevoke()}
          onSettingsChange={(settings) => void handleSettingsChange(settings)}
        />
      )}
    </div>
  )
}
