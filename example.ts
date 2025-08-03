/* eslint-disable complexity, max-statements, guard-for-in, style/indent-binary-ops, no-restricted-syntax, style/indent, style/quote-props, style/quotes, max-nested-callbacks */

import { matches } from './index.ts';

// Sample data interfaces
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  roles: string[];
  profile: {
    bio: string;
    skills: string[];
    location: {
      city: string;
      country: string;
    };
  };
  metadata?: {
    lastLogin?: string;
    preferences: Record<string, any>;
  };
}

// Basic user data
const users: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    isActive: true,
    roles: ['admin', 'user'],
    profile: {
      bio: 'Senior developer with 10 years experience',
      skills: ['JavaScript', 'TypeScript', 'React'],
      location: { city: 'New York', country: 'USA' },
    },
    metadata: {
      lastLogin: '2025-07-30',
      preferences: { theme: 'dark', notifications: true },
    },
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 25,
    isActive: false,
    roles: ['user'],
    profile: {
      bio: 'Frontend developer passionate about UX',
      skills: ['React', 'CSS', 'Design'],
      location: { city: 'London', country: 'UK' },
    },
    metadata: {
      preferences: { theme: 'light', notifications: false },
    },
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@test.com',
    age: 35,
    isActive: true,
    roles: ['user', 'moderator'],
    profile: {
      bio: 'Full-stack engineer',
      skills: ['Python', 'JavaScript', 'Docker'],
      location: { city: 'Berlin', country: 'Germany' },
    },
    metadata: {
      lastLogin: '2025-07-29',
      preferences: { theme: 'dark', notifications: true },
    },
  },
];

// Extended user data with dates
const usersWithDates: (User & { createdAt: Date; lastActivity: Date })[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    isActive: true,
    roles: ['admin', 'user'],
    profile: {
      bio: 'Senior developer with 10 years experience',
      skills: ['JavaScript', 'TypeScript', 'React'],
      location: { city: 'New York', country: 'USA' },
    },
    metadata: {
      lastLogin: '2025-07-30',
      preferences: { theme: 'dark', notifications: true },
    },
    createdAt: new Date('2025-01-15'),
    lastActivity: new Date('2025-07-30'),
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 25,
    isActive: false,
    roles: ['user'],
    profile: {
      bio: 'Frontend developer passionate about UX',
      skills: ['React', 'CSS', 'Design'],
      location: { city: 'London', country: 'UK' },
    },
    metadata: {
      preferences: { theme: 'light', notifications: false },
    },
    createdAt: new Date('2024-12-01'),
    lastActivity: new Date('2025-07-25'),
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@test.com',
    age: 35,
    isActive: true,
    roles: ['user', 'moderator'],
    profile: {
      bio: 'Full-stack engineer',
      skills: ['Python', 'JavaScript', 'Docker'],
      location: { city: 'Berlin', country: 'Germany' },
    },
    metadata: {
      lastLogin: '2025-07-29',
      preferences: { theme: 'dark', notifications: true },
    },
    createdAt: new Date('2024-11-20'),
    lastActivity: new Date('2025-07-29'),
  },
];

// Complex nested data for array index examples
const complexData = [
  {
    id: 1,
    projects: [
      { name: 'Project A', status: 'active', tags: ['web', 'react'] },
      { name: 'Project B', status: 'completed', tags: ['mobile', 'flutter'] },
      { name: 'Project C', status: 'pending', tags: ['api', 'node'] },
    ],
    history: [
      { date: '2025-07-01', action: 'login' },
      { date: '2025-07-15', action: 'update_profile' },
      { date: '2025-07-30', action: 'create_project' },
    ],
  },
  {
    id: 2,
    projects: [
      { name: 'Project X', status: 'active', tags: ['design', 'figma'] },
      { name: 'Project Y', status: 'archived', tags: ['research'] },
    ],
    history: [
      { date: '2025-07-10', action: 'login' },
      { date: '2025-07-20', action: 'delete_project' },
    ],
  },
];

console.log('=== BASIC EQUALITY TESTS ===');

// 1. Simple equality
console.log("Users with name 'John Doe':");
console.log(users.filter((user) => matches({ name: 'John Doe' }, user)));

