const { splitBibleReference } = require('./src/utils/splitBibleReference');
const { getVerseCount } = require('./src/data/BibleVerseData');

const testCases = [
    'John 3:a-4:1',
    'John 3:32-4:a',
    'John 3:30-4:3',
    'john3:a-4:1',
];

testCases.forEach(ref => {
    console.log(`Testing reference: ${ref}`);
    try {
        const result = splitBibleReference(ref);
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(`Error parsing ${ref}:`, e);
    }
    console.log('---');
});
