import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../contexts/ProfileContext'
import { useLang } from '../contexts/LangContext'
import { LanguageToggle } from '../components/LanguageToggle'
import type { PartialProfile } from '../types'
import styles from './ProfileWizardPage.module.css'

const STEPS = [
  { key: 'basics', titleRu: 'Основное', titleEn: 'Basics' },
  { key: 'motivation', titleRu: 'Мотивация', titleEn: 'Motivation' },
  { key: 'interests', titleRu: 'Интересы', titleEn: 'Interests' },
  { key: 'languages', titleRu: 'Языки', titleEn: 'Languages' },
  { key: 'budget', titleRu: 'Бюджет', titleEn: 'Budget' },
  { key: 'preferences', titleRu: 'Предпочтения', titleEn: 'Preferences' },
  { key: 'extracurriculars', titleRu: 'Активности', titleEn: 'Extracurriculars' },
]

interface StepProps {
  data: PartialProfile
  onChange: (updates: PartialProfile) => void
  lang: 'ru' | 'en'
}

function StepBasics({ data, onChange, lang }: StepProps) {
  const label = (ru: string, en: string) => (lang === 'ru' ? ru : en)
  return (
    <div className={styles.fields}>
      <div className={styles.field}>
        <label className={styles.label}>{label('Как тебя зовут?', 'What is your name?')}</label>
        <input
          className="input"
          value={data.name ?? ''}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={label('Имя', 'Your name')}
        />
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>{label('Возраст', 'Age')}</label>
          <input
            className="input"
            type="number"
            min={14}
            max={20}
            value={data.age ?? ''}
            onChange={(e) => onChange({ age: Number(e.target.value) })}
            placeholder="16"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{label('Класс', 'Grade')}</label>
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
        <label className={styles.label}>{label('Страна', 'Country')}</label>
        <input
          className="input"
          value={data.country ?? ''}
          onChange={(e) => onChange({ country: e.target.value })}
          placeholder={label('Казахстан', 'Kazakhstan')}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          {label('В какой год планируешь поступать?', 'Target enrollment year?')}
        </label>
        <input
          className="input"
          type="number"
          min={2025}
          max={2030}
          value={data.targetYear ?? ''}
          onChange={(e) => onChange({ targetYear: Number(e.target.value) })}
          placeholder="2026"
        />
      </div>
    </div>
  )
}

