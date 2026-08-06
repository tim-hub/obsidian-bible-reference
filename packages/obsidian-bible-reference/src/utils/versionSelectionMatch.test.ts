import { versionSelectionMatch } from './versionSelectionMatch'

test('test versionSelection match', () => {
  const result = versionSelectionMatch('esv')
  expect(result).toBe('esv')
})

test('test versionSelection match oeb-cw', () => {
  const result = versionSelectionMatch('oeb-cw')
  expect(result).toBe('oeb-cw')
})

test('test versionSelection match oeb-cw', () => {
  const result = versionSelectionMatch('oeb-cw')
  expect(result).toBe('oeb-cw')
})

test('test versionSelection folds the key to lowercase', () => {
  expect(versionSelectionMatch('ESV')).toBe('esv')
  expect(versionSelectionMatch('OEB-CW')).toBe('oeb-cw')
})

test('test versionSelection match not oeb--cw', () => {
  const result = versionSelectionMatch('oeb--cw')
  expect(result).toBe('')
})