// 2. Number equality
console.log('\nUsers with age 30:');
console.log(users.filter((user) => matches({ age: 30 }, user)));

// 3. Boolean equality
console.log('\nActive users:');
console.log(users.filter((user) => matches({ isActive: true }, user)));

console.log('\n=== COMPARISON OPERATORS ===');

// 4. Greater than
console.log('Users older than 28:');
console.log(users.filter((user) => matches({ age: { _gt: 28 } }, user)));

// 5. Greater than or equal
console.log('\nUsers 30 or older:');
console.log(users.filter((user) => matches({ age: { _gte: 30 } }, user)));

// 6. Less than
console.log('\nUsers younger than 30:');
console.log(users.filter((user) => matches({ age: { _lt: 30 } }, user)));

// 7. Less than or equal
console.log('\nUsers 30 or younger:');
console.log(users.filter((user) => matches({ age: { _lte: 30 } }, user)));

// 8. Not equal
console.log("\nUsers not named 'John Doe':");
console.log(users.filter((user) => matches({ name: { _ne: 'John Doe' } }, user)));

console.log('\n=== STRING OPERATIONS ===');

// 9. Contains
console.log("Users with 'john' in email:");
console.log(users.filter((user) => matches({ email: { _contains: 'john' } }, user)));

// 10. Includes (alias for contains)
console.log("\nUsers with 'example' in email:");
console.log(users.filter((user) => matches({ email: { _includes: 'example' } }, user)));

// 11. Starts with
console.log("\nUsers whose name starts with 'J':");
console.log(users.filter((user) => matches({ name: { _startsWith: 'J' } }, user)));

// 12. Ends with
console.log("\nUsers whose email ends with '.com':");
console.log(users.filter((user) => matches({ email: { _endsWith: '.com' } }, user)));

// 13. Case-insensitive contains
console.log("\nUsers with 'JOHN' in email (case-insensitive):");
console.log(users.filter((user) => matches({ email: { _icontains: 'JOHN' } }, user)));

// 14. Case-insensitive starts with
console.log("\nUsers whose name starts with 'j' (case-insensitive):");
console.log(users.filter((user) => matches({ name: { _istartsWith: 'j' } }, user)));

// 15. Case-insensitive ends with
console.log("\nUsers whose email ends with '.COM' (case-insensitive):");
console.log(users.filter((user) => matches({ email: { _iendsWith: '.COM' } }, user)));

console.log('\n=== ARRAY OPERATIONS ===');

// 16. In array
console.log('Users aged 25 or 30:');
console.log(users.filter((user) => matches({ age: { _in: [25, 30] } }, user)));

// 17. Not in array
console.log('\nUsers not aged 25 or 30:');
console.log(users.filter((user) => matches({ age: { _nin: [25, 30] } }, user)));

// 18. Array contains value
console.log("\nUsers with 'admin' role:");
console.log(users.filter((user) => matches({ roles: 'admin' }, user)));

// 19. Element match
console.log("\nUsers with 'JavaScript' skill:");
console.log(
  users.filter((user) =>
    matches({ 'profile.skills': { _elemMatch: { _eq: 'JavaScript' } } }, user),
  ),
);

// 20. Array size
console.log('\nUsers with exactly 2 roles:');
console.log(users.filter((user) => matches({ roles: { _size: 2 } }, user)));

// 21. Array size for skills
console.log('\nUsers with exactly 3 skills:');
console.log(users.filter((user) => matches({ 'profile.skills': { _size: 3 } }, user)));

console.log('\n=== REGEX OPERATIONS ===');

// 22. Regex match
console.log('Users with email matching pattern:');
console.log(
  users.filter((user) => matches({ email: { _regex: '^[a-z]+@[a-z]+\\.(com|org)$' } }, user)),
);

// 23. Regex for names
console.log("\nUsers whose name contains 'o' (regex):");
console.log(users.filter((user) => matches({ name: { _regex: '.*o.*' } }, user)));

console.log('\n=== EXISTENCE CHECKS ===');

