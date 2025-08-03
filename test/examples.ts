/* eslint-disable no-console */
import { matches, mongoPath } from '../src/index.ts';
import { company, products, users, type User, type UserWithMetadata } from './fake-data.ts';

console.log('=== MONGO-LIKE FILTERS COMPREHENSIVE EXAMPLES ===\n');

// =============================================================================
// BASIC USAGE PATTERNS
// =============================================================================

console.log('📝 BASIC USAGE PATTERNS');
console.log('─'.repeat(50));

// Pattern 1: Direct matches with single data item
console.log('\n1. Direct matches(filter, data) - returns boolean');
const isJohnDoe = matches({ name: 'John Doe' }, users[0]);
console.log('matches({ name: "John Doe" }, users[0]):', isJohnDoe);

// Pattern 2: Curried function - matches(filter) returns function
console.log('\n2. Curried matches(filter) - returns function');
const adminFilter = matches({ roles: 'admin' });
const johnIsAdmin = adminFilter(users[0]);
console.log('adminFilter(users[0]):', johnIsAdmin);

// Pattern 3: Array filtering with .filter()
console.log('\n3. Array filtering with .filter(matches(filter))');
const activeUsers = users.filter(matches({ isActive: true }));
console.log(
  'Active users:',
  activeUsers.map((u) => u.name),
);

// Pattern 4: Direct array matching - matches(filter, array) returns boolean
console.log('\n4. Direct array matching - matches(filter, array)');
const hasActiveUsers = matches({ isActive: true }, users);
console.log('Has active users:', hasActiveUsers);

// =============================================================================
// EXACT EQUALITY MATCHING
// =============================================================================

console.log('\n\n🎯 EXACT EQUALITY MATCHING');
console.log('─'.repeat(50));

// String equality
const johnUsers = users.filter(matches({ name: 'John Doe' }));
console.log('\nString equality - users named "John Doe":', johnUsers.length);

// Number equality
const thirtyYearOlds = users.filter(matches({ age: 30 }));
console.log('Number equality - users aged 30:', thirtyYearOlds.length);

// Boolean equality
const activeUserCount = users.filter(matches({ isActive: true })).length;
console.log('Boolean equality - active users:', activeUserCount);

// =============================================================================
// COMPARISON OPERATORS
// =============================================================================

console.log('\n\n📊 COMPARISON OPERATORS');
console.log('─'.repeat(50));

// Greater than
const olderThan30 = users.filter(matches({ age: { _gt: 30 } }));
console.log(
  '\n_gt: Users older than 30:',
  olderThan30.map((u) => `${u.name} (${u.age})`),
);

// Greater than or equal
const thirtyOrOlder = users.filter(matches({ age: { _gte: 30 } }));
console.log(
  '_gte: Users 30 or older:',
  thirtyOrOlder.map((u) => `${u.name} (${u.age})`),
);

// Less than
const youngerThan30 = users.filter(matches({ age: { _lt: 30 } }));
console.log(
  '_lt: Users younger than 30:',
  youngerThan30.map((u) => `${u.name} (${u.age})`),
);

// Less than or equal
const thirtyOrYounger = users.filter(matches({ age: { _lte: 30 } }));
console.log(
  '_lte: Users 30 or younger:',
  thirtyOrYounger.map((u) => `${u.name} (${u.age})`),
);

// Not equal
const notThirty = users.filter(matches({ age: { _ne: 30 } }));
console.log(
  '_ne: Users not aged 30:',
  notThirty.map((u) => `${u.name} (${u.age})`),
);

// =============================================================================
// STRING OPERATORS
// =============================================================================

console.log('\n\n🔤 STRING OPERATORS');
console.log('─'.repeat(50));

// Contains
const exampleEmails = users.filter(matches({ email: { _contains: 'example' } }));
console.log(
  '\n_contains: Emails containing "example":',
  exampleEmails.map((u) => u.email),
);

