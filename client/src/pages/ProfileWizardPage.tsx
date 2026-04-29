import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProfile } from '../contexts/ProfileContext'
import { useApi } from '../contexts/ApiContext'
import { Navbar } from '../components/Navbar'
import { AiGeneratingOverlay } from '../components/AiGeneratingOverlay'
import type { PartialProfile } from '../types'
import styles from './ProfileWizardPage.module.css'

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
            onChange={(e) => onChange({ age: Number(e.target.value) })}
            placeholder="16"
          />
          {errors?.age && <p className={styles.fieldError}>{errors.age}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t('wizard.basics.gradeLabel')}</label>
          <input
            className="input"
            type="number"
            min={9}
            max={12}
            value={data.grade ?? ''}
            onChange={(e) => onChange({ grade: Number(e.target.value) })}
            placeholder="11"
          />
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
        <input
          className="input"
          type="number"
          min={2025}
          max={2030}
          value={data.targetYear ?? new Date().getFullYear() + 1}
          onChange={(e) => onChange({ targetYear: Number(e.target.value) })}
          placeholder={String(new Date().getFullYear() + 1)}
        />
      </div>
    </div>
  )
}

function StepMotivation({ data, onChange }: StepProps) {
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
      </div>
    </div>
  )
}

function StepInterests({ data, onChange }: StepProps) {
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
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('wizard.interests.careerLabel')}</label>
        <input
          className="input"
          value={data.careerDirection ?? ''}
          onChange={(e) => onChange({ careerDirection: e.target.value })}
          placeholder={t('wizard.interests.careerPlaceholder')}
        />
      </div>
    </div>
  )
}

function StepLanguages({ data, onChange }: StepProps) {
  const { t } = useTranslation()
  const levelKeys = ['beginner', 'elementary', 'intermediate', 'advanced', 'native']
  const languages = data.languages ?? [{ language: '', level: '' }]

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
      <button type="button" className={`btn btn-ghost ${styles.addBtn}`} onClick={addLang}>
        {t('wizard.languages.addLanguage')}
      </button>
    </div>
  )
}

function StepBudget({ data, onChange }: StepProps) {
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
            step={1000}
            value={data.tuitionMin ?? ''}
            onChange={(e) => onChange({ tuitionMin: Number(e.target.value) })}
            placeholder="5000"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t('wizard.budget.toLabel')}</label>
          <input
            className="input"
            type="number"
            min={0}
            step={1000}
            value={data.tuitionMax ?? ''}
            onChange={(e) => onChange({ tuitionMax: Number(e.target.value) })}
            placeholder="20000"
          />
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
      </div>
    </div>
  )
}

function StepPreferences({ data, onChange, errors }: StepProps) {
  const { t } = useTranslation()
  const countryOptions = ['USA', 'Canada', 'UK', 'Germany', 'South Korea']
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

const stepComponents = [
  StepBasics,
  StepMotivation,
  StepInterests,
  StepLanguages,
  StepBudget,
  StepPreferences,
  StepExtracurriculars,
]

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
    ...(profile ?? {}),
  })
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const StepComponent = stepComponents[step]
  const total = STEPS.length
  const isLast = step === total - 1

  const handleChange = (updates: PartialProfile) => {
    setLocalData((prev) => ({ ...prev, ...updates }))
  }

  const getStepErrors = (): Record<string, string> => {
    if (step === 0) {
      const errs: Record<string, string> = {}
      if (!localData.name?.trim()) errs.name = 'Please enter your name.'
      if (!localData.age) errs.age = 'Please enter your age.'
      else if (localData.age < 16) errs.age = 'You must be at least 16 to use Unipath.'
      if (!localData.country) errs.country = 'Please select your country.'
      if (!localData.targetYear) errs.year = 'Please enter your target enrollment year.'
      return errs
    }
    if (step === 5) {
      const errs: Record<string, string> = {}
      if (!localData.preferredCountries?.length)
        errs.preferredCountries = 'Please select at least one country.'
      return errs
    }
    return {}
  }

  const stepErrors = getStepErrors()
  const isStepValid = Object.keys(stepErrors).length === 0

  const visibleErrors = (): Record<string, string> => {
    if (step === 0) {
      const errs: Record<string, string> = {}
      if (localData.age && localData.age < 16) errs.age = 'You must be at least 16 to use Unipath.'
      return errs
    }
    return {}
  }

  const handleNext = async () => {
    if (!isStepValid) {
      setError('')
      return
    }
    setError('')
    setProfile(localData)
    if (isLast) {
      setGenerating(true)
      setError('')
      try {
        const merged = { ...(profile ?? {}), ...localData }
        await saveProfileToAPI(merged)
        const shortlists = await api.getShortlists()
        if (shortlists.length === 0) {
          await api.generateShortlist(merged)
        }
        navigate('/dashboard')
      } catch {
        setError('Something went wrong. Please try again.')
        setGenerating(false)
      }
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1)
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
          <StepComponent data={localData} onChange={handleChange} errors={visibleErrors()} />
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
              className="btn btn-primary"
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
