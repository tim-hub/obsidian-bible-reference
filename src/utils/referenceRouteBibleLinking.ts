export function getRouteBibleUrl(
  referenceLabel: string,
  versionKey: string,
  options: {
    baseUrl?: string
    sourceTag?: string
  } = {}
): string {
  const baseUrl = options.baseUrl || 'https://route.bible/'
  const sourceTag = options.sourceTag || 'obsidian_bible_reference'
  const url = new URL('/', baseUrl)

  url.searchParams.set('q', referenceLabel)

  const normalizedVersion = versionKey.trim().toUpperCase()
  if (normalizedVersion) {
    url.searchParams.set('v', normalizedVersion)
  }

  url.searchParams.set('src', sourceTag)
  url.searchParams.set('utm_source', sourceTag)
  url.searchParams.set('utm_medium', 'obsidian_plugin')

  return url.toString()
}