// Starts with
const jNames = users.filter(matches({ name: { _startsWith: 'J' } }));
console.log(
  '_startsWith: Names starting with "J":',
  jNames.map((u) => u.name),
);

// Ends with
const comEmails = users.filter(matches({ email: { _endsWith: '.com' } }));
console.log(
  '_endsWith: Emails ending with ".com":',
  comEmails.map((u) => u.email),
);

// Case-insensitive contains
const johnEmails = users.filter(matches({ email: { _icontains: 'JOHN' } }));
console.log(
  '_icontains: Emails containing "JOHN" (case-insensitive):',
  johnEmails.map((u) => u.email),
);

// Case-insensitive starts with
const jNamesInsensitive = users.filter(matches({ name: { _istartsWith: 'j' } }));
console.log(
  '_istartsWith: Names starting with "j" (case-insensitive):',
  jNamesInsensitive.map((u) => u.name),
);

// Case-insensitive ends with
const comEmailsInsensitive = users.filter(matches({ email: { _iendsWith: '.COM' } }));
console.log(
  '_iendsWith: Emails ending with ".COM" (case-insensitive):',
  comEmailsInsensitive.length,
);

// Regex matching
const testEmails = users.filter(matches({ email: { _regex: '^[a-z]+@test' } }));
console.log(
  '_regex: Emails matching pattern "^[a-z]+@test":',
  testEmails.map((u) => u.email),
);

// =============================================================================
// ARRAY OPERATIONS
// =============================================================================

console.log('\n\n📋 ARRAY OPERATIONS');
console.log('─'.repeat(50));

// Direct element matching (implicit contains)
const admins = users.filter(matches({ roles: 'admin' }));
console.log(
  '\nDirect matching: Users with "admin" role:',
  admins.map((u) => u.name),
);

// Array exact equality
const onlyUsers = users.filter(matches({ roles: ['user'] }));
console.log(
  'Array equality: Users with exactly ["user"] roles:',
  onlyUsers.map((u) => u.name),
);

// Multiple element exact equality
const userModerators = users.filter(matches({ roles: ['user', 'moderator'] }));
console.log(
  'Multi-element equality: Users with ["user", "moderator"]:',
  userModerators.map((u) => u.name),
);

// _eq with arrays
const adminUsers = users.filter(matches({ roles: { _eq: ['admin', 'user'] } }));
console.log(
  '_eq: Users with exactly ["admin", "user"]:',
  adminUsers.map((u) => u.name),
);

// _ne with arrays
const notJustUsers = users.filter(matches({ roles: { _ne: ['user'] } }));
console.log(
  '_ne: Users NOT having exactly ["user"]:',
  notJustUsers.map((u) => u.name),
);

// _in (array contains any of these values)
const adminOrModerator = users.filter(matches({ roles: { _in: ['admin', 'moderator'] } }));
console.log(
  '_in: Users with "admin" OR "moderator" role:',
  adminOrModerator.map((u) => u.name),
);

// _nin (array does not contain any of these values)
const regularUsers = users.filter(matches({ roles: { _nin: ['admin', 'moderator'] } }));
console.log(
  '_nin: Users without "admin" or "moderator":',
  regularUsers.map((u) => u.name),
);

// Array size
const twoRoleUsers = users.filter(matches({ roles: { _size: 2 } }));
console.log(
  '_size: Users with exactly 2 roles:',
  twoRoleUsers.map((u) => `${u.name} (${u.roles})`),
);

// Array length comparison
const manySkills = users.filter(matches({ 'profile.skills': { _gte: 3 } }));
console.log(
  'Array comparison: Users with 3+ skills:',
  manySkills.map((u) => `${u.name} (${u.profile.skills.length})`),
);

// =============================================================================
// NESTED PATH ACCESS
// =============================================================================

console.log('\n\n🎯 NESTED PATH ACCESS');
console.log('─'.repeat(50));

// Nested object properties
const newYorkers = users.filter(matches({ 'profile.location.city': 'New York' }));
console.log(
  '\nNested paths: Users from New York:',
  newYorkers.map((u) => u.name),
);