function StepMotivation({ data, onChange, lang }: StepProps) {
  const label = (ru: string, en: string) => (lang === 'ru' ? ru : en)
  return (
    <div className={styles.fields}>
      <div className={styles.field}>
        <label className={styles.label}>
          {label(
            'Почему ты хочешь учиться за рубежом? Можно честно, даже если ещё не знаешь.',
            'Why do you want to study abroad? Be honest — not sure is fine.',
          )}
        </label>
        <textarea
          className={`input ${styles.textarea}`}
          value={data.whyAbroad ?? ''}
          onChange={(e) => onChange({ whyAbroad: e.target.value })}
          placeholder={label('Я хочу...', 'I want...')}
          rows={4}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          {label(
            'Планируешь вернуться домой после учёбы?',
            'Do you plan to return home after studying?',
          )}
        </label>
        <div className={styles.options}>
          {[
            { value: true, labelRu: 'Да, скорее всего', labelEn: 'Yes, probably' },
            { value: false, labelRu: 'Нет, хочу остаться', labelEn: 'No, want to stay' },
            { value: null, labelRu: 'Ещё не знаю', labelEn: "I don't know yet" },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              className={`${styles.optionBtn} ${data.planToReturn === opt.value ? styles.optionBtnActive : ''}`}
              onClick={() => onChange({ planToReturn: opt.value })}
            >
              {lang === 'ru' ? opt.labelRu : opt.labelEn}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function StepInterests({ data, onChange, lang }: StepProps) {
  const label = (ru: string, en: string) => (lang === 'ru' ? ru : en)
  const subjectOptions = [
    { ru: 'Математика', en: 'Math' },
    { ru: 'Физика', en: 'Physics' },
    { ru: 'Химия', en: 'Chemistry' },
    { ru: 'Биология', en: 'Biology' },
    { ru: 'IT / Программирование', en: 'IT / Programming' },
    { ru: 'Экономика', en: 'Economics' },
    { ru: 'История', en: 'History' },
    { ru: 'Языки', en: 'Languages' },
    { ru: 'Искусство / Дизайн', en: 'Art / Design' },
    { ru: 'Медицина', en: 'Medicine' },
    { ru: 'Право', en: 'Law' },
    { ru: 'Психология', en: 'Psychology' },
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
        <label className={styles.label}>
          {label(
            'Какие предметы заставляют тебя терять счёт времени?',
            'What subjects make you lose track of time?',
          )}
        </label>
        <div className={styles.chips}>
          {subjectOptions.map((s) => {
            const val = lang === 'ru' ? s.ru : s.en
            return (
              <button
                key={val}
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
        <label className={styles.label}>
          {label(
            'Куда ты думаешь направить свою карьеру? (Можно написать «не знаю»)',
            'Where do you see your career going? ("Don\'t know" is fine)',
          )}
        </label>
        <input
          className="input"
          value={data.careerDirection ?? ''}
          onChange={(e) => onChange({ careerDirection: e.target.value })}
          placeholder={label(
            'Например: инженер, врач, предприниматель...',
            'e.g. engineer, doctor, entrepreneur...',
          )}
        />
      </div>
    </div>
  )
}

function StepLanguages({ data, onChange, lang }: StepProps) {
  const label = (ru: string, en: string) => (lang === 'ru' ? ru : en)
  const languages = data.languages ?? [{ language: '', level: '' }]
  const levels =
    lang === 'ru'
      ? ['Начальный', 'Средний', 'Выше среднего', 'Продвинутый', 'Носитель']
      : ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native']

  const updateLang = (idx: number, field: 'language' | 'level', value: string) => {
    const updated = languages.map((l, i) => (i === idx ? { ...l, [field]: value } : l))
    onChange({ languages: updated })
  }

  const addLang = () => onChange({ languages: [...languages, { language: '', level: '' }] })

  return (
    <div className={styles.fields}>
      <p className={styles.hint}>
        {label('Укажи все языки, которыми владеешь.', 'List all the languages you speak.')}
      </p>
      {languages.map((l, idx) => (
        <div key={idx} className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>{label('Язык', 'Language')}</label>
            <input
              className="input"
              value={l.language}
              onChange={(e) => updateLang(idx, 'language', e.target.value)}
              placeholder={label('Английский', 'English')}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{label('Уровень', 'Level')}</label>
            <select
              className="input"
              value={l.level}
              onChange={(e) => updateLang(idx, 'level', e.target.value)}
            >
              <option value="">{label('Выбери уровень', 'Select level')}</option>
              {levels.map((lv) => (
                <option key={lv} value={lv}>
                  {lv}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
      <button type="button" className={`btn btn-ghost ${styles.addBtn}`} onClick={addLang}>
        + {label('Добавить язык', 'Add language')}
      </button>
    </div>
  )
}

function StepBudget({ data, onChange, lang }: StepProps) {
  const label = (ru: string, en: string) => (lang === 'ru' ? ru : en)
  return (
    <div className={styles.fields}>
      <p className={styles.hint}>
        {label(
          'Примерный годовой бюджет на обучение (в USD)',
          'Approximate annual tuition budget (in USD)',
        )}
      </p>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>{label('От', 'From')}</label>
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
          <label className={styles.label}>{label('До', 'To')}</label>
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
        <label className={styles.label}>
          {label('Открыт(а) к стипендиям?', 'Open to scholarships?')}
        </label>
        <div className={styles.options}>
          {[
            { value: true, ru: 'Да, обязательно', en: 'Yes, definitely' },
            { value: false, ru: 'Нет, не нужно', en: 'No, not needed' },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              className={`${styles.optionBtn} ${data.openToScholarship === opt.value ? styles.optionBtnActive : ''}`}
              onClick={() => onChange({ openToScholarship: opt.value })}
            >
              {lang === 'ru' ? opt.ru : opt.en}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function StepPreferences({ data, onChange, lang }: StepProps) {
  const label = (ru: string, en: string) => (lang === 'ru' ? ru : en)
  const countryOptions = [
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
  const preferred = data.preferredCountries ?? []
  const toggle = (c: string) => {
    onChange({
      preferredCountries: preferred.includes(c)
        ? preferred.filter((x) => x !== c)
        : [...preferred, c],
    })
  }
  const vibeOptions =
    lang === 'ru'
      ? ['Большой город', 'Небольшой город', 'Студгородок / кампус', 'Без разницы']
      : ['Big city', 'Small city', 'College town / campus', "Doesn't matter"]

  return (
    <div className={styles.fields}>
      <div className={styles.field}>
        <label className={styles.label}>
          {label('Какие страны тебе интересны?', 'Which countries interest you?')}
        </label>
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
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          {label('Какой тип города тебе нравится?', 'What kind of city do you prefer?')}
        </label>
        <div className={styles.options}>
          {vibeOptions.map((v) => (
            <button
              key={v}
              type="button"
              className={`${styles.optionBtn} ${data.cityVibe === v ? styles.optionBtnActive : ''}`}
              onClick={() => onChange({ cityVibe: v })}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function StepExtracurriculars({ data, onChange, lang }: StepProps) {
  const label = (ru: string, en: string) => (lang === 'ru' ? ru : en)
  const activityOptions = [
    { ru: 'Спорт', en: 'Sports' },
    { ru: 'Музыка', en: 'Music' },
    { ru: 'Волонтёрство', en: 'Volunteering' },
    { ru: 'Олимпиады', en: 'Olympiads' },
    { ru: 'Дебатный клуб', en: 'Debate club' },
    { ru: 'Студсовет', en: 'Student council' },
    { ru: 'Стартапы / бизнес', en: 'Startups / business' },
    { ru: 'Искусство', en: 'Art' },
    { ru: 'Наука / исследования', en: 'Science / research' },
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
        <label className={styles.label}>
          {label('Чем ты занимаешься вне учёбы?', 'What do you do outside of school?')}
        </label>
        <div className={styles.chips}>
          {activityOptions.map((a) => {
            const val = lang === 'ru' ? a.ru : a.en
            return (
              <button
                key={val}
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
        <label className={styles.label}>
          {label(
            'Что ты считаешь своей главной силой?',
            'What do you consider your biggest strength?',
          )}
        </label>
        <textarea
          className={`input ${styles.textarea}`}
          value={data.strengths ?? ''}
          onChange={(e) => onChange({ strengths: e.target.value })}
          placeholder={label('Я умею...', 'I am good at...')}
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
  const { profile, setProfile } = useProfile()
  const { lang } = useLang()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [localData, setLocalData] = useState<PartialProfile>(profile ?? {})

  const StepComponent = stepComponents[step]
  const total = STEPS.length
  const isLast = step === total - 1

  const handleChange = (updates: PartialProfile) => {
    setLocalData((prev) => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    setProfile(localData)
    if (isLast) {
      navigate('/shortlist')
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  const progressPct = ((step + 1) / total) * 100
  const currentStep = STEPS[step]
  const title = lang === 'ru' ? currentStep.titleRu : currentStep.titleEn
  const nextLabel = lang === 'ru' ? (isLast ? 'Готово' : 'Далее') : isLast ? 'Done' : 'Next'
  const backLabel = lang === 'ru' ? 'Назад' : 'Back'
  const stepLabel = lang === 'ru' ? `Шаг ${step + 1} из ${total}` : `Step ${step + 1} of ${total}`

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <span className={styles.logo}>Unipath</span>
        <LanguageToggle />
      </div>
      <div className={styles.container}>
        <div className={styles.progress}>
          <span className={styles.stepLabel}>{stepLabel}</span>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div className={styles.card}>
          <h2 className={styles.stepTitle}>{title}</h2>
          <StepComponent data={localData} onChange={handleChange} lang={lang} />
          <div className={styles.actions}>
            {step > 0 && (
              <button type="button" className="btn btn-ghost" onClick={handleBack}>
                {backLabel}
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              style={{ marginLeft: 'auto' }}
            >
              {nextLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