// 24. Field exists
console.log('Users with metadata.lastLogin field:');
console.log(users.filter((user) => matches({ 'metadata.lastLogin': { _exists: true } }, user)));

// 25. Field doesn't exist
console.log('\nUsers without metadata.lastLogin field:');
console.log(users.filter((user) => matches({ 'metadata.lastLogin': { _exists: false } }, user)));

console.log('\n=== NESTED OBJECT QUERIES ===');

// 26. Nested field equality
console.log('Users from New York:');
console.log(users.filter((user) => matches({ 'profile.location.city': 'New York' }, user)));

// 27. Nested field contains
console.log("\nUsers with 'developer' in bio:");
console.log(users.filter((user) => matches({ 'profile.bio': { _contains: 'developer' } }, user)));

// 28. Deep nested preferences
console.log('\nUsers with dark theme preference:');
console.log(users.filter((user) => matches({ 'metadata.preferences.theme': 'dark' }, user)));

console.log('\n=== LOGICAL OPERATORS ===');

// 29. AND operation
console.log('Active users older than 25:');
console.log(
  users.filter((user) =>
    matches(
      {
        _and: [{ isActive: true }, { age: { _gt: 25 } }],
      },
      user,
    ),
  ),
);

// 30. OR operation
console.log('\nUsers from USA or UK:');
console.log(
  users.filter((user) =>
    matches(
      {
        _or: [{ 'profile.location.country': 'USA' }, { 'profile.location.country': 'UK' }],
      },
      user,
    ),
  ),
);

// 31. Complex AND/OR
console.log('\nActive users from USA OR users with admin role:');
console.log(
  users.filter((user) =>
    matches(
      {
        _or: [
          {
            _and: [{ isActive: true }, { 'profile.location.country': 'USA' }],
          },
          { roles: 'admin' },
        ],
      },
      user,
    ),
  ),
);

// 32. NOT operation
console.log('\nUsers NOT from USA:');
console.log(
  users.filter((user) =>
    matches(
      {
        _not: { 'profile.location.country': 'USA' },
      },
      user,
    ),
  ),
);

// 33. Complex NOT
console.log('\nUsers NOT (active AND from USA):');
console.log(
  users.filter((user) =>
    matches(
      {
        _not: {
          _and: [{ isActive: true }, { 'profile.location.country': 'USA' }],
        },
      },
      user,
    ),
  ),
);

console.log('\n=== MULTIPLE CONDITIONS (Implicit AND) ===');

// 34. Multiple conditions
console.log('Active users older than 25 from Europe:');
console.log(
  users.filter((user) =>
    matches(
      {
        isActive: true,
        age: { _gt: 25 },
        'profile.location.country': { _in: ['UK', 'Germany', 'France'] },
      },
      user,
    ),
  ),
);

// 35. Mixed operators
console.log("\nUsers with 'J' names and gmail accounts:");
console.log(
  users.filter((user) =>
    matches(
      {
        name: { _startsWith: 'J' },
        email: { _contains: 'example' },
      },
      user,
    ),
  ),
);

console.log('\n=== ARRAY OF OBJECTS QUERIES ===');

// 36. Array element matching
console.log('Users with TypeScript skill:');
console.log(
  users.filter((user) =>
    matches(
      {
        'profile.skills': { _elemMatch: { _eq: 'TypeScript' } },
      },
      user,
    ),
  ),
);

// 37. Complex array matching
console.log("\nUsers with skills containing 'Script':");
console.log(
  users.filter((user) =>
    matches(
      {
        'profile.skills': { _elemMatch: { _contains: 'Script' } },
      },
      user,
    ),
  ),
);

console.log('\n=== SIZE OPERATIONS ===');

// 38. String size
console.log('Users with name longer than 8 characters:');
console.log(users.filter((user) => matches({ name: { _size: { _gt: 8 } } }, user)));

// 39. Object size (number of keys)
console.log('\nUsers with preferences having 2 keys:');
console.log(users.filter((user) => matches({ 'metadata.preferences': { _size: 2 } }, user)));

console.log('\n=== EDGE CASES ===');

// 40. Null/undefined handling
console.log('Users with non-null metadata:');
console.log(users.filter((user) => matches({ metadata: { _ne: null } }, user)));

