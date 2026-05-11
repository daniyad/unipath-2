import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProfile } from '../contexts/ProfileContext'
import { useApi } from '../contexts/ApiContext'
import { Navbar } from '../components/Navbar'
import { AiGeneratingOverlay } from '../components/AiGeneratingOverlay'
import type { PartialProfile } from '../types'
import styles from './ProfileWizardPage.module.css'
import universitiesData from '../data/universities.json'

const CIS_COUNTRIES = [
  'Kazakhstan',
  'Kyrgyzstan',
  'Tajikistan',
  'Turkmenistan',
  'Uzbekistan',
  'Russia',
  'Belarus',
  'Ukraine',
  'Armenia',
  'Azerbaijan',
  'Georgia',
  'Moldova',
]

const STEPS = [
  { key: 'basics' },
  { key: 'motivation' },
  { key: 'interests' },
  { key: 'languages' },
  { key: 'budget' },
  { key: 'preferences' },
  { key: 'extracurriculars' },
  { key: 'universities' },
]

interface StepProps {
  data: PartialProfile
  onChange: (updates: PartialProfile) => void
  errors?: Record<string, string>
}

function StepBasics({ data, onChange, errors }: StepProps) {
  const { t } = useTranslation()
  return (
    <div className={styles.fields}>
      <div className={styles.field}>
        <label className={styles.label}>{t('wizard.basics.nameLabel')}</label>
        <input
          className="input"
          value={data.name ?? ''}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={t('wizard.basics.namePlaceholder')}
        />
        {errors?.name && <p className={styles.fieldError}>{errors.name}</p>}
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>{t('wizard.basics.ageLabel')}</label>
          <input
            className="input"
            type="number"
            min={16}
            max={25}
            value={data.age ?? ''}
            onChange={(e) =>
              onChange({ age: e.target.value === '' ? undefined : Number(e.target.value) })
            }
            onBlur={(e) => {
              const v = Number(e.target.value)
              if (v) onChange({ age: Math.min(25, Math.max(16, v)) })
            }}
            placeholder="16"
          />
          {errors?.age && <p className={styles.fieldError}>{errors.age}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t('wizard.basics.gradeLabel')}</label>
          <select
            className="input"
            value={data.grade ?? ''}
            onChange={(e) =>
              onChange({ grade: e.target.value === '' ? undefined : Number(e.target.value) })
            }
          >
            <option value="">—</option>
            {[9, 10, 11, 12].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          {errors?.grade && <p className={styles.fieldError}>{errors.grade}</p>}
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>{t('wizard.basics.scoreLabel')}</label>
          <input
            className="input"
            type="number"
            min={0}
            step={0.1}
            value={data.academicScore ?? ''}
            onChange={(e) => onChange({ academicScore: Number(e.target.value) })}
            placeholder={t('wizard.basics.scorePlaceholder')}
          />
          {errors?.academicScore && <p className={styles.fieldError}>{errors.academicScore}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t('wizard.basics.scoreMaxLabel')}</label>
          <select
            className="input"
            value={data.academicScoreMax ?? ''}
            onChange={(e) => onChange({ academicScoreMax: Number(e.target.value) })}
          >
            <option value="">—</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={100}>100</option>
          </select>
          {errors?.academicScoreMax && (
            <p className={styles.fieldError}>{errors.academicScoreMax}</p>
          )}
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('wizard.basics.countryLabel')}</label>
        <select
          className="input"
          value={data.country ?? CIS_COUNTRIES[0]}
          onChange={(e) => onChange({ country: e.target.value })}
        >
          {CIS_COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('wizard.basics.yearLabel')}</label>
        <select
          className="input"
          value={data.targetYear ?? new Date().getFullYear() + 1}
          onChange={(e) => onChange({ targetYear: Number(e.target.value) })}
        >
          {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        {errors?.targetYear && <p className={styles.fieldError}>{errors.targetYear}</p>}
      </div>
    </div>
  )
}

function StepMotivation({ data, onChange, errors }: StepProps) {
  const { t } = useTranslation()
  const returnOptions = [
    { value: true as boolean | null, labelKey: 'wizard.motivation.returnYes' },
    { value: false as boolean | null, labelKey: 'wizard.motivation.returnNo' },
    { value: null as boolean | null, labelKey: 'wizard.motivation.returnUnknown' },
  ]
  return (
    <div className={styles.fields}>
      <div className={styles.field}>
        <label className={styles.label}>{t('wizard.motivation.whyLabel')}</label>
        <textarea
          className={`input ${styles.textarea}`}
          value={data.whyAbroad ?? ''}
          onChange={(e) => onChange({ whyAbroad: e.target.value })}
          placeholder={t('wizard.motivation.whyPlaceholder')}
          rows={4}
        />
        {errors?.whyAbroad && <p className={styles.fieldError}>{errors.whyAbroad}</p>}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('wizard.motivation.returnLabel')}</label>
        <div className={styles.options}>
          {returnOptions.map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              className={`${styles.optionBtn} ${data.planToReturn === opt.value ? styles.optionBtnActive : ''}`}
              onClick={() => onChange({ planToReturn: opt.value })}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
        {errors?.planToReturn && <p className={styles.fieldError}>{errors.planToReturn}</p>}
      </div>
    </div>
  )
}

function StepInterests({ data, onChange, errors }: StepProps) {
  const { t } = useTranslation()
  const subjectKeys = [
    'math',
    'physics',
    'chemistry',
    'biology',
    'it',
    'economics',
    'history',
    'languages',
    'art',
    'medicine',
    'law',
    'psychology',
  ]
  const subjects = data.subjects ?? []
  const toggle = (s: string) => {
    onChange({
      subjects: subjects.includes(s) ? subjects.filter((x) => x !== s) : [...subjects, s],
    })
  }
  return (
    <div className={styles.fields}>
      <div className={styles.field}>
        <label className={styles.label}>{t('wizard.interests.subjectsLabel')}</label>
        <div className={styles.chips}>
          {subjectKeys.map((key) => {
            const val = t(`wizard.interests.subjects.${key}`)
            return (
              <button
                key={key}
                type="button"
                className={`${styles.chipBtn} ${subjects.includes(val) ? styles.chipBtnActive : ''}`}
                onClick={() => toggle(val)}
              >
                {val}
              </button>
            )
          })}
        </div>
        {errors?.subjects && <p className={styles.fieldError}>{errors.subjects}</p>}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('wizard.interests.careerLabel')}</label>
        <input
          className="input"
          value={data.careerDirection ?? ''}
          onChange={(e) => onChange({ careerDirection: e.target.value })}
          placeholder={t('wizard.interests.careerPlaceholder')}
        />
        {errors?.careerDirection && <p className={styles.fieldError}>{errors.careerDirection}</p>}
      </div>
    </div>
  )
}

