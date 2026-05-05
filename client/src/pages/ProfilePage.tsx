import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
import { useApi } from '../contexts/ApiContext'
import { Navbar } from '../components/Navbar'
import styles from './ProfilePage.module.css'

// ─── Block frame ──────────────────────────────────────────────────────────────

interface BlockProps {
  eyebrow: string
  title: string
  sub?: string
  action?: React.ReactNode
  children: React.ReactNode
}

function Block({ eyebrow, title, sub, action, children }: Readonly<BlockProps>) {
  return (
    <section className={styles.block}>
      <div className={styles.blockHead}>
        <div>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h2 className={styles.blockTitle}>{title}</h2>
          {sub && <p className={styles.blockSub}>{sub}</p>}
        </div>
        {action && <div className={styles.blockAction}>{action}</div>}
      </div>
      <div className={styles.blockBody}>{children}</div>
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
  onSave: (name: string, country: string) => Promise<void>
}

function AccountInfo({ name, email, country, targetYear, onSave }: Readonly<AccountInfoProps>) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(name ?? '')
  const [editCountry, setEditCountry] = useState(country ?? '')
  const [saving, setSaving] = useState(false)

  const handleEdit = () => {
    setEditName(name ?? '')
    setEditCountry(country ?? '')
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(editName, editCountry)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const gradYear = targetYear ? `Class of ${targetYear}` : '—'

  return (
    <Block
      eyebrow="Account"
      title="Who you are"
      sub="We use this to personalize your shortlist and address letters of motivation. Nothing here leaves Unipath."
      action={
        editing ? undefined : (
          <button className="btn btn-ghost" onClick={handleEdit} type="button">
            Edit
          </button>
        )
      }
    >
      {editing ? (
        <div className={styles.editForm}>
          <div className={styles.editGrid}>
            <div className={styles.editField}>
              <label className={styles.fieldLabel}>Full name</label>
              <input
                className="input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                autoFocus
              />
            </div>
            <div className={styles.editField}>
              <label className={styles.fieldLabel}>Country</label>
              <input
                className="input"
                value={editCountry}
                onChange={(e) => setEditCountry(e.target.value)}
                placeholder="Kazakhstan"
              />
            </div>
          </div>
          <div className={styles.editActions}>
            <button className="btn btn-ghost" onClick={() => setEditing(false)} type="button">
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={() => void handleSave()}
              disabled={saving}
              type="button"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          <Field label="Full name">{name || '—'}</Field>
          <Field label="Email">{email}</Field>
          <Field label="Country">{country || '—'}</Field>
          <Field label="Graduating">{gradYear}</Field>
        </div>
      )}
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
      eyebrow="Your profile"
      title="What you told us"
      sub="These are the answers we used to build your shortlist. Update anything here and we'll re-check your recommendations."
      action={
        <button className={styles.editLink} onClick={onEditAnswers} type="button">
          Edit answers
        </button>
      }
    >
      <div className={styles.grid}>
        <Field label="Field of study">{careerDirection || '—'}</Field>
        <Field label="GPA / average">{gpa}</Field>
        <Field label="English level">{englishLevel}</Field>
        <Field label="Annual budget">{budget}</Field>
      </div>

      <div className={styles.divider} />

      <div className={styles.stack}>
        <div className={styles.fieldLabel}>Regions you&apos;d consider</div>
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
          <div className={styles.fieldLabel}>Why you want to study abroad</div>
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
  onUnlink: () => Promise<void>
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
  onUnlink,
}: Readonly<TelegramBlockProps>) {
  if (loading) {
    return (
      <Block eyebrow="Stay on track" title="Connect the Telegram bot">
        <p className={styles.hint}>Checking connection…</p>
      </Block>
    )
  }

  if (linked) {
    const linkedDate = linkedAt ? new Date(linkedAt).toLocaleDateString() : null
    return (
      <Block
        eyebrow="Stay on track"
        title="Telegram connected"
        sub={
          linkedDate
            ? `Connected on ${linkedDate}. The bot sends your daily check-in — you can pause it any time.`
            : 'The bot sends your daily check-in — you can pause it any time.'
        }
      >
        <div className={styles.tgConnected}>
          <div className={styles.tgStatus}>
            <span className={`${styles.statusDot} ${styles.statusConnected}`} />
            <span>Connected</span>
          </div>
          <label className={styles.tgReminderRow}>
            <Toggle
              on={remindersEnabled}
              onChange={(v) => void onToggleReminders(v)}
              label="Daily reminders"
            />
            <span className={styles.tgReminderLabel}>Daily reminders on</span>
          </label>
          <button className="btn btn-ghost" onClick={() => void onUnlink()} type="button">
            Disconnect
          </button>
        </div>
      </Block>
    )
  }

  return (
    <Block
      eyebrow="Stay on track"
      title="Connect the Telegram bot"
      sub="Daily nudges in your pocket. The bot sends one message a day with what's due — no spam, no marketing. You can pause it any time."
    >
      <button
        className="btn btn-primary"
        onClick={() => void onConnect()}
        disabled={generating}
        type="button"
      >
        {generating ? 'Opening Telegram…' : 'Connect via Telegram'}
      </button>
    </Block>
  )
}

interface NotificationsProps {
  deadlinesEnabled: boolean
  onDeadlinesChange: (enabled: boolean) => void
}

function Notifications({ deadlinesEnabled, onDeadlinesChange }: Readonly<NotificationsProps>) {
  return (
    <Block
      eyebrow="Reminders"
      title="What we'll nudge you about"
      sub="The whole point of Unipath is that you actually do the work. Pick what helps and turn off what doesn't."
    >
      <ul className={styles.prefList}>
        <li className={styles.prefRow}>
          <div className={styles.prefText}>
            <div className={styles.prefTitle}>Deadline countdowns</div>
            <div className={styles.prefSub}>
              A heads-up at 7 and 1 day before each application closes.
            </div>
          </div>
          <Toggle on={deadlinesEnabled} onChange={onDeadlinesChange} label="Deadline countdowns" />
        </li>
      </ul>
    </Block>
  )
}

interface PreferencesBlockProps {
  parentEmail: string
  onChange: (val: string) => void
}

function PreferencesBlock({ parentEmail, onChange }: Readonly<PreferencesBlockProps>) {
  return (
    <Block
      eyebrow="Preferences"
      title="Extra contacts"
      sub="Optional — used only for the weekly recap if you turn it on above."
    >
      <div className={styles.prefField}>
        <div className={styles.fieldLabel}>
          Parent / guardian email <span className={styles.optional}>(optional)</span>
        </div>
        <input
          className="input"
          placeholder="parent@email.com"
          value={parentEmail}
          onChange={(e) => onChange(e.target.value)}
          type="email"
        />
      </div>
    </Block>
  )
}

interface DeleteProfileProps {
  onDelete: () => Promise<void>
}

function DeleteProfile({ onDelete }: Readonly<DeleteProfileProps>) {
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
    <section className={`${styles.block} ${styles.blockDanger}`}>
      <div className={styles.blockHead}>
        <div>
          <span className={`${styles.eyebrow} ${styles.eyebrowDanger}`}>Danger zone</span>
          <h2 className={`${styles.blockTitle} ${styles.titleDanger}`}>Delete your profile</h2>
          <p className={styles.blockSub}>
            Permanently deletes your account, shortlist, action plans, task history, and disconnects
            the Telegram bot. This can&apos;t be undone.
          </p>
        </div>
      </div>
      <div className={styles.blockBody}>
        {!confirming ? (
          <button className={styles.btnDanger} onClick={() => setConfirming(true)} type="button">
            Delete my profile
          </button>
        ) : (
          <div className={styles.dangerConfirm}>
            <div className={styles.fieldLabel}>
              Type <strong>delete my profile</strong> to confirm
            </div>
            <input
              className="input"
              placeholder="delete my profile"
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
                Cancel
              </button>
              <button
                className={styles.btnDanger}
                disabled={text.trim().toLowerCase() !== 'delete my profile' || deleting}
                onClick={() => void handleDelete()}
                type="button"
              >
                {deleting ? 'Deleting…' : 'Delete forever'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const { user, logout } = useAuth()
  const { profile, saveProfileToAPI, clearProfile } = useProfile()
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

  const handleUnlinkTelegram = async () => {
    await api.unlinkTelegram()
    setTg({ linked: false, remindersEnabled: true, loading: false, generating: false })
  }

  const [parentEmail, setParentEmail] = useState('')

  const handleSaveAccount = async (name: string, country: string) => {
    await saveProfileToAPI({ name, country })
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
          <h1 className={styles.profName}>{name || 'Your Profile'}</h1>
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
            onSave={handleSaveAccount}
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
            onUnlink={handleUnlinkTelegram}
          />

          <Notifications
            deadlinesEnabled={tg.remindersEnabled}
            onDeadlinesChange={(enabled) => void handleToggleReminders(enabled)}
          />

          <PreferencesBlock parentEmail={parentEmail} onChange={setParentEmail} />
        </div>

        <DeleteProfile onDelete={handleDelete} />
      </div>
    </div>
  )
}
