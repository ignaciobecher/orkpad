import type { CitySuggestion } from './geo.types'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

const CITY_TYPES = new Set([
  'city',
  'town',
  'village',
  'hamlet',
  'municipality',
  'administrative',
  'county',
  'state',
  'suburb',
  'neighbourhood',
])

export const geoApi = {
  async searchCities(query: string, signal?: AbortSignal): Promise<CitySuggestion[]> {
    if (!query || query.trim().length < 3) return []
    const url = `${NOMINATIM_URL}?format=jsonv2&q=${encodeURIComponent(query)}&addressdetails=1&limit=8`
    try {
      const res = await fetch(url, {
        signal,
        headers: { 'Accept-Language': 'es,en' },
      })
      if (!res.ok) return []
      const data: any[] = await res.json()
      return data
        .filter((d) => CITY_TYPES.has(d.type) || CITY_TYPES.has(d.addresstype))
        .map((d) => {
          const a = d.address ?? {}
          const shortName =
            a.city || a.town || a.village || a.municipality || a.county || d.name || d.display_name?.split(',')[0] || ''
          return {
            displayName: d.display_name,
            shortName,
            state: a.state,
            country: a.country,
            lat: parseFloat(d.lat),
            lon: parseFloat(d.lon),
            type: d.type,
          }
        })
        .filter((s) => s.shortName)
    } catch {
      return []
    }
  },
}
