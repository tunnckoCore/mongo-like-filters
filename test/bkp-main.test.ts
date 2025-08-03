/* eslint-disable complexity, max-statements, guard-for-in, style/indent-binary-ops, no-restricted-syntax, style/indent, style/quote-props, style/quotes, max-nested-callbacks */
import { describe, expect, test } from 'bun:test';

import { matches } from '../index.ts';

// Test data interfaces
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

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  tags: string[];
  specs: {
    weight: number;
    dimensions: {
      width: number;
      height: number;
      depth: number;
    };
  };
}

// Test data
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
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
      location: {
        city: 'New York',
        country: 'USA',
      },
    },
    metadata: {
      lastLogin: '2025-07-30',
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'en',
      },
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
      skills: ['React', 'CSS'],
      location: {
        city: 'San Francisco',
        country: 'USA',
      },
    },
    metadata: {
      preferences: {
        theme: 'light',
      },
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
      location: {
        city: 'London',
        country: 'UK',
      },
    },
    metadata: {
      lastLogin: '2025-07-29',
      preferences: {
        theme: 'dark',
        timezone: 'GMT',
      },
    },
  },
];

const products: Product[] = [
  {
    id: 1,
    name: 'Laptop Pro',
    price: 1299.99,
    category: 'electronics',
    tags: ['computer', 'portable', 'work'],
    specs: {
      weight: 1.5,
      dimensions: {
        width: 30,
        height: 2,
        depth: 20,
      },
    },
  },
  {
    id: 2,
    name: 'Gaming Mouse',
    price: 79.99,
    category: 'accessories',
    tags: ['gaming', 'peripheral', 'rgb'],
    specs: {
      weight: 0.1,
      dimensions: {
        width: 12,
        height: 4,
        depth: 7,
      },
    },
  },
];

