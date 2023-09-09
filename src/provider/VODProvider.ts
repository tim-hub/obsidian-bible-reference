export type VerseOfDayResponse = {
  verse: {
    details: {
      text: string
      reference: string
      version: string
      version_url: string
    }
    notice: string
  }
}

/**
 * get the verse of the day
 * https://ourmanna.readme.io/reference/get-verse-of-the-day
 */
export const getVod = async (): Promise<VerseOfDayResponse> => {
  const resp = await fetch(
    'https://beta.ourmanna.com/api/v1/get?format=json&order=daily'
  )
  return resp.json()
}
