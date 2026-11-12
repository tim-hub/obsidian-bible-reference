import { debounceLookup } from './debounceLookup'

const recordingLookup = () => {
  const calls: string[] = []
  const lookup = async (query: string) => {
    calls.push(query)
    return [query]
  }
  return { calls, lookup }
}

describe('debounceLookup', () => {
  test('typing "Ps 119" looks up only the reference it stops on', async () => {
    const { calls, lookup } = recordingLookup()
    const debounced = debounceLookup(lookup, 10)

    const results = await Promise.all(
      ['Ps 1', 'Ps 11', 'Ps 119'].map((q) => debounced(q))
    )

    expect(calls).toEqual(['Ps 119'])
    expect(results).toEqual([[], [], ['Ps 119']])
  })

  test('a pause between keystrokes looks up each reference', async () => {
    const { calls, lookup } = recordingLookup()
    const debounced = debounceLookup(lookup, 10)

    expect(await debounced('Ps 1')).toEqual(['Ps 1'])
    expect(await debounced('Ps 11')).toEqual(['Ps 11'])
    expect(calls).toEqual(['Ps 1', 'Ps 11'])
  })

  test('a failing lookup yields no suggestions', async () => {
    const debounced = debounceLookup(async () => {
      throw new Error('network down')
    }, 10)

    expect(await debounced('Ps 1')).toEqual([])
  })

  test('cancel drops the scheduled lookup', async () => {
    const { calls, lookup } = recordingLookup()
    const debounced = debounceLookup(lookup, 10)

    const result = debounced('Ps 119')
    debounced.cancel()

    expect(await result).toEqual([])
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(calls).toEqual([])
  })
})