describe('mongo-like-filters', () => {
  describe('Basic equality matching', () => {
    test('should match exact string values', () => {
      const result = users.filter(matches({ name: 'John Doe' }));
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe(1);
    });

    test('should match exact number values', () => {
      const result = users.filter(matches({ age: 30 }));
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('John Doe');
    });

    test('should match boolean values', () => {
      const result = users.filter(matches({ isActive: true }));
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.name)).toEqual(['John Doe', 'Bob Johnson']);
    });

    test('should return empty array for no matches', () => {
      const result = users.filter(matches({ name: 'Non Existent' }));
      expect(result).toHaveLength(0);
    });
  });

  describe('Comparison operators', () => {
    test('should match _gt (greater than)', () => {
      const result = users.filter(matches({ age: { _gt: 28 } }));
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.age).sort()).toEqual([30, 35]);
    });

    test('should match _gte (greater than or equal)', () => {
      const result = users.filter(matches({ age: { _gte: 30 } }));
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.age).sort()).toEqual([30, 35]);
    });

    test('should match _lt (less than)', () => {
      const result = users.filter(matches({ age: { _lt: 30 } }));
      expect(result).toHaveLength(1);
      expect(result[0]?.age).toBe(25);
    });

    test('should match _lte (less than or equal)', () => {
      const result = users.filter(matches({ age: { _lte: 30 } }));
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.age).sort()).toEqual([25, 30]);
    });

    test('should match _ne (not equal)', () => {
      const result = users.filter(matches({ age: { _ne: 30 } }));
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.age).sort()).toEqual([25, 35]);
    });
  });

  describe('String operators', () => {
    test('should match _contains', () => {
      const result = users.filter(matches({ email: { _contains: 'example' } }));
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.name)).toEqual(['John Doe', 'Jane Smith']);
    });

    test('should match _contains with different pattern', () => {
      const result = users.filter(matches({ email: { _contains: 'john' } }));
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('John Doe');
    });

    test('should match _startsWith', () => {
      const result = users.filter(matches({ name: { _startsWith: 'J' } }));
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.name)).toEqual(['John Doe', 'Jane Smith']);
    });

    test('should match _endsWith', () => {
      const result = users.filter(matches({ email: { _endsWith: '.com' } }));
      expect(result).toHaveLength(3);
    });

    test('should match case-insensitive _icontains', () => {
      const result = users.filter(matches({ email: { _icontains: 'JOHN' } }));
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('John Doe');
    });

    test('should match case-insensitive _istartsWith', () => {
      const result = users.filter(matches({ name: { _istartsWith: 'j' } }));
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.name)).toEqual(['John Doe', 'Jane Smith']);
    });

    test('should match case-insensitive _iendsWith', () => {
      const result = users.filter(matches({ email: { _iendsWith: '.COM' } }));
      expect(result).toHaveLength(3);
    });

    test('should match _regex patterns', () => {
      const result = users.filter(matches({ email: { _regex: '^[a-z]+@' } }));
      expect(result).toHaveLength(3);
    });
  });

  describe('Array operators', () => {
    test('should match _in (value in array)', () => {
      const result = users.filter(matches({ age: { _in: [25, 30] } }));
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.age).sort()).toEqual([25, 30]);
    });

    test('should match _nin (value not in array)', () => {
      const result = users.filter(matches({ age: { _nin: [25, 30] } }));
      expect(result).toHaveLength(1);
      expect(result[0]?.age).toBe(35);
    });

    test('should match array contains value (direct assignment)', () => {
      const result = users.filter(matches({ roles: 'admin' }));
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('John Doe');
    });

    test('should match _size for arrays', () => {
      const result = users.filter(matches({ 'profile.skills': { _size: 3 } }));
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('Bob Johnson');
    });

    test('should match _elemMatch for array elements', () => {
      const result = users.filter(
        matches({
          'profile.skills': { _elemMatch: { _eq: 'JavaScript' } },
        }),
      );
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.name)).toEqual(['John Doe', 'Bob Johnson']);
    });

    test('should match _elemMatch with string operators', () => {
      const result = users.filter(
        matches({
          'profile.skills': { _elemMatch: { _contains: 'Script' } },
        }),
      );
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.name)).toEqual(['John Doe', 'Bob Johnson']);
    });
  });

  describe('Nested path access', () => {
    test('should match nested object properties', () => {
      const result = users.filter(matches({ 'profile.bio': { _contains: 'developer' } }));
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.name)).toEqual(['John Doe', 'Jane Smith']);
    });

    test('should match deeply nested properties', () => {
      const result = users.filter(matches({ 'profile.location.city': 'New York' }));
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('John Doe');
    });

    test('should match optional nested properties', () => {
      const result = users.filter(matches({ 'metadata.lastLogin': { _exists: true } } as any));
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.name).sort()).toEqual(['Bob Johnson', 'John Doe']);
    });

    test('should match array indices', () => {
      const result = users.filter(matches({ 'roles.0': 'admin' }));
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('John Doe');
    });

    test('should match nested array properties', () => {
      const result = users.filter(matches({ 'profile.skills.0': 'JavaScript' }));
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('John Doe');
    });
  });

  describe('Existence operators', () => {
    test('should match _exists: true', () => {
      const result = users.filter(matches({ 'metadata.lastLogin': { _exists: true } } as any));
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.name).sort()).toEqual(['Bob Johnson', 'John Doe']);
    });

    test('should match _exists: false', () => {
      const result = users.filter(matches({ 'metadata.lastLogin': { _exists: false } } as any));
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Jane Smith');
    });
  });

  describe('Logical operators', () => {
    test('should match _and conditions', () => {
      const result = users.filter(
        matches({
          _and: [{ age: { _gt: 25 } }, { isActive: true }],
        }),
      );
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.name)).toEqual(['John Doe', 'Bob Johnson']);
    });

    test('should match _or conditions', () => {
      const result = users.filter(
        matches({
          _or: [{ age: { _lt: 26 } }, { age: { _gt: 34 } }],
        }),
      );
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.name)).toEqual(['Jane Smith', 'Bob Johnson']);
    });

    test('should match _not conditions', () => {
      const result = users.filter(
        matches({
          _not: { isActive: false },
        }),
      );
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.name)).toEqual(['John Doe', 'Bob Johnson']);
    });

    test('should handle complex nested logical operators', () => {
      const result = users.filter(
        matches({
          _and: [
            {
              _or: [{ 'profile.location.city': 'New York' }, { 'profile.location.city': 'London' }],
            },
            { age: { _gte: 30 } },
          ],
        }),
      );
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.name)).toEqual(['John Doe', 'Bob Johnson']);
    });
  });

  describe('Size operators', () => {
    test('should match string _size', () => {
      const result = users.filter(matches({ name: { _size: 8 } }));
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('John Doe');
    });

    test('should match array _size', () => {
      const result = products.filter(matches({ tags: { _size: 3 } }));
      expect(result).toHaveLength(2);
    });

    test('should match object _size', () => {
      // Object size counts the number of keys
      // John: 3 keys (theme, notifications, language)
      const result3 = users.filter(matches({ 'metadata.preferences': { _size: 3 } } as any));
      expect(result3).toHaveLength(1);
      expect(result3[0]!.name).toBe('John Doe');

      // Jane: 1 key (theme)
      const result1 = users.filter(matches({ 'metadata.preferences': { _size: 1 } } as any));
      expect(result1).toHaveLength(1);
      expect(result1[0]!.name).toBe('Jane Smith');

      // Bob: 2 keys (theme, timezone)
      const result2 = users.filter(matches({ 'metadata.preferences': { _size: 2 } } as any));
      expect(result2).toHaveLength(1);
      expect(result2[0]!.name).toBe('Bob Johnson');
    });

    test('should match _size on arrays length', () => {
      // Test size 4 (John has 4 skills)
      const result4 = users.filter(matches({ 'profile.skills': { _size: 4 } }));
      expect(result4).toHaveLength(1);
      expect(result4[0]!.name).toBe('John Doe');

      // Test size 2 (Jane has 2 skills)
      const result2 = users.filter(matches({ 'profile.skills': { _size: 2 } }));
      expect(result2).toHaveLength(1);
      expect(result2[0]!.name).toBe('Jane Smith');
    });

    test('should support array length with comparison operators', () => {
      // Test _gte: users with skills length >= 3 (John: 4, Bob: 3)
      const usersWithManySkills = users.filter(matches({ 'profile.skills': { _gte: 3 } }));
      expect(usersWithManySkills).toHaveLength(2);
      expect(usersWithManySkills.map((u) => u.name).sort()).toEqual(['Bob Johnson', 'John Doe']);

      // Test _lt: users with skills length < 3 (Jane: 2)
      const usersWithFewSkills = users.filter(matches({ 'profile.skills': { _lt: 3 } }));
      expect(usersWithFewSkills).toHaveLength(1);
      expect(usersWithFewSkills[0]!.name).toBe('Jane Smith');

      // Test _gt: users with skills length > 3 (John: 4)
      const usersWithMostSkills = users.filter(matches({ 'profile.skills': { _gt: 3 } }));
      expect(usersWithMostSkills).toHaveLength(1);
      expect(usersWithMostSkills[0]!.name).toBe('John Doe');

      // Test _lte: users with skills length <= 2 (Jane: 2)
      const usersWithFewestSkills = users.filter(matches({ 'profile.skills': { _lte: 2 } }));
      expect(usersWithFewestSkills).toHaveLength(1);
      expect(usersWithFewestSkills[0]!.name).toBe('Jane Smith');
    });

    test('should match string _size with different lengths', () => {
      // Test name length 10 (Jane Smith)
      const result10 = users.filter(matches({ name: { _size: 10 } }));
      expect(result10).toHaveLength(1);
      expect(result10[0]!.name).toBe('Jane Smith');

      // Test name length 11 (Bob Johnson)
      const result11 = users.filter(matches({ name: { _size: 11 } }));
      expect(result11).toHaveLength(1);
      expect(result11[0]!.name).toBe('Bob Johnson');

      // Test name length that doesn't exist
      const result999 = users.filter(matches({ name: { _size: 999 } }));
      expect(result999).toHaveLength(0);
    });
  });

  describe('Currying support', () => {
    test('should support curried function calls', () => {
      const isAdminUser = matches<User>({ roles: 'admin' });
      const result = users.filter(isAdminUser);
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('John Doe');
    });

    test('should work with complex curried filters', () => {
      const activeExperiencedUsers = matches<User>({
        _and: [{ isActive: true }, { age: { _gte: 30 } }],
      });
      const result = users.filter(activeExperiencedUsers);
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.name)).toEqual(['John Doe', 'Bob Johnson']);
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle null/undefined values gracefully', () => {
      const testData = [
        { id: 1, name: 'Test', value: null },
        { id: 2, name: 'Test2', value: undefined },
        { id: 3, name: 'Test3', value: 'actual' },
      ];

      const result = testData.filter(matches({ value: { _exists: false } }));
      expect(result).toHaveLength(2);
    });

    test('should handle empty arrays', () => {
      const result: any[] = [];
      const filtered = result.filter(matches<any>({ name: 'test' }));
      expect(filtered).toHaveLength(0);
    });

    test('should handle missing nested properties', () => {
      const result = users.filter(matches({ 'nonexistent.path': 'value' } as any));
      expect(result).toHaveLength(0);
    });

    test('should throw error for _and and _or at same level', () => {
      expect(() => {
        users.filter(
          matches({
            _and: [{ age: 30 }],
            _or: [{ name: 'test' }],
          }),
        );
      }).toThrow('Indeterminate behavior');
    });

    test('should throw error for invalid _not usage', () => {
      expect(() => {
        matches({ _not: 'invalid' as any }, users[0]);
      }).toThrow('_not needs a regex or a document');
    });
  });

  describe('Type inference and autocomplete', () => {
    test('should provide proper type inference for User type', () => {
      // This test verifies that TypeScript compilation works correctly
      const filter = matches<User>({
        name: { _startsWith: 'J' },
        age: { _gt: 25 },
        'profile.bio': { _contains: 'dev' },
        'profile.location.city': 'New York',
        'roles.0': 'admin',
        roles: { _elemMatch: { _eq: 'user' } },
      });

      const result = users.filter(filter);
      expect(typeof result).toBe('object');
      expect(Array.isArray(result)).toBe(true);
    });

    test('should provide proper type inference for Product type', () => {
      // This test verifies that TypeScript compilation works for different types
      const filter = matches<Product>({
        name: { _contains: 'Laptop' },
        price: { _lt: 1500 },
        'specs.weight': { _lte: 2.0 },
        'specs.dimensions.width': { _gt: 25 },
        tags: { _elemMatch: { _eq: 'computer' } },
      });

      const result = products.filter(filter);
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('Laptop Pro');
    });
  });

  describe('Performance and complex queries', () => {
    test('should handle complex multi-level queries efficiently', () => {
      const startTime = performance.now();

      const result = users.filter(
        matches({
          _and: [
            {
              _or: [
                { 'profile.skills': { _elemMatch: { _contains: 'Script' } } },
                { 'profile.bio': { _regex: 'developer|engineer' } },
              ],
            },
            {
              _not: { age: { _lt: 25 } },
            },
            { isActive: true },
          ],
        }),
      );

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result).toHaveLength(2);
      expect(result.map((u) => u.name)).toEqual(['John Doe', 'Bob Johnson']);
      expect(executionTime).toBeLessThan(10); // Should execute quickly
    });

    test('should work with large datasets and proper filtering', () => {
      // Create a larger dataset for performance testing
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 20 + (i % 50),
        isActive: i % 2 === 0,
        roles:
          i % 10 === 0
            ? ['admin']
            : i % 5 === 0
              ? ['mod']
              : i % 2 === 0
                ? ['user']
                : ['user', 'mod'],
        // roles: i % 3 === 0 ? ['admin', 'user'] : i % 2 === 0 ? ['admin'] : ['user'],
        profile: {
          bio: `Bio for user ${i}`,
          skills: ['JavaScript', 'TypeScript'].slice(0, (i % 2) + 1),
          location: {
            city: ['New York', 'San Francisco', 'London'][i % 3],
            country: 'Test Country',
          },
        },
      }));

      const adminsOnly = largeDataset.filter(
        matches({
          roles: { _eq: ['admin'] },
        }),
      );
      const usersOrModsOrUserAndMods = largeDataset.filter(
        matches({
          roles: { _in: ['user', 'mod'] },
        }),
      );
      const usersOnly = largeDataset.filter(
        matches({
          roles: ['user'],
        }),
      );
      const usersAndModsExplicit = largeDataset.filter(
        matches({
          roles: ['user', 'mod'],
        }),
      );
      const hasUserRoleWithImplicitContains = largeDataset.filter(
        matches({
          roles: 'user',
        }),
      );
      const modsOnly = largeDataset.filter(
        matches({
          roles: { _eq: ['mod'] },
        }),
      );

      expect(adminsOnly.length).toBe(100);
      expect(modsOnly.length).toBe(100);
      expect(usersOnly.length).toBe(400);
      expect(usersAndModsExplicit.length).toBe(400);
      expect(usersOrModsOrUserAndMods.length).toBe(900);
      expect(hasUserRoleWithImplicitContains.length).toBe(800);
    });
  });
});
