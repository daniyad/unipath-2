type ProfileData = Record<string, unknown>

// Fields that meaningfully change who Claude recommends
const STALE_FIELDS = [
  'tuitionMax',
  'tuitionMin',
  'preferredCountries',
  'careerDirection',
  'languages',
  'activities',
  // V2: add 'openToScholarship', 'subjects' when scholarship agent ships
]

export const diffProfile = (existing: ProfileData, incoming: ProfileData): string[] =>
  STALE_FIELDS.filter((f) => JSON.stringify(existing[f]) !== JSON.stringify(incoming[f]))
