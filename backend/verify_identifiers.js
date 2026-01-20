const { normalizeBedroomIdentifier } = require('./src/utils/identifier.utils');

console.log('--- Testing Bedroom Identifier Normalization ---\n');

const testCases = [
    { civic: '82', unit: '101', room: 1, expected: '82-101-1', desc: 'Standard Case' },
    { civic: '82', unit: '82-101', room: 1, expected: '82-101-1', desc: 'Already prefixed' },
    { civic: '82', unit: 'Unit 101', room: 2, expected: '82-101-2', desc: 'Unit prefix removal' },
    { civic: '90', unit: 'Floor 1 Unit 105', room: 3, expected: '90-105-3', desc: 'Floor text removal' },
    { civic: '100', unit: 'Penthouse', room: 1, expected: '100-Penthouse-1', desc: 'Name based unit' },
    { civic: '85', unit: '85-Floor-1-102', room: 1, expected: '85-102-1', desc: 'Messy input' },
];

let passed = 0;
let failed = 0;

testCases.forEach(tc => {
    const result = normalizeBedroomIdentifier(tc.civic, tc.unit, tc.room);
    if (result === tc.expected) {
        console.log(`✅ ${tc.desc}: Passed (${result})`);
        passed++;
    } else {
        console.error(`❌ ${tc.desc}: Failed. Expected "${tc.expected}", got "${result}"`);
        failed++;
    }
});

console.log(`\n\nResults: ${passed} Passed, ${failed} Failed`);

if (failed > 0) process.exit(1);