function StepLanguages({ data, onChange, errors }: StepProps) {
  const { t } = useTranslation()
  const levelKeys = ['beginner', 'elementary', 'intermediate', 'advanced', 'native']
  const languages = data.languages ?? [{ language: 'English', level: '' }]

  const updateLang = (idx: number, field: 'language' | 'level', value: string) => {
    const updated = languages.map((l, i) => (i === idx ? { ...l, [field]: value } : l))
    onChange({ languages: updated })
  }

  const addLang = () => onChange({ languages: [...languages, { language: '', level: '' }] })

  return (
    <div className={styles.fields}>
      <p className={styles.hint}>{t('wizard.languages.hint')}</p>
      {languages.map((l, idx) => (
        <div key={idx} className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>{t('wizard.languages.languageLabel')}</label>
            <input
              className="input"
              value={l.language}
              onChange={(e) => updateLang(idx, 'language', e.target.value)}
              placeholder={t('wizard.languages.languagePlaceholder')}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t('wizard.languages.levelLabel')}</label>
            <select
              className="input"
              value={l.level}
              onChange={(e) => updateLang(idx, 'level', e.target.value)}
            >
              <option value="">{t('wizard.languages.levelPlaceholder')}</option>
              {levelKeys.map((key) => (
                <option key={key} value={t(`wizard.languages.levels.${key}`)}>
                  {t(`wizard.languages.levels.${key}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
      {errors?.languages && <p className={styles.fieldError}>{errors.languages}</p>}
      <button type="button" className={`btn btn-ghost ${styles.addBtn}`} onClick={addLang}>
        {t('wizard.languages.addLanguage')}
      </button>
    </div>
  )
}

function StepBudget({ data, onChange, errors }: StepProps) {
  const { t } = useTranslation()
  const scholarshipOptions = [
    { value: true, labelKey: 'wizard.budget.scholarshipYes' },
    { value: false, labelKey: 'wizard.budget.scholarshipNo' },
  ]
  return (
    <div className={styles.fields}>
      <p className={styles.hint}>{t('wizard.budget.hint')}</p>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>{t('wizard.budget.fromLabel')}</label>
          <input
            className="input"
            type="number"
            min={0}
            max={150000}
            step={1000}
            value={data.tuitionMin ?? ''}
            onChange={(e) =>
              onChange({ tuitionMin: e.target.value === '' ? undefined : Number(e.target.value) })
            }
            onBlur={(e) => {
              const v = Number(e.target.value)
              if (v) onChange({ tuitionMin: Math.min(150000, Math.max(0, v)) })
            }}
            placeholder="5000"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t('wizard.budget.toLabel')}</label>
          <input
            className="input"
            type="number"
            min={0}
            max={150000}
            step={1000}
            value={data.tuitionMax ?? ''}
            onChange={(e) =>
              onChange({ tuitionMax: e.target.value === '' ? undefined : Number(e.target.value) })
            }
            onBlur={(e) => {
              const v = Number(e.target.value)
              if (v) onChange({ tuitionMax: Math.min(150000, Math.max(0, v)) })
            }}
            placeholder="20000"
          />
          {errors?.tuitionMax && <p className={styles.fieldError}>{errors.tuitionMax}</p>}
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('wizard.budget.scholarshipLabel')}</label>
        <div className={styles.options}>
          {scholarshipOptions.map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              className={`${styles.optionBtn} ${data.openToScholarship === opt.value ? styles.optionBtnActive : ''}`}
              onClick={() => onChange({ openToScholarship: opt.value })}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
        {errors?.openToScholarship && (
          <p className={styles.fieldError}>{errors.openToScholarship}</p>
        )}
      </div>
    </div>
  )
}

function StepPreferences({ data, onChange, errors }: StepProps) {
  const { t } = useTranslation()
  const countryOptions = ['USA', 'Canada', 'UK', 'Germany', 'South Korea', 'UAE']
  const vibeKeys = ['cityBig', 'citySmall', 'cityTown', 'cityAny'] as const
  const preferred = data.preferredCountries ?? []
  const toggle = (c: string) => {
    onChange({
      preferredCountries: preferred.includes(c)
        ? preferred.filter((x) => x !== c)
        : [...preferred, c],
    })
  }

  return (
    <div className={styles.fields}>
      <div className={styles.field}>
        <label className={styles.label}>{t('wizard.preferences.countriesLabel')}</label>
        <p className={styles.hint}>{t('wizard.preferences.countriesHint')}</p>
        <div className={styles.chips}>
          {countryOptions.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.chipBtn} ${preferred.includes(c) ? styles.chipBtnActive : ''}`}
              onClick={() => toggle(c)}
            >
              {c}
            </button>
          ))}
        </div>
        {errors?.preferredCountries && (
          <p className={styles.fieldError}>{errors.preferredCountries}</p>
        )}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('wizard.preferences.cityLabel')}</label>
        <div className={styles.options}>
          {vibeKeys.map((key) => {
            const val = t(`wizard.preferences.${key}`)
            return (
              <button
                key={key}
                type="button"
                className={`${styles.optionBtn} ${data.cityVibe === val ? styles.optionBtnActive : ''}`}
                onClick={() => onChange({ cityVibe: val })}
              >
                {val}
              </button>
            )
          })}
        </div>
        {errors?.cityVibe && <p className={styles.fieldError}>{errors.cityVibe}</p>}
      </div>
    </div>
  )
}

function StepExtracurriculars({ data, onChange }: StepProps) {
  const { t } = useTranslation()
  const activityKeys = [
    'sports',
    'music',
    'volunteering',
    'olympiads',
    'debate',
    'council',
    'startup',
    'art',
    'science',
  ]
  const activities = data.activities ?? []
  const toggle = (a: string) => {
    onChange({
      activities: activities.includes(a) ? activities.filter((x) => x !== a) : [...activities, a],
    })
  }
  return (
    <div className={styles.fields}>
      <div className={styles.field}>
        <label className={styles.label}>{t('wizard.extracurriculars.activitiesLabel')}</label>
        <div className={styles.chips}>
          {activityKeys.map((key) => {
            const val = t(`wizard.extracurriculars.activities.${key}`)
            return (
              <button
                key={key}
                type="button"
                className={`${styles.chipBtn} ${activities.includes(val) ? styles.chipBtnActive : ''}`}
                onClick={() => toggle(val)}
              >
                {val}
              </button>
            )
          })}
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('wizard.extracurriculars.strengthsLabel')}</label>
        <textarea
          className={`input ${styles.textarea}`}
          value={data.strengths ?? ''}
          onChange={(e) => onChange({ strengths: e.target.value })}
          placeholder={t('wizard.extracurriculars.strengthsPlaceholder')}
          rows={3}
        />
      </div>
    </div>
  )
}

function StepUniversities({ data, onChange, errors }: StepProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const mode = data.universitySelectionMode
  const picks = data.selectedUniversities ?? []

  const filtered = useMemo(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) return []
    const lower = trimmed.toLowerCase()
    return (universitiesData as Array<{ name: string; country: string }>)
      .filter((u) => u.name.toLowerCase().includes(lower))
      .slice(0, 20)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addPick = (uni: { name: string; country: string }) => {
    if (picks.length >= 3 || picks.some((p) => p.name === uni.name)) return
    onChange({ selectedUniversities: [...picks, { name: uni.name, country: uni.country }] })
    setQuery('')
    setShowResults(false)
  }

  const removePick = (name: string) => {
    onChange({ selectedUniversities: picks.filter((p) => p.name !== name) })
  }

  const queryTrimmed = query.trim()
  const dropdownOpen = showResults && queryTrimmed.length >= 2

  if (!mode) {
    return (
      <div className={styles.fields}>
        <p className={styles.hint}>{t('wizard.universities.subtitle')}</p>
        <div className={styles.uniModeCards}>
          <button
            type="button"
            className={styles.uniModeCard}
            onClick={() => onChange({ universitySelectionMode: 'auto' })}
          >
            <span className={styles.uniModeTitle}>{t('wizard.universities.autoTitle')}</span>
            <span className={styles.uniModeDesc}>{t('wizard.universities.autoDesc')}</span>
          </button>
          <button
            type="button"
            className={styles.uniModeCard}
            onClick={() => onChange({ universitySelectionMode: 'manual' })}
          >
            <span className={styles.uniModeTitle}>{t('wizard.universities.manualTitle')}</span>
            <span className={styles.uniModeDesc}>{t('wizard.universities.manualDesc')}</span>
          </button>
        </div>
        {errors?.universitySelectionMode && (
          <p className={styles.fieldError}>{errors.universitySelectionMode}</p>
        )}
      </div>
    )
  }

  if (mode === 'auto') {
    return (
      <div className={styles.fields}>
        <div className={styles.uniAutoConfirm}>
          <p className={styles.uniAutoText}>{t('wizard.universities.autoConfirmation')}</p>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ alignSelf: 'flex-start', fontSize: '13px' }}
          onClick={() => onChange({ universitySelectionMode: undefined })}
        >
          ← {t('wizard.universities.changeChoice')}
        </button>
      </div>
    )
  }

  return (
    <div className={styles.fields}>
      <button
        type="button"
        className="btn btn-ghost"
        style={{ alignSelf: 'flex-start', fontSize: '13px' }}
        onClick={() => onChange({ universitySelectionMode: undefined, selectedUniversities: [] })}
      >
        ← {t('wizard.universities.changeChoice')}
      </button>

      {picks.length < 3 && (
        <div className={styles.field}>
          <label className={styles.label}>{t('wizard.universities.searchLabel')}</label>
          <p className={styles.hint}>{t('wizard.universities.searchCountriesNote')}</p>
          <div className={styles.searchWrap} ref={searchRef}>
            <input
              className="input"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setShowResults(true)
              }}
              placeholder={t('wizard.universities.searchPlaceholder')}
              onFocus={() => setShowResults(true)}
            />
            {dropdownOpen && filtered.length > 0 && (
              <div className={styles.searchResults}>
                {filtered.map((r) => (
                  <button
                    key={r.name}
                    type="button"
                    className={styles.searchResult}
                    onClick={() => addPick(r)}
                    disabled={picks.some((p) => p.name === r.name)}
                  >
                    <span className={styles.searchResultName}>{r.name}</span>
                    <span className={styles.searchResultCountry}>{r.country}</span>
                  </button>
                ))}
              </div>
            )}
            {dropdownOpen && filtered.length === 0 && (
              <div className={styles.searchEmpty}>{t('wizard.universities.searchNotFound')}</div>
            )}
          </div>
        </div>
      )}

      {picks.length > 0 && (
        <div className={styles.field}>
          <label className={styles.label}>{t('wizard.universities.selectedLabel')}</label>
          <div className={styles.uniPicks}>
            {picks.map((p) => (
              <div key={p.name} className={styles.uniPickCard}>
                <div>
                  <span className={styles.uniPickName}>{p.name}</span>
                  {p.country && <span className={styles.uniPickCountry}>{p.country}</span>}
                </div>
                <button
                  type="button"
                  className={styles.uniPickRemove}
                  onClick={() => removePick(p.name)}
                  aria-label={t('wizard.universities.removeButton')}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {picks.length > 0 && picks.length < 3 && (
        <p className={styles.uniNudge}>
          {t('wizard.universities.nudge', { remaining: 3 - picks.length })}
        </p>
      )}

      {errors?.selectedUniversities && (
        <p className={styles.fieldError}>{errors.selectedUniversities}</p>
      )}
    </div>
  )
}

const stepComponents = [
  StepBasics,
  StepMotivation,
  StepInterests,
  StepLanguages,
  StepBudget,
  StepPreferences,
  StepExtracurriculars,
  StepUniversities,
]

function getStepErrors(step: number, data: PartialProfile): Record<string, string> {
  const errs: Record<string, string> = {}

  if (step === 0) {
    if (!data.name?.trim()) errs.name = 'Please enter your name.'
    if (!data.age) errs.age = 'Please enter your age.'
    else if (data.age < 16) errs.age = 'You must be at least 16 to use Unipath.'
    else if (data.age > 25) errs.age = 'Age must be 25 or under.'
    if (!data.grade) errs.grade = 'Please select your grade.'
    if (!data.targetYear) errs.targetYear = 'Please select your target enrollment year.'
    if (!data.academicScore) errs.academicScore = 'Please enter your score.'
    else if (data.academicScoreMax && data.academicScore > data.academicScoreMax)
      errs.academicScore = 'Score cannot exceed the maximum.'
    if (!data.academicScoreMax) errs.academicScoreMax = 'Please select your grading scale.'
  }

  if (step === 1) {
    if (!data.whyAbroad?.trim() || data.whyAbroad.trim().length < 20)
      errs.whyAbroad = 'Please write at least 20 characters about your motivation.'
    if (data.planToReturn === undefined) errs.planToReturn = 'Please select an option.'
  }

  if (step === 2) {
    if (!data.subjects?.length) errs.subjects = 'Please select at least one subject.'
    if (!data.careerDirection?.trim()) errs.careerDirection = 'Please enter a career direction.'
  }

  if (step === 3) {
    const langs = data.languages ?? []
    const hasValid = langs.some((l) => l.language.trim() && l.level)
    if (!hasValid) errs.languages = 'Please add at least one language with a name and level.'
  }

  if (step === 4) {
    if (data.openToScholarship === undefined) errs.openToScholarship = 'Please select an option.'
    if (
      data.tuitionMin !== undefined &&
      data.tuitionMax !== undefined &&
      data.tuitionMin > 0 &&
      data.tuitionMax > 0 &&
      data.tuitionMax < data.tuitionMin
    )
      errs.tuitionMax = 'Max tuition must be at least the minimum.'
  }

  if (step === 5) {
    if (!data.preferredCountries?.length)
      errs.preferredCountries = 'Please select at least one country.'
    if (!data.cityVibe) errs.cityVibe = 'Please select a city size preference.'
  }

  if (step === 7) {
    if (!data.universitySelectionMode)
      errs.universitySelectionMode = "Please choose how you'd like to find universities."
    if (data.universitySelectionMode === 'manual' && !data.selectedUniversities?.length)
      errs.selectedUniversities =
        'Please search for and add at least one university, or switch to letting us find them for you.'
  }

  return errs
}

export function ProfileWizardPage() {
  const { profile, setProfile, saveProfileToAPI } = useProfile()
  const api = useApi()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [localData, setLocalData] = useState<PartialProfile>({
    country: CIS_COUNTRIES[0],
    grade: 11,
    targetYear: new Date().getFullYear() + 1,
    languages: [{ language: 'English', level: '' }],
    ...(profile ?? {}),
  })
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  const StepComponent = stepComponents[step]
  const total = STEPS.length
  const isLast = step === total - 1

  const handleChange = (updates: PartialProfile) => {
    setLocalData((prev) => ({ ...prev, ...updates }))
    setTouchedFields((prev) => {
      const next = new Set(prev)
      Object.keys(updates).forEach((k) => next.add(k))
      return next
    })
  }

  const stepErrors = getStepErrors(step, localData)
  const isStepValid = Object.keys(stepErrors).length === 0
  const visibleErrors = Object.fromEntries(
    Object.entries(stepErrors).filter(([key]) => touchedFields.has(key)),
  )

  const handleNext = async () => {
    setError('')
    setProfile(localData)
    if (isLast) {
      setGenerating(true)
      setError('')
      try {
        const merged = { ...(profile ?? {}), ...localData }
        await saveProfileToAPI(merged)
        const shortlists = await api.getShortlists()
        const isManual =
          merged.universitySelectionMode === 'manual' &&
          (merged.selectedUniversities?.length ?? 0) > 0
        if (shortlists.length === 0 || isManual) {
          await api.generateShortlist(merged)
        }
        navigate('/dashboard')
      } catch {
        setError('Something went wrong. Please try again.')
        setGenerating(false)
      }
    } else {
      setStep((s) => s + 1)
      setTouchedFields(new Set())
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1)
      setTouchedFields(new Set())
    }
  }

  const progressPct = ((step + 1) / total) * 100
  const currentStep = STEPS[step]

  return (
    <div className={styles.page}>
      <AiGeneratingOverlay
        visible={generating}
        messages={[
          'Researching universities...',
          'Checking scholarships...',
          'Building your shortlist...',
        ]}
      />
      <Navbar />
      <div className={styles.container}>
        <div className={styles.progress}>
          <span className={styles.stepLabel}>
            {t('wizard.stepOf', { current: step + 1, total })}
          </span>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div className={styles.card}>
          <h2 className={styles.stepTitle}>{t(`wizard.steps.${currentStep.key}`)}</h2>
          <StepComponent data={localData} onChange={handleChange} errors={visibleErrors} />
          {error && (
            <p style={{ color: 'red', fontSize: 'var(--text-sm)', marginTop: 8 }}>{error}</p>
          )}
          <div className={styles.actions}>
            {step > 0 && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleBack}
                disabled={generating}
              >
                {t('wizard.back')}
              </button>
            )}
            <button
              type="button"
              className={`btn ${isLast ? 'btn-yellow' : 'btn-primary'}`}
              onClick={() => void handleNext()}
              disabled={generating || !isStepValid}
              style={{ marginLeft: 'auto' }}
            >
              {isLast ? t('wizard.done') : t('wizard.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
