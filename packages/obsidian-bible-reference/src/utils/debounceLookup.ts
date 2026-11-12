import { debounce } from 'obsidian'

/** How long typing has to pause before a reference is looked up. */
export const LOOKUP_DEBOUNCE_MS = 300

/**
 * Wrap an async lookup so only the input the user stops on is looked up.
 *
 * Suggesters call getSuggestions on every keystroke, and a bare chapter is a
 * valid reference on its own, so typing "Ps 119" would otherwise fetch Ps 1,
 * Ps 11 and Ps 119. Each call returns a promise; a call superseded by a later
 * keystroke resolves to no suggestions without fetching anything, and only the
 * last call runs the lookup.
 */
export const debounceLookup = <A, T>(
  lookup: (arg: A) => Promise<T[]>,
  wait = LOOKUP_DEBOUNCE_MS
) => {
  let pending: ((result: T[]) => void) | null = null

  const run = debounce(
    async (arg: A, resolve: (result: T[]) => void) => {
      try {
        resolve(await lookup(arg))
      } catch (error) {
        console.debug('lookup failed:', error)
        resolve([])
      }
    },
    wait,
    true
  )

  const debounced = (arg: A): Promise<T[]> =>
    new Promise<T[]>((resolve) => {
      pending?.([])
      pending = resolve
      run(arg, (result) => {
        if (pending === resolve) {
          pending = null
        }
        resolve(result)
      })
    })

  /** Drop a scheduled lookup, e.g. when the suggester closes. */
  debounced.cancel = () => {
    run.cancel()
    pending?.([])
    pending = null
  }

  return debounced
}