// 41. Empty array
console.log('\nUsers with empty roles (none should match):');
console.log(users.filter((user) => matches({ roles: { _size: 0 } }, user)));

console.log('\n=== DATE OBJECT EXAMPLES ===');

// 42. Date equality
const targetDate = new Date('2025-01-15');
console.log('Users created on 2025-01-15:');
console.log(usersWithDates.filter((user) => matches({ createdAt: targetDate }, user)));

// 43. Date comparison - greater than
console.log('\nUsers created after 2024-12-01:');
console.log(
  usersWithDates.filter((user) =>
    matches(
      {
        createdAt: { _gt: new Date('2024-12-01') },
      },
      user,
    ),
  ),
);

// 44. Date comparison - less than
console.log('\nUsers with last activity before 2025-07-30:');
console.log(
  usersWithDates.filter((user) =>
    matches(
      {
        lastActivity: { _lt: new Date('2025-07-30') },
      },
      user,
    ),
  ),
);

// 45. Date range
console.log('\nUsers created in 2025:');
console.log(
  usersWithDates.filter((user) =>
    matches(
      {
        _and: [
          { createdAt: { _gte: new Date('2025-01-01') } },
          { createdAt: { _lt: new Date('2026-01-01') } },
        ],
      },
      user,
    ),
  ),
);

console.log('\n=== ARRAY INDEX ACCESS EXAMPLES ===');

// 46. Access first skill directly
console.log("Users whose first skill is 'JavaScript':");
console.log(users.filter((user) => matches({ 'profile.skills.0': 'JavaScript' }, user)));

// 47. Access second skill
console.log("\nUsers whose second skill is 'TypeScript':");
console.log(users.filter((user) => matches({ 'profile.skills.1': 'TypeScript' }, user)));

// 48. Access third skill with contains
console.log("\nUsers whose third skill contains 'React':");
console.log(users.filter((user) => matches({ 'profile.skills.2': { _contains: 'React' } }, user)));

// 49. Complex nested array access
console.log("\nProjects where first project name is 'Project A':");
console.log(complexData.filter((item) => matches({ 'projects.0.name': 'Project A' }, item)));

// 50. Access nested array with index and property
console.log("\nItems where second project status is 'completed':");
console.log(complexData.filter((item) => matches({ 'projects.1.status': 'completed' }, item)));

// 51. Access array element's array property
console.log("\nItems where first project's first tag is 'web':");
console.log(complexData.filter((item) => matches({ 'projects.0.tags.0': 'web' }, item)));

// 52. Access history by index
console.log("\nItems where first history action is 'login':");
console.log(complexData.filter((item) => matches({ 'history.0.action': 'login' }, item)));

// 53. Access last history item (if you know the index)
console.log("\nItems where third history action is 'create_project':");
console.log(complexData.filter((item) => matches({ 'history.2.action': 'create_project' }, item)));

// 54. Complex array index with comparison
console.log('\nItems where second project has more than 1 tag:');
console.log(
  complexData.filter((item) => matches({ 'projects.1.tags': { _size: { _gt: 1 } } }, item)),
);

// 55. Array index with string operations
console.log("\nItems where first project name starts with 'Project':");
console.log(
  complexData.filter((item) => matches({ 'projects.0.name': { _startsWith: 'Project' } }, item)),
);

// 56. Array index with existence check
console.log('\nItems that have a third project:');
console.log(complexData.filter((item) => matches({ 'projects.2': { _exists: true } }, item)));

// 57. Array index with nested existence
console.log('\nItems where second project has tags:');
console.log(complexData.filter((item) => matches({ 'projects.1.tags': { _exists: true } }, item)));

// 58. Multiple array index access
console.log('\nItems where first project is active AND second project exists:');
console.log(
  complexData.filter((item) =>
    matches(
      {
        _and: [{ 'projects.0.status': 'active' }, { 'projects.1': { _exists: true } }],
      },
      item,
    ),
  ),
);