// Nested with operators
const seniorBios = users.filter(matches({ 'profile.bio': { _icontains: 'senior' } }));
console.log(
  'Nested operators: Users with "senior" in bio:',
  seniorBios.map((u) => u.name),
);

// Array index access
const firstRoleAdmin = users.filter(matches({ 'roles.0': 'admin' }));
console.log(
  'Array index: Users whose first role is "admin":',
  firstRoleAdmin.map((u) => u.name),
);

// Nested array index with operators
const firstSkillJS = users.filter(matches({ 'profile.skills.0': { _icontains: 'Script' } }));
console.log(
  'Nested array index: Users whose first skill contains "Script":',
  firstSkillJS.map((u) => u.name),
);

// =============================================================================
// MONGODB-STYLE ARRAY TRAVERSAL (using mongoPath)
// =============================================================================

console.log('\n\n🗃️ MONGODB-STYLE ARRAY TRAVERSAL');
console.log('─'.repeat(50));

// Deep array traversal
const pythonSkilled = [company].filter(matches(mongoPath({ 'employees.skills.name': 'Python' })));
console.log(
  '\nArray traversal: Companies with Python-skilled employees:',
  pythonSkilled.map((c) => c.name),
);

// Mixed index and traversal
const secondSkillPython = [company].filter(
  matches(mongoPath({ 'employees.skills.1': { name: 'Python' } })),
);
console.log(
  'Mixed access: Companies where employee has Python as 2nd skill:',
  secondSkillPython.map((c) => c.name),
);

// Exact indices at multiple levels
const bobFirstSkill = [company].filter(
  matches(mongoPath({ 'employees.1.skills.0.name': 'Python' })),
);
console.log(
  "Deep indexing: Companies where 2nd employee's 1st skill is Python:",
  bobFirstSkill.map((c) => c.name),
);

// String operators on traversed arrays
const pythonCaseInsensitive = [company].filter(
  matches(mongoPath({ 'employees.skills.name': { _icontains: 'PYTHON' } })),
);
console.log(
  'Traversal + operators: Python skills (case-insensitive):',
  pythonCaseInsensitive.map((c) => c.name),
);

// =============================================================================
// SIZE OPERATIONS
// =============================================================================

console.log('\n\n📏 SIZE OPERATIONS');
console.log('─'.repeat(50));

// String length
const eightCharNames = users.filter(matches({ name: { _size: 8 } }));
console.log(
  '\nString size: Users with 8-character names:',
  eightCharNames.map((u) => u.name),
);

// Array length
const threeTagProducts = products.filter(matches({ tags: { _size: 3 } }));
console.log(
  'Array size: Products with exactly 3 tags:',
  threeTagProducts.map((p) => p.name),
);

// Object key count (using mongoPath for metadata access)
const threeKeyPrefs = (users as UserWithMetadata[]).filter(
  matches<UserWithMetadata>({ 'metadata.preferences': { _size: 3 } }),
);
console.log(
  'Object size: Users with 3 preference keys:',
  threeKeyPrefs.map((u) => u.name),
);

// =============================================================================
// LOGICAL OPERATORS
// =============================================================================

console.log('\n\n🧠 LOGICAL OPERATORS');
console.log('─'.repeat(50));

// AND operation
const activeAndOld = matches(
  {
    _and: [{ isActive: true }, { age: { _gte: 30 } }],
  },
  users,
);
console.log('\n_and: Active users 30+:', activeAndOld); // => true

// OR operation
const youngOrLondon = users.filter(
  matches({
    _or: [{ age: { _lt: 30 } }, { 'profile.location.city': 'London' }],
  }),
);
console.log(
  '_or: Young users OR London residents:',
  youngOrLondon.map((u) => `${u.name} (${u.age}, ${u.profile.location.city})`),
);

// NOT operation
const notYoung = users.filter(
  matches({
    _not: { age: { _lt: 30 } },
  }),
);
console.log(
  '_not: Users who are NOT young (<30):',
  notYoung.map((u) => `${u.name} (${u.age})`),
);

