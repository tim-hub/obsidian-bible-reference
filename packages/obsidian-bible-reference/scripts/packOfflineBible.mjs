import fs from 'fs'
import path from 'path'
import { gzipSync } from 'zlib'
import { fileURLToPath } from 'url'

export const OFFLINE_BIBLE_MODULE = 'offline-bible-packed'

const bibleJsonPath = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'../src/data/offlineBible.web.json'
)

export const packedOfflineBibleModule = () => {
	const bible = JSON.parse(fs.readFileSync(bibleJsonPath, 'utf8'))
	const text = bible
		.map((book) => book.map((chapter) => chapter.join('\n')).join('\x1e'))
		.join('\x1d')
	const base64 = gzipSync(text, { level: 9 }).toString('base64')
	return `export default ${JSON.stringify(base64)}`
}
