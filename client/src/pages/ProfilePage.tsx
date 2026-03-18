import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
import { Navbar } from '../components/Navbar'
import type { PartialProfile } from '../types'
import styles from './ProfilePage.module.css'

const SUBJECT_KEYS = [
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
const ACTIVITY_KEYS = [
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
const LEVEL_KEYS = ['beginner', 'elementary', 'intermediate', 'advanced', 'native']
const COUNTRY_OPTIONS = [
  'Germany',
  'Czech Republic',
  'Hungary',
  'Poland',
  'Russia',
  'UK',
  'USA',
  'Canada',
  'Netherlands',
  'Austria',
  'Turkey',
  'South Korea',
]
const VIBE_KEYS = ['cityBig', 'citySmall', 'cityTown', 'cityAny'] as const

export function ProfilePage() {
  const { profile, setProfile } = useProfile()
  const { user, logout } = useAuth()
  const { t } = useTranslation()

  const [data, setData] = useState<PartialProfile>(profile ?? {})
  const [saved, setSaved] = useState(false)

  const update = (updates: PartialProfile) => setData((prev) => ({ ...prev, ...updates }))

  const handleSave = () => {
    setProfile(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleChip = (field: 'subjects' | 'activities' | 'preferredCountries', val: string) => {
    const arr = (data[field] as string[]) ?? []
    update({ [field]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] })
  }

  const updateLang = (idx: number, field: 'language' | 'level', value: string) => {
    const langs = data.languages ?? [{ language: '', level: '' }]
    update({ languages: langs.map((l, i) => (i === idx ? { ...l, [field]: value } : l)) })
  }

  const addLang = () => {
    const langs = data.languages ?? []
    update({ languages: [...langs, { language: '', level: '' }] })
  }

  const removeLang = (idx: number) => {
    const langs = data.languages ?? []
    update({ languages: langs.filter((_, i) => i !== idx) })
  }

  const langs = data.languages ?? [{ language: '', level: '' }]

  return (
    <div className={styles.page}>
      <Navbar showBack />

      <div className={styles.container}>
        <h1 className={styles.title}>{t('profile.title')}</h1>

        {/* Basics */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('wizard.steps.basics')}</h2>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>{t('wizard.basics.nameLabel')}</label>
              <input
                className="input"
                value={data.name ?? ''}
                onChange={(e) => update({ name: e.target.value })}
                placeholder={t('wizard.basics.namePlaceholder')}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('wizard.basics.countryLabel')}</label>
              <input
                className="input"
                value={data.country ?? ''}
                onChange={(e) => update({ country: e.target.value })}
                placeholder={t('wizard.basics.countryPlaceholder')}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('wizard.basics.ageLabel')}</label>
              <input
                className="input"
                type="number"
                min={14}
                max={20}
                value={data.age ?? ''}
                onChange={(e) => update({ age: Number(e.target.value) })}
                placeholder="16"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('wizard.basics.gradeLabel')}</label>
              <input
                className="input"
                type="number"
                min={9}
                max={12}
                value={data.grade ?? ''}
                onChange={(e) => update({ grade: Number(e.target.value) })}
                placeholder="11"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('wizard.basics.yearLabel')}</label>
              <input
                className="input"
                type="number"
                min={2025}
                max={2030}
                value={data.targetYear ?? ''}
                onChange={(e) => update({ targetYear: Number(e.target.value) })}
                placeholder="2026"
              />
            </div>
          </div>
        </section>

        {/* Motivation */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('wizard.steps.motivation')}</h2>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label}>{t('wizard.motivation.whyLabel')}</label>
              <textarea
                className={`input ${styles.textarea}`}
                value={data.whyAbroad ?? ''}
                onChange={(e) => update({ whyAbroad: e.target.value })}
                placeholder={t('wizard.motivation.whyPlaceholder')}
                rows={4}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('wizard.motivation.returnLabel')}</label>
              <div className={styles.options}>
                {[
                  { value: true as boolean | null, key: 'wizard.motivation.returnYes' },
                  { value: false as boolean | null, key: 'wizard.motivation.returnNo' },
                  { value: null as boolean | null, key: 'wizard.motivation.returnUnknown' },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    className={`${styles.optionBtn} ${data.planToReturn === opt.value ? styles.optionBtnActive : ''}`}
                    onClick={() => update({ planToReturn: opt.value })}
                  >
                    {t(opt.key)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interests */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('wizard.steps.interests')}</h2>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label}>{t('wizard.interests.subjectsLabel')}</label>
              <div className={styles.chips}>
                {SUBJECT_KEYS.map((key) => {
                  const val = t(`wizard.interests.subjects.${key}`)
                  const active = (data.subjects ?? []).includes(val)
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.chipBtn} ${active ? styles.chipBtnActive : ''}`}
                      onClick={() => toggleChip('subjects', val)}
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
                onChange={(e) => update({ careerDirection: e.target.value })}
                placeholder={t('wizard.interests.careerPlaceholder')}
              />
            </div>
          </div>
        </section>

        {/* Languages */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('wizard.steps.languages')}</h2>
          <div className={styles.fields}>
            {langs.map((l, idx) => (
              <div key={idx} className={styles.langRow}>
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
                    {LEVEL_KEYS.map((key) => (
                      <option key={key} value={t(`wizard.languages.levels.${key}`)}>
                        {t(`wizard.languages.levels.${key}`)}
                      </option>
                    ))}
                  </select>
                </div>
                {langs.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeLang(idx)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button" className={`btn btn-ghost ${styles.addBtn}`} onClick={addLang}>
              {t('wizard.languages.addLanguage')}
            </button>
          </div>
        </section>

        {/* Budget */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('wizard.steps.budget')}</h2>
          <div className={styles.fields}>
            <p className={styles.hint}>{t('wizard.budget.hint')}</p>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>{t('wizard.budget.fromLabel')}</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  step={1000}
                  value={data.tuitionMin ?? ''}
                  onChange={(e) => update({ tuitionMin: Number(e.target.value) })}
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
                  onChange={(e) => update({ tuitionMax: Number(e.target.value) })}
                  placeholder="20000"
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('wizard.budget.scholarshipLabel')}</label>
              <div className={styles.options}>
                {[
                  { value: true, key: 'wizard.budget.scholarshipYes' },
                  { value: false, key: 'wizard.budget.scholarshipNo' },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    className={`${styles.optionBtn} ${data.openToScholarship === opt.value ? styles.optionBtnActive : ''}`}
                    onClick={() => update({ openToScholarship: opt.value })}
                  >
                    {t(opt.key)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('wizard.steps.preferences')}</h2>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label}>{t('wizard.preferences.countriesLabel')}</label>
              <div className={styles.chips}>
                {COUNTRY_OPTIONS.map((c) => {
                  const active = (data.preferredCountries ?? []).includes(c)
                  return (
                    <button
                      key={c}
                      type="button"
                      className={`${styles.chipBtn} ${active ? styles.chipBtnActive : ''}`}
                      onClick={() => toggleChip('preferredCountries', c)}
                    >
                      {c}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('wizard.preferences.cityLabel')}</label>
              <div className={styles.options}>
                {VIBE_KEYS.map((key) => {
                  const val = t(`wizard.preferences.${key}`)
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.optionBtn} ${data.cityVibe === val ? styles.optionBtnActive : ''}`}
                      onClick={() => update({ cityVibe: val })}
                    >
                      {val}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Extracurriculars */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('wizard.steps.extracurriculars')}</h2>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label}>{t('wizard.extracurriculars.activitiesLabel')}</label>
              <div className={styles.chips}>
                {ACTIVITY_KEYS.map((key) => {
                  const val = t(`wizard.extracurriculars.activities.${key}`)
                  const active = (data.activities ?? []).includes(val)
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.chipBtn} ${active ? styles.chipBtnActive : ''}`}
                      onClick={() => toggleChip('activities', val)}
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
                onChange={(e) => update({ strengths: e.target.value })}
                placeholder={t('wizard.extracurriculars.strengthsPlaceholder')}
                rows={3}
              />
            </div>
          </div>
        </section>

        {/* Footer actions */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <span className={styles.email}>{user?.email}</span>
          </div>
          <div className={styles.footerRight}>
            <button type="button" className={styles.signOutBtn} onClick={logout}>
              {t('profile.signOut')}
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              {saved ? t('profile.saved') : t('profile.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