// Complex nested logical
const complexLogic = users.filter(
  matches({
    _and: [
      {
        _or: [{ age: { _gte: 30 } }, { roles: 'admin' }],
      },
      { isActive: true },
    ],
  }),
);
console.log(
  'Complex: (Age 30+ OR admin) AND active:',
  complexLogic.map((u) => u.name),
);

// =============================================================================
// EXISTENCE CHECKS
// =============================================================================

console.log('\n\n✅ EXISTENCE CHECKS');
console.log('─'.repeat(50));

// Field exists
const withLastLogin = (users as UserWithMetadata[]).filter(
  matches<UserWithMetadata>({ 'metadata.lastLogin': { _exists: true } }),
);
console.log(
  '\n_exists true: Users with lastLogin field:',
  withLastLogin.map((u) => u.name),
);

// Field doesn't exist
const withoutLastLogin = (users as UserWithMetadata[]).filter(
  matches<UserWithMetadata>({ 'metadata.lastLogin': { _exists: false } }),
);
console.log(
  '_exists false: Users without lastLogin field:',
  withoutLastLogin.map((u) => u.name),
);

// =============================================================================
// DATE OPERATIONS
// =============================================================================

console.log('\n\n📅 DATE OPERATIONS');
console.log('─'.repeat(50));

// Date equality
const exactDate = products.filter(matches({ createdAt: new Date('2025-01-01') }));
console.log(
  '\nDate equality: Products created on 2025-01-01:',
  exactDate.map((p) => p.name),
);

// Date comparison
const recentProducts = products.filter(matches({ createdAt: { _gt: new Date('2025-01-10') } }));
console.log(
  'Date comparison: Products created after 2025-01-10:',
  recentProducts.map((p) => p.name),
);

// Date range
const januaryProducts = products.filter(
  matches({
    createdAt: {
      _gte: new Date('2025-01-01'),
      _lte: new Date('2025-01-31'),
    },
  }),
);
console.log(
  'Date range: January 2025 products:',
  januaryProducts.map((p) => p.name),
);

// =============================================================================
// CUSTOM EXTRACTOR FUNCTION
// =============================================================================

console.log('\n\n🔧 CUSTOM EXTRACTOR FUNCTION');
console.log('─'.repeat(50));

// Case-insensitive custom extractor
function caseInsensitiveExtractor(obj: any, key: string): any {
  // Get value using default path resolution
  const parts = key.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;

    if (Array.isArray(current) && /^\d+$/.test(part)) {
      current = current[parseInt(part, 10)];
    } else if (typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  // Convert strings to lowercase for case-insensitive matching
  return typeof current === 'string' ? current.toLowerCase() : current;
}

// Using custom extractor with company data
const techCorpInsensitive = [company].filter((item) =>
  matches({ name: 'tech corp' }, item, caseInsensitiveExtractor),
);
console.log(
  '\nCustom extractor: Case-insensitive company name match:',
  techCorpInsensitive.map((c) => c.name),
);

// =============================================================================
// ADVANCED ARRAY ELEMENT MATCHING (_elemMatch)
// =============================================================================

console.log('\n\n🎪 ADVANCED ARRAY ELEMENT MATCHING');
console.log('─'.repeat(50));

// _elemMatch for arrays of objects
const reactExperts = company.employees.filter(
  matches({
    skills: {
      _elemMatch: {
        name: 'React',
        level: { _in: ['advanced', 'expert'] },
        years: { _gte: 5 },
      },
    },
  }),
);
console.log(
  '\n_elemMatch: React experts (advanced+ level, 5+ years):',
  reactExperts.map((e) => e.name),
);

// Nested _elemMatch
const pythonCompaniesPPPP = [company].filter(
  matches({
    employees: {
      _elemMatch: {
        skills: {
          _elemMatch: {
            name: { _icontains: 'python' },
          },
        },
      },
    },
  }),
);
console.log(
  'Nested _elemMatch: Companies with Python-skilled employees:',
  pythonCompaniesPPPP.map((c) => c.name),
);

// =============================================================================
// PERFORMANCE DEMONSTRATION
// =============================================================================

console.log('\n\n⚡ PERFORMANCE DEMONSTRATION');
console.log('─'.repeat(50));

// Large dataset
const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `User ${i}`,
  age: 20 + (i % 50),
  isActive: i % 2 === 0,
  roles: i % 10 === 0 ? ['admin'] : ['user'],
  score: Math.random() * 100,
}));

