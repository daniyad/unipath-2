import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LangContext'
import s from './LandingPage.module.css'

// ─── Mockup data ──────────────────────────────────────────────────────────────

const SHORTLIST_DATA = [
  {
    name: 'Nazarbayev University',
    program: 'Computer Science · Astana',
    level: 'match' as const,
    featured: true,
    why: 'Strong CS, full scholarships, 78% admit rate for your profile.',
  },
  {
    name: 'NYU Abu Dhabi',
    program: 'Engineering · UAE',
    level: 'reach' as const,
    why: 'Need-blind, full-ride aid. Your math + EC mix fits.',
  },
  {
    name: 'KIMEP University',
    program: 'Business · Almaty',
    level: 'safety' as const,
    why: 'Solid backup. You exceed the avg admit profile by 18%.',
  },
]

const PLAN_ROWS = [
  {
    month: 'Apr 2026',
    task: 'Request transcripts (school + IELTS)',
    urgency: 'Urgent',
    done: true,
  },
  { month: 'May 2026', task: 'Common App essay — first draft', urgency: 'Important', done: true },
  { month: 'Jun 2026', task: 'IELTS retake (target: 7.5)', urgency: 'Important', done: false },
  { month: 'Aug 2026', task: 'Letters of recommendation × 2', urgency: 'Urgent', done: false },
  { month: 'Oct 2026', task: 'Submit early action — NYU AD', urgency: 'Urgent', done: false },
  { month: 'Jan 2027', task: 'Regular decision deadlines', urgency: 'Later', done: false },
]

