/**
 * One-time script to populate client/src/data/universities.json.
 * Run with: node scripts/fetch-universities.mjs
 * Re-run periodically (e.g. annually) to pick up new institutions.
 */

import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Maps our display country name → HiPolabs country name
const COUNTRY_MAP = {
  'United States': 'United States',
  Canada: 'Canada',
  'United Kingdom': 'United Kingdom',
  Germany: 'Germany',
  'South Korea': 'Korea, Republic of',
  'United Arab Emirates': 'United Arab Emirates',
}

const COUNTRIES = Object.keys(COUNTRY_MAP)

const fetchCountry = async (displayName) => {
  const apiName = COUNTRY_MAP[displayName]
  const url = `http://universities.hipolabs.com/search?country=${encodeURIComponent(apiName)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${displayName}: ${res.status}`)
  const data = await res.json()
  // Store with our display country name, not the HiPolabs name
  return data.map((u) => ({ name: u.name.trim(), country: displayName }))
}

console.log('Fetching universities from HiPolabs...')

const batches = await Promise.all(COUNTRIES.map(fetchCountry))

const seen = new Set()
const universities = []

for (const batch of batches) {
  for (const u of batch) {
    const key = u.name.trim().toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    universities.push({ name: u.name, country: u.country })
  }
}

universities.sort((a, b) => a.name.localeCompare(b.name))

const outPath = join(__dirname, '../client/src/data/universities.json')
writeFileSync(outPath, JSON.stringify(universities, null, 2))

console.log(`Done. ${universities.length} universities written to client/src/data/universities.json`)
for (const country of COUNTRIES) {
  const count = universities.filter((u) => u.country === country).length
  console.log(`  ${country}: ${count} universities`)
}