// 59. Array index with OR logic
console.log("\nItems where first OR second project is 'active':");
console.log(
  complexData.filter((item) =>
    matches(
      {
        _or: [{ 'projects.0.status': 'active' }, { 'projects.1.status': 'active' }],
      },
      item,
    ),
  ),
);

// 60. Deep array index nesting
console.log('\nUsers from USA accessing nested location through skills array length check:');
console.log(
  users.filter((user) =>
    matches(
      {
        _and: [
          { 'profile.location.country': 'USA' },
          { 'profile.skills.0': { _exists: true } }, // First skill exists
        ],
      },
      user,
    ),
  ),
);

console.log('\n=== MIXED ARRAY ACCESS PATTERNS ===');

// 61. Combining elemMatch with direct index access
console.log(
  "Items where projects contain 'active' status AND first project name contains 'Project':",
);
console.log(
  complexData.filter((item) =>
    matches(
      {
        _and: [
          { projects: { _elemMatch: { status: 'active' } } },
          { 'projects.0.name': { _contains: 'Project' } },
        ],
      },
      item,
    ),
  ),
);

// 62. Array size with index access
console.log('\nItems with exactly 3 projects where second project is completed:');
console.log(
  complexData.filter((item) =>
    matches(
      {
        _and: [{ projects: { _size: 3 } }, { 'projects.1.status': 'completed' }],
      },
      item,
    ),
  ),
);

// 63. Index access with regex
console.log('\nItems where first history date matches July 2025 pattern:');
console.log(
  complexData.filter((item) =>
    matches(
      {
        'history.0.date': { _regex: '^2025-07-' },
      },
      item,
    ),
  ),
);

console.log('\n=== ERROR HANDLING EXAMPLES ===');

try {
  // 64. Invalid _and/_or combination
  matches({ _and: [], _or: [] }, users[0]);
} catch (err) {
  console.log('Expected error for _and/_or combination:', (err as Error).message);
}

try {
  // 65. Invalid _not usage
  matches({ _not: 'invalid' as any }, users[0]);
} catch (err) {
  console.log('Expected error for invalid _not:', (err as Error).message);
}

try {
  // 66. Null expression
  matches(null as any, users[0]);
} catch (err) {
  console.log('Expected error for null expression:', (err as Error).message);
}

console.log('\n=== PERFORMANCE TEST EXAMPLES ===');

// 67. Large dataset simulation
const largeDataset = Array(1000)
  .fill(null)
  .map((_, i) => ({
    id: i,
    name: `User ${i}`,
    age: 20 + (i % 50),
    active: i % 2 === 0,
  }));

console.log('Large dataset filtering - active users over 35:');
const startTime = Date.now();
const filtered = largeDataset.filter((user) =>
  matches(
    {
      _and: [{ active: true }, { age: { _gt: 35 } }],
    },
    user,
  ),
);
const endTime = Date.now();
console.log(`Found ${filtered.length} users in ${endTime - startTime}ms`);

console.log('\n=== CUSTOM EXTRACTOR EXAMPLE ===');

// 68. Custom extractor function
function customExtractor(obj: any, key: string) {
  // Custom logic - make all string comparisons case-insensitive
  const value = obj[key];

  return typeof value === 'string' ? value.toLowerCase() : value;
}

console.log('Using custom extractor for case-insensitive name matching:');
console.log(users.filter((user) => matches({ name: 'john doe' }, user, customExtractor)));

// id: number;
// name: string;
// email: string;
// age: number;
// isActive: boolean;
// roles: string[];
// profile: {
//   bio: string;
//   skills: string[];
//   location: {
//     city: string;
//     country: string;
//   };
// };
// metadata?: {
//   lastLogin?: string;
//   preferences: Record<string, any>;
// };

// Full autocomplete and type checking!
const filter = matches<User>({
  name: { _startsWith: 'J' }, // ✅ autocomplete works
  age: { _gt: 25 }, // ✅ number operators
  'profile.bio': { _contains: 'dev' }, // ✅ nested paths
  'profile.location.city': { _icontains: 'ber' }, // ✅ deep nesting
  'roles.0': 'admin', // ✅ array indices
  roles: { _elemMatch: { _eq: 'user' } }, // ✅ array operations
});
