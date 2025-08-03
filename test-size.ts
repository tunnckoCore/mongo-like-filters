import { matches } from './src/index.ts';

// Test data
const testData = [
  { name: 'John', tags: ['admin', 'user'], bio: 'Hello world', profile: { age: 30, city: 'NYC' } },
  { name: 'Jane', tags: ['user'], bio: 'Hi', profile: { age: 25, city: 'LA', country: 'USA' } },
  { name: 'Bob', tags: [], bio: 'Short bio', profile: { age: 35 } },
  { name: 'Alice', tags: ['admin', 'moderator', 'user'], bio: '', profile: {} },
];

console.log('Testing _size operator with arrays:');

// Test 1: _size as number (alias for _eq)
console.log('Tags with exactly 2 elements:');
const exactlyTwo = testData.filter(matches({ tags: { _size: 2 } }));
console.log(exactlyTwo.map((d) => ({ name: d.name, tags: d.tags })));

// Test 2: _size with _gt operator
console.log('\nTags with more than 1 element:');
const moreThanOne = testData.filter(matches({ tags: { _size: { _gt: 1 } } }));
console.log(moreThanOne.map((d) => ({ name: d.name, tags: d.tags })));

// Test 3: _size with _lt operator
console.log('\nTags with less than 2 elements:');
const lessThanTwo = testData.filter(matches({ tags: { _size: { _lt: 2 } } }));
console.log(lessThanTwo.map((d) => ({ name: d.name, tags: d.tags })));

// Test 4: _size with _gte operator
console.log('\nTags with 2 or more elements:');
const twoOrMore = testData.filter(matches({ tags: { _size: { _gte: 2 } } }));
console.log(twoOrMore.map((d) => ({ name: d.name, tags: d.tags })));

// Test 5: _size with _lte operator
console.log('\nTags with 1 or fewer elements:');
const oneOrFewer = testData.filter(matches({ tags: { _size: { _lte: 1 } } }));
console.log(oneOrFewer.map((d) => ({ name: d.name, tags: d.tags })));

console.log('\nTesting _size operator with strings:');

// Test 6: String length with exact match
console.log('Names with exactly 4 characters:');
const fourCharNames = testData;