console.log(`\nCreated dataset with ${largeDataset.length} items`);

// Performance test
const startTime = performance.now();
const complexQuery = largeDataset.filter(
  matches({
    _and: [{ isActive: true }, { age: { _gte: 30 } }, { score: { _gt: 50 } }, { roles: 'user' }],
  }),
);
const endTime = performance.now();

console.log(
  `Complex query on ${largeDataset.length} items: ${complexQuery.length} results in ${(endTime - startTime).toFixed(2)}ms`,
);

// =============================================================================
// TYPE SAFETY EXAMPLES
// =============================================================================

console.log('\n\n🛡️ TYPE SAFETY EXAMPLES');
console.log('─'.repeat(50));

// Strongly typed filter
const typedUserFilter = matches<User>({
  name: { _startsWith: 'J' },
  age: { _gt: 25 },
  'profile.bio': { _contains: 'developer' },
  'profile.skills': 'JavaScript',
  isActive: true,
});

const typedResults = users.filter(typedUserFilter);
console.log(
  '\nTyped filter results:',
  typedResults.map((u) => u.name),
);

// mongoPath for dynamic/unknown paths
const dynamicFilter = matches(
  mongoPath({
    'some.dynamic.path': 'value',
    'metadata.preferences.theme': 'dark',
  }),
);

const dynamicResults = users.filter(dynamicFilter);
console.log(
  'Dynamic path filter (theme=dark):',
  dynamicResults.map((u) => u.name),
);

// =============================================================================
// CURRYING PATTERNS
// =============================================================================

console.log('\n\n🍛 CURRYING PATTERNS');
console.log('─'.repeat(50));

// Create reusable filters
const activeFilter = matches({ isActive: true });
const adminFilter2 = matches({ roles: 'admin' });
const experiencedFilter = matches({ age: { _gte: 30 } });

console.log('\nUsing curried filters:');
console.log(
  'Active users:',
  users.filter(activeFilter).map((u) => u.name),
);
console.log(
  'Admin users:',
  users.filter(adminFilter2).map((u) => u.name),
);
console.log(
  'Experienced users:',
  users.filter(experiencedFilter).map((u) => u.name),
);

// Combine filters with logical operators
const seniorAdminFilter = matches({
  _and: [{ isActive: true }, { roles: 'admin' }, { age: { _gte: 25 } }],
});

console.log(
  'Senior admin users:',
  users.filter(seniorAdminFilter).map((u) => u.name),
);

// =============================================================================
// EDGE CASES AND ERROR HANDLING
// =============================================================================

console.log('\n\n⚠️ EDGE CASES');
console.log('─'.repeat(50));

// Null/undefined handling
const testData = [
  { id: 1, name: 'Test1', value: null },
  { id: 2, name: 'Test2', value: undefined },
  { id: 3, name: 'Test3', value: 'actual' },
];

const nullValues = testData.filter(matches({ value: { _exists: false } }));
console.log(
  '\nNull/undefined handling:',
  nullValues.map((t) => `${t.name}: ${t.value}`),
);

// Empty arrays
const emptyArray: any[] = [];
const emptyResults = emptyArray.filter(matches({ name: 'test' }));
console.log('Empty array filtering:', emptyResults.length);

// Non-existent paths (graceful failure)
const nonExistentPath = users.filter(matches(mongoPath({ 'nonexistent.path': 'value' })));
console.log('Non-existent path results:', nonExistentPath.length);

console.log('\n=== END OF EXAMPLES ===');