const UNI_NAMES = [
  'Nazarbayev University',
  'NYU Abu Dhabi',
  'KAIST',
  'KIMEP',
  'Seoul National University',
  'TU Munich',
  'Minerva',
  'University of Toronto',
  'University of Edinburgh',
  'McGill University',
  'Khalifa University',
  'University of Manchester',
  'Westminster',
  'POSTECH',
  'Queen Mary London',
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function LevelChip({ level }: { level: 'reach' | 'match' | 'safety' }) {
  if (level === 'reach') return <span className="chip chip-amber">Reach</span>
  if (level === 'safety') return <span className="chip chip-success">Safety</span>
  return <span className="chip">Match</span>
}

function MockShortlist({ greeting, sub }: { greeting: string; sub: string }) {
  return (
    <div className={s.heroVisual} aria-hidden="true">
      <div className={s.mockTag}>Your shortlist</div>
      <div className={s.mockGreeting}>{greeting}</div>
      <div className={s.mockSub}>{sub}</div>
      <div className={s.mockUniList}>
        {SHORTLIST_DATA.map((u, i) => (
          <div key={i} className={s.mockUni}>
            <div className={s.mockUniBody}>
              <div className={s.mockUniChips}>
                <LevelChip level={u.level} />
                {u.featured && <span className="chip chip-success">Plan ready</span>}
              </div>
              <div className={s.mockUniName}>{u.name}</div>
              <div className={s.mockUniProg}>{u.program}</div>
              <div className={s.mockUniWhy}>{u.why}</div>
            </div>
            <span className={s.mockUniArrow}>→</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MockPlan({ title, meta }: { title: string; meta: string }) {
  const urgClass = (u: string) => {
    if (u === 'Urgent') return s.chipRed
    if (u === 'Important') return 'chip chip-amber'
    return 'chip chip-success'
  }
  return (
    <div className={s.planMock} aria-hidden="true">
      <div className={s.planMockHead}>
        <div className={s.planMockTitle}>{title}</div>
        <div className={s.planMockMeta}>{meta}</div>
      </div>
      <table className={s.planTable}>
        <thead>
          <tr>
            <th style={{ width: 120 }}>Month</th>
            <th>Task</th>
            <th style={{ width: 110 }}>Urgency</th>
          </tr>
        </thead>
        <tbody>
          {PLAN_ROWS.map((r, i) => (
            <tr key={i} className={r.done ? s.rowDone : ''}>
              <td className={s.monthCell}>{r.month}</td>
              <td className={s.taskCell}>{r.task}</td>
              <td>
                <span className={urgClass(r.urgency)}>{r.urgency}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function LandingNav() {
  const { t } = useTranslation()
  const { lang, setLang } = useLang()

  return (
    <nav className={s.nav}>
      <div className={s.navLeft}>
        <a className={s.navLogo} href="#top">
          Unipath
        </a>
        <div className={s.navLinks}>
          <a href="#how">{t('landing.nav.howItWorks')}</a>
          <a href="#shortlist">{t('landing.nav.shortlist')}</a>
          <a href="#plan">{t('landing.nav.plan')}</a>
          <a href="#telegram">{t('landing.nav.telegram')}</a>
          <a href="#faq">{t('landing.nav.faq')}</a>
        </div>
      </div>
      <div className={s.navRight}>
        <div className={s.langToggle}>
          <button
            className={`${s.langOpt} ${lang === 'ru' ? s.langOptActive : ''}`}
            onClick={() => setLang('ru')}
          >
            RU
          </button>
          <button
            className={`${s.langOpt} ${lang === 'en' ? s.langOptActive : ''}`}
            onClick={() => setLang('en')}
          >
            EN
          </button>
        </div>
        <Link className="btn btn-ghost" style={{ padding: '9px 14px', fontSize: 14 }} to="/login">
          {t('landing.nav.signIn')}
        </Link>
        <Link
          className="btn btn-primary"
          style={{ padding: '8px 14px', fontSize: 13 }}
          to="/signup"
        >
          {t('landing.nav.getStarted')}
        </Link>
      </div>
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const { t } = useTranslation()
  return (
    <section className={s.hero} id="top">
      <div className={s.heroGrid}>
        <div>
          <div className={s.heroEyebrow}>
            <span className={s.eyebrow}>
              <span className={s.dot} />
              {t('landing.hero.eyebrow')}
            </span>
          </div>
          <h1 className={s.heroTitle}>
            {t('landing.hero.titleA')}
            <br />
            <span className={s.marker}>{t('landing.hero.titleB')}</span>
            {t('landing.hero.titleC')}
          </h1>
          <p className={s.heroSub}>{t('landing.hero.sub')}</p>
          <form className={s.heroForm} onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              className={s.heroFormInput}
              placeholder={t('landing.hero.emailPlaceholder')}
            />
            <Link className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} to="/signup">
              {t('landing.hero.cta')} →
            </Link>
          </form>
          <div className={s.heroMeta}>
            <span className={s.heroMetaItem}>
              <span className={s.check}>✓</span>
              {t('landing.hero.metaFree')}
            </span>
            <span className={s.heroMetaItem}>
              <span className={s.check}>✓</span>
              {t('landing.hero.metaAge')}
            </span>
            <span className={s.heroMetaItem}>
              <span className={s.check}>✓</span>
              {t('landing.hero.metaPlatform')}
            </span>
          </div>
        </div>
        <MockShortlist
          greeting={t('landing.shortlist.mockGreeting')}
          sub={t('landing.shortlist.mockSub')}
        />
      </div>
    </section>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function StatsStrip() {
  const { t } = useTranslation()
  return (
    <div className={s.statsStrip}>
      <div className={s.statCell}>
        <div className={s.statNum}>600+</div>
        <div className={s.statLbl}>{t('landing.stats.unisLabel')}</div>
      </div>
      <div className={s.statCell}>
        <div className={s.statNum}>4 min</div>
        <div className={s.statLbl}>{t('landing.stats.timeLabel')}</div>
      </div>
      <div className={s.statCell}>
        <div className={s.statNum}>$0</div>
        <div className={s.statLbl}>{t('landing.stats.costLabel')}</div>
      </div>
      <div className={s.statCell}>
        <div className={s.statNum}>24/7</div>
        <div className={s.statLbl}>{t('landing.stats.supportLabel')}</div>
      </div>
    </div>
  )
}

// ─── How it works ─────────────────────────────────────────────────────────────

function HowSection() {
  const { t } = useTranslation()
  return (
    <section className={s.section} id="how">
      <div className={s.container}>
        <div className={s.secHead}>
          <span className={s.eyebrow}>
            <span className={s.dot} />
            {t('landing.how.eyebrow')}
          </span>
          <h2>{t('landing.how.heading')}</h2>
          <p>{t('landing.how.sub')}</p>
        </div>
        <div className={s.steps}>
          <div className={s.step}>
            <div className={s.stepNum}>
              <span className={s.stepNumN}>01</span>
              {t('landing.how.step1Label')}
            </div>
            <div className={s.stepTitle}>{t('landing.how.step1Title')}</div>
            <div className={s.stepDesc}>{t('landing.how.step1Desc')}</div>
            <div className={s.stepMini}>
              <div className={s.stepMiniQ}>{t('landing.how.step1MiniQ')}</div>
              <div className={s.stepMiniOpts}>
                <span className={`${s.miniOpt} ${s.miniOptActive}`}>UAE</span>
                <span className={`${s.miniOpt} ${s.miniOptActive}`}>South Korea</span>
                <span className={`${s.miniOpt} ${s.miniOptActive}`}>Germany</span>
                <span className={s.miniOpt}>UK</span>
                <span className={s.miniOpt}>USA</span>
                <span className={s.miniOpt}>+ 1 more</span>
              </div>
            </div>
          </div>
          <div className={s.step}>
            <div className={s.stepNum}>
              <span className={s.stepNumN}>02</span>
              {t('landing.how.step2Label')}
            </div>
            <div className={s.stepTitle}>{t('landing.how.step2Title')}</div>
            <div className={s.stepDesc}>{t('landing.how.step2Desc')}</div>
            <div className={s.stepMini}>
              <div className={s.miniUniRow}>
                <span className={s.miniUniName}>NYU Abu Dhabi</span>
                <span className="chip chip-amber">Reach</span>
              </div>
              <div className={s.miniUniRow}>
                <span className={s.miniUniName}>Nazarbayev University</span>
                <span className="chip">Match</span>
              </div>
              <div className={s.miniUniRow}>
                <span className={s.miniUniName}>KIMEP University</span>
                <span className="chip chip-success">Safety</span>
              </div>
            </div>
          </div>
          <div className={s.step}>
            <div className={s.stepNum}>
              <span className={s.stepNumN}>03</span>
              {t('landing.how.step3Label')}
            </div>
            <div className={s.stepTitle}>{t('landing.how.step3Title')}</div>
            <div className={s.stepDesc}>{t('landing.how.step3Desc')}</div>
            <div className={s.stepMini}>
              <div className={`${s.miniTask} ${s.miniTaskDone}`}>
                <span className={`${s.miniCheck} ${s.miniCheckDone}`} />
                Request school transcripts
              </div>
              <div className={`${s.miniTask} ${s.miniTaskDone}`}>
                <span className={`${s.miniCheck} ${s.miniCheckDone}`} />
                First essay draft
              </div>
              <div className={s.miniTask}>
                <span className={s.miniCheck} />
                IELTS retake — target 7.5
              </div>
              <div className={s.miniTask}>
                <span className={s.miniCheck} />
                Recommendation letters × 2
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Shortlist ────────────────────────────────────────────────────────────────

function ShortlistSection() {
  const { t } = useTranslation()
  return (
    <section className={s.sectionAlt} id="shortlist">
      <div className={s.container}>
        <div className={s.planGrid}>
          <div>
            <span className={s.eyebrow}>
              <span className={s.dot} />
              {t('landing.shortlist.eyebrow')}
            </span>
            <h2 className={s.planH2}>{t('landing.shortlist.heading')}</h2>
            <p className={s.lead} style={{ marginBottom: 8 }}>
              {t('landing.shortlist.sub')}
            </p>
            <ul className={s.planList}>
              <li>
                <span className={s.planListBadgeChar}>R</span>
                <span className={s.planListText}>
                  <strong>{t('landing.shortlist.reachLabel')}</strong> —{' '}
                  {t('landing.shortlist.reachDesc')}
                </span>
              </li>
              <li>
                <span className={s.planListBadgeChar}>M</span>
                <span className={s.planListText}>
                  <strong>{t('landing.shortlist.matchLabel')}</strong> —{' '}
                  {t('landing.shortlist.matchDesc')}
                </span>
              </li>
              <li>
                <span className={s.planListBadgeChar}>S</span>
                <span className={s.planListText}>
                  <strong>{t('landing.shortlist.safetyLabel')}</strong> —{' '}
                  {t('landing.shortlist.safetyDesc')}
                </span>
              </li>
            </ul>
          </div>
          <MockShortlist
            greeting={t('landing.shortlist.mockGreeting')}
            sub={t('landing.shortlist.mockSub')}
          />
        </div>
      </div>
    </section>
  )
}

// ─── Plan ─────────────────────────────────────────────────────────────────────

function PlanSection() {
  const { t } = useTranslation()
  return (
    <section className={s.section} id="plan">
      <div className={s.container}>
        <div className={s.planGrid}>
          <div>
            <span className={s.eyebrow}>
              <span className={s.dot} />
              {t('landing.plan.eyebrow')}
            </span>
            <h2 className={s.planH2}>{t('landing.plan.heading')}</h2>
            <p className={s.lead}>{t('landing.plan.sub')}</p>
            <ol className={s.planList}>
              <li>
                <span className={s.planListBadge}>1</span>
                <span className={s.planListText}>
                  <strong>{t('landing.plan.docs')}</strong> — {t('landing.plan.docsDesc')}
                </span>
              </li>
              <li>
                <span className={s.planListBadge}>2</span>
                <span className={s.planListText}>
                  <strong>{t('landing.plan.essays')}</strong> — {t('landing.plan.essaysDesc')}
                </span>
              </li>
              <li>
                <span className={s.planListBadge}>3</span>
                <span className={s.planListText}>
                  <strong>{t('landing.plan.money')}</strong> — {t('landing.plan.moneyDesc')}
                </span>
              </li>
              <li>
                <span className={s.planListBadge}>4</span>
                <span className={s.planListText}>
                  <strong>{t('landing.plan.submission')}</strong> —{' '}
                  {t('landing.plan.submissionDesc')}
                </span>
              </li>
            </ol>
          </div>
          <MockPlan title={t('landing.plan.mockTitle')} meta={t('landing.plan.mockMeta')} />
        </div>
      </div>
    </section>
  )
}

// ─── Telegram ─────────────────────────────────────────────────────────────────

function TelegramSection() {
  const { t } = useTranslation()
  return (
    <section className={s.section} id="telegram">
      <div className={s.container}>
        <div className={s.tgCard}>
          <div className={s.tgText}>
            <span className={`${s.eyebrow} ${s.tgEyebrow}`}>
              <span className={s.dot} />
              {t('landing.telegram.eyebrow')}
            </span>
            <h2>{t('landing.telegram.heading')}</h2>
            <p>{t('landing.telegram.sub')}</p>
            <ul className={s.tgFeats}>
              <li>
                <span className={s.tgFeatsIc}>→</span>
                <span>{t('landing.telegram.feat1')}</span>
              </li>
              <li>
                <span className={s.tgFeatsIc}>→</span>
                <span>{t('landing.telegram.feat2')}</span>
              </li>
              <li>
                <span className={s.tgFeatsIc}>→</span>
                <span>{t('landing.telegram.feat3')}</span>
              </li>
            </ul>
            <a
              className="btn btn-primary"
              href="https://t.me/unipath_bot"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('landing.telegram.cta')} →
            </a>
          </div>
          <div className={s.tgChat}>
            <div className={`${s.tgMsg} ${s.tgMsgUser}`}>{t('landing.telegram.chatUser1')}</div>
            <div className={`${s.tgMsg} ${s.tgMsgBot}`}>
              <div className={s.tgSender}>Unipath</div>
              <strong>{t('landing.telegram.chatBot1')}</strong>
              <div className={s.tgBotList}>
                <div className={s.tgBotListItem}>{t('landing.telegram.chatBot1b')}</div>
                <div className={s.tgBotListItem}>{t('landing.telegram.chatBot1c')}</div>
              </div>
            </div>
            <div className={`${s.tgMsg} ${s.tgMsgUser}`}>{t('landing.telegram.chatUser2')}</div>
            <div className={`${s.tgMsg} ${s.tgMsgBot}`}>
              <div className={s.tgSender}>Unipath</div>
              {t('landing.telegram.chatBot2')}
            </div>
            <div className={`${s.tgMsg} ${s.tgMsgUser}`}>{t('landing.telegram.chatUser3')}</div>
            <div className={`${s.tgMsg} ${s.tgMsgBot}`}>
              <div className={s.tgSender}>Unipath</div>
              {t('landing.telegram.chatBot3')}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── University tape ──────────────────────────────────────────────────────────

function UniTape() {
  const { t } = useTranslation()
  const items = [...UNI_NAMES, ...UNI_NAMES]
  return (
    <div className={s.tape}>
      <div className={s.tapeLabel}>
        <span className={s.eyebrow}>
          <span className={s.dot} />
          {t('landing.tape.eyebrow')}
        </span>
      </div>
      <div className={s.tapeTrack}>
        {items.map((u, i) => (
          <span key={i} className={s.tapeItem}>
            {u}
            <span className={s.tapeDot} />
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Parents ──────────────────────────────────────────────────────────────────

function ParentsSection() {
  const { t } = useTranslation()
  return (
    <section className={s.sectionAlt}>
      <div className={s.container}>
        <div className={s.parentsGrid}>
          <div>
            <span className={s.eyebrow}>
              <span className={s.dot} />
              {t('landing.parents.eyebrow')}
            </span>
            <h2 className={s.parentsH2}>{t('landing.parents.heading')}</h2>
            <p className={s.lead} style={{ marginBottom: 32 }}>
              {t('landing.parents.sub')}
            </p>
            <div className={s.parentsBtns}>
              <Link className="btn btn-primary" to="/signup">
                {t('landing.parents.ctaPrimary')}
              </Link>
              <a className="btn btn-secondary" href="#how">
                {t('landing.parents.ctaSecondary')}
              </a>
            </div>
          </div>
          <div className={s.parentsCard}>
            <div className={s.parentsQItem}>
              <div className={s.parentsQ}>{t('landing.parents.q1')}</div>
              <div className={s.parentsA}>{t('landing.parents.a1')}</div>
            </div>
            <div className={s.parentsQItem} style={{ marginTop: 24 }}>
              <div className={s.parentsQ}>{t('landing.parents.q2')}</div>
              <div className={s.parentsA}>{t('landing.parents.a2')}</div>
            </div>
            <div className={s.parentsQItem} style={{ marginTop: 24 }}>
              <div className={s.parentsQ}>{t('landing.parents.q3')}</div>
              <div className={s.parentsA}>{t('landing.parents.a3')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FAQ() {
  const { t } = useTranslation()
  const [open, setOpen] = useState<number>(0)

  const items = [
    { q: t('landing.faq.q1'), a: t('landing.faq.a1') },
    { q: t('landing.faq.q2'), a: t('landing.faq.a2') },
    { q: t('landing.faq.q3'), a: t('landing.faq.a3') },
    { q: t('landing.faq.q4'), a: t('landing.faq.a4') },
    { q: t('landing.faq.q5'), a: t('landing.faq.a5') },
    { q: t('landing.faq.q6'), a: t('landing.faq.a6') },
  ]

  return (
    <section className={s.section} id="faq">
      <div className={s.container}>
        <div className={s.secHeadCenter}>
          <span className={s.eyebrow}>
            <span className={s.dot} />
            {t('landing.faq.eyebrow')}
          </span>
          <h2>{t('landing.faq.heading')}</h2>
        </div>
        <div className={s.faqList}>
          {items.map((it, i) => (
            <div key={i} className={`${s.faqItem} ${open === i ? s.faqItemOpen : ''}`}>
              <button
                className={s.faqQ}
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
              >
                <span>{it.q}</span>
                <span className={s.faqIc}>+</span>
              </button>
              <div className={s.faqA}>{it.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Closing CTA ──────────────────────────────────────────────────────────────

function ClosingCTA() {
  const { t } = useTranslation()
  return (
    <section className={s.closing} id="signup">
      <div className={s.closingInner}>
        <h2 className={s.closingH2}>
          {t('landing.closing.heading1')}
          <br />
          <span className={s.marker}>{t('landing.closing.heading2')}</span>
        </h2>
        <p className={s.closingP}>{t('landing.closing.sub')}</p>
        <form className={s.closingForm} onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            className={s.closingInput}
            placeholder={t('landing.hero.emailPlaceholder')}
          />
          <Link className="btn btn-yellow" style={{ whiteSpace: 'nowrap' }} to="/signup">
            {t('landing.hero.cta')} →
          </Link>
        </form>
        <div className={s.closingMeta}>
          <span className={s.closingMetaItem}>
            <span className={s.closingCheck}>✓</span>
            {t('landing.closing.metaFree')}
          </span>
          <span className={s.closingMetaItem}>
            <span className={s.closingCheck}>✓</span>
            {t('landing.closing.metaNoCard')}
          </span>
          <span className={s.closingMetaItem}>
            <span className={s.closingCheck}>✓</span>
            {t('landing.closing.metaPlatform')}
          </span>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const { t } = useTranslation()
  return (
    <footer className={s.foot}>
      <div className={s.footInner}>
        <div>
          <div className={s.footBrand}>Unipath</div>
          <div className={s.footTag}>{t('landing.footer.tagline')}</div>
        </div>
        <div className={s.footCol}>
          <h5>{t('landing.footer.productCol')}</h5>
          <a href="#how">{t('landing.nav.howItWorks')}</a>
          <a href="#shortlist">{t('landing.nav.shortlist')}</a>
          <a href="#plan">{t('landing.nav.plan')}</a>
          <a href="#telegram">{t('landing.nav.telegram')}</a>
        </div>
        <div className={s.footCol}>
          <h5>{t('landing.footer.contactCol')}</h5>
          <a href="https://t.me/unipath_bot" target="_blank" rel="noopener noreferrer">
            Telegram
          </a>
          <a href="mailto:hello@unipath.app">hello@unipath.app</a>
        </div>
        <div className={s.footCol}>
          <h5>{t('landing.footer.legalCol')}</h5>
          <a href="#">{t('landing.footer.privacy')}</a>
          <a href="#">{t('landing.footer.terms')}</a>
        </div>
      </div>
      <div className={s.footBottom}>
        <span>{t('landing.footer.copyright')}</span>
        <span>v1.0</span>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LandingPage() {
  const { user, loading } = useAuth()

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <>
      <LandingNav />
      <Hero />
      <StatsStrip />
      <HowSection />
      <ShortlistSection />
      <PlanSection />
      <TelegramSection />
      <UniTape />
      <ParentsSection />
      <FAQ />
      <ClosingCTA />
      <Footer />
    </>
  )
}
