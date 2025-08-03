import { describe, expect, test } from 'bun:test';

import { matches, mongoPath } from '../src/index.ts';
import {
  company,
  products,
  User,
  users,
  type Company,
  type Employee,
  type UserWithMetadata,
} from './fake-data.ts';

describe('Basic Value Matching', () => {
  test('should match exact string values', () => {
    const result = users.filter(matches({ name: 'John Doe' }));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('John Doe');
  });

  test('should match exact number values', () => {
    const result = users.filter(matches({ age: 30 }));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('John Doe');
  });

  test('should match boolean values', () => {
    const result = users.filter(matches({ isActive: true }));
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.name).sort()).toEqual(['Bob Johnson', 'John Doe']);
  });

  test('should return empty array for no matches', () => {
    const result = users.filter(matches({ name: 'Non-existent User' }));
    expect(result).toHaveLength(0);
  });
});

describe('Comparison Operators', () => {
  test('should match _gt (greater than)', () => {
    const result = users.filter(matches({ age: { _gt: 30 } }));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Bob Johnson');
  });

  test('should match _gte (greater than or equal)', () => {
    const result = users.filter(matches({ age: { _gte: 30 } }));
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.name).sort()).toEqual(['Bob Johnson', 'John Doe']);
  });

  test('should match _lt (less than)', () => {
    const result = users.filter(matches({ age: { _lt: 30 } }));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Jane Smith');
  });

  test('should match _lte (less than or equal)', () => {
    const result = users.filter(matches({ age: { _lte: 30 } }));
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.name).sort()).toEqual(['Jane Smith', 'John Doe']);
  });

  test('should match _ne (not equal)', () => {
    const result = users.filter(matches({ age: { _ne: 30 } }));
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.name).sort()).toEqual(['Bob Johnson', 'Jane Smith']);
  });
});

describe('String Operators', () => {
  test('should match _contains', () => {
    const result = users.filter(matches({ email: { _contains: 'example' } }));
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.name).sort()).toEqual(['Jane Smith', 'John Doe']);
  });

  test('should match _startsWith', () => {
    const result = users.filter(matches({ name: { _startsWith: 'J' } }));
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.name).sort()).toEqual(['Jane Smith', 'John Doe']);
  });

  test('should match _endsWith', () => {
    const result = users.filter(matches({ email: { _endsWith: '.com' } }));
    expect(result).toHaveLength(3);
  });

  test('should match case-insensitive _icontains', () => {
    const result = users.filter(matches({ email: { _icontains: 'JOHN' } }));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('John Doe');
  });

  test('should match case-insensitive _istartsWith', () => {
    const result = users.filter(matches({ name: { _istartsWith: 'j' } }));
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.name).sort()).toEqual(['Jane Smith', 'John Doe']);
  });

  test('should match case-insensitive _iendsWith', () => {
    const result = users.filter(matches({ email: { _iendsWith: '.COM' } }));
    expect(result).toHaveLength(3);
  });

  test('should match _regex patterns', () => {
    const result = users.filter(matches({ email: { _regex: '^[a-z]+@test' } }));
    expect(result).toHaveLength(1);
  });

  test('should type error for unknown properties/keys', () => {
    // @ts-expect-error it is expected to type-error
    const result = users.filter(matches({ unknownProperty: 'val' }));
    expect(result).toHaveLength(0);

    const result2 = users.filter(
      matches({
        profile: {
          // location: { city: 'New York' },
          location: { city: { _icontains: 'new' } },
        },
      }),
    );

    // Case-InSensitive search for 'new' in 'New York' should return 1 results
    expect(result2).toHaveLength(1);
  });
});

describe('Array Operators - New Intuitive Behavior', () => {
  test('should match direct string assignment (implicit contains)', () => {
    const result = users.filter(matches({ roles: 'admin' }));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('John Doe');
  });

  test('should match direct array assignment (strict equality)', () => {
    const result = users.filter(matches({ roles: ['user'] }));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Jane Smith');
  });

  test('should match multi-element array assignment (strict equality)', () => {
    const result = users.filter(matches({ roles: ['user', 'moderator'] }));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Bob Johnson');
  });

  test('should match _eq with arrays (strict equality)', () => {
    const result = users.filter(matches({ roles: { _eq: ['admin', 'user'] } }));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('John Doe');
  });

  test('should match _ne with arrays (not equal)', () => {
    const result = users.filter(matches({ roles: { _ne: ['user'] } }));
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.name).sort()).toEqual(['Bob Johnson', 'John Doe']);
  });

  test('should match _in (array contains any of these values)', () => {
    const result = users.filter(matches({ roles: { _in: ['admin', 'moderator'] } }));
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.name).sort()).toEqual(['Bob Johnson', 'John Doe']);
  });

  test('should match _nin (array does not contain any of these values)', () => {
    const result = users.filter(matches({ roles: { _nin: ['admin', 'moderator'] } }));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Jane Smith');
  });

  test('should match _size for arrays', () => {
    const result = users.filter(matches({ 'profile.skills': { _size: 3 } }));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Bob Johnson');
  });

  test('should match array length with comparison operators', () => {
    // Test _gte: users with skills length >= 3 (John: 4, Bob: 3)
    const usersWithManySkills = users.filter(matches({ 'profile.skills': { _gte: 3 } }));
    expect(usersWithManySkills).toHaveLength(2);
    expect(usersWithManySkills.map((u) => u.name).sort()).toEqual(['Bob Johnson', 'John Doe']);

    // Test _lt: users with skills length < 3 (Jane: 2)
    const usersWithFewSkills = users.filter(matches({ 'profile.skills': { _lt: 3 } }));
    expect(usersWithFewSkills).toHaveLength(1);
    expect(usersWithFewSkills[0]!.name).toBe('Jane Smith');
  });

  test('should match _elemMatch for arrays of objects', () => {
    const result = [company].filter(
      matches({
        employees: {
          _elemMatch: {
            skills: {
              _elemMatch: {
                // or: `name: 'Python'`
                name: { _icontains: 'not matching skill' },
              },
            },
          },
        },
      }),
    );
    expect(result).toHaveLength(0);

    const matching = [company].filter(
      matches({
        employees: {
          _elemMatch: {
            skills: {
              _elemMatch: {
                // or: `name: 'Python'`
                name: { _icontains: 'pyth' },
              },
            },
          },
        },
      }),
    );
    expect(matching).toHaveLength(1);
    expect(matching[0]!.employees?.sort()?.[0]?.name).toBe('Alice Johnson');
  });
});

describe('Size Operators', () => {
  test('should match string length with _size', () => {
    const result = users.filter(matches({ name: { _size: 8 } }));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('John Doe');
  });

  test('should match array length with _size', () => {
    const result = products.filter(matches({ tags: { _size: 3 } }));
    expect(result).toHaveLength(2);
  });

  test('should match object _size - keys count', () => {
    // John: 3 keys (theme, notifications, language)
    const result3 = (users as UserWithMetadata[]).filter(
      matches({ 'metadata.preferences': { _size: 3 } }),
    );
    expect(result3).toHaveLength(1);
    expect(result3[0]!.name).toBe('John Doe');

    // Jane: 1 key (theme)
    const result1 = matches<UserWithMetadata>(
      { metadata: { _size: 1 } },
      users as UserWithMetadata[],
    );
    expect(result1).toBe(true);

    // Jane: 1 key (theme)
    const result2 = (users as UserWithMetadata[]).filter(
      matches({ 'metadata.preferences': { _size: 1 } }),
    );
    expect(result2).toHaveLength(1);
    expect(result2[0]!.name).toBe('Jane Smith');
  });
});

describe('Nested Path Access', () => {
  test('should match nested object properties', () => {
    const result = users.filter(matches({ 'profile.location.city': 'New York' }));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('John Doe');
  });
  test('should type error if nested properties not exist', () => {
    // @ts-expect-error it is expected to type-error
    const result = users.filter(matches({ 'profile.location.y': 'New York' }));
    expect(result).toHaveLength(0);
  });

  test('should match deeply nested properties with operators', () => {
    const result = users.filter(matches({ 'profile.bio': { _icontains: 'senior' } }));
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.name).sort()).toEqual(['Jane Smith', 'John Doe']);
  });

  test('should match array indices', () => {
    const result = users.filter(matches({ 'roles.0': 'admin' }));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('John Doe');
  });

  test('should match nested array properties', () => {
    const result = users.filter(matches({ 'profile.skills.0': 'JavaScript' }));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('John Doe');

    const result2 = users.filter(matches({ 'profile.skills.0': { _icontains: 'vascript' } }));
    expect(result2).toHaveLength(1);
    expect(result2[0]!.name).toBe('John Doe');
  });
});

describe('MongoDB-style Nested Array Traversal', () => {
  // TODO: make mongoPath's respect values like the `matches` does, meaning..
  // that currently it is `Record<string, any>` it could continue to be allowing basic `string`s,
  // but the types of values to be as they are in the `matches` function.
  //
  // Or to rephrase it in short: make it like `matches` but in dot-notation allow unknown properties,
  // for the rest of the cases do not, just like in `matches`
  test('should traverse nested arrays automatically (employees.skills.name)', () => {
    // Test traversing through company -> employees -> skills -> name
    const result = [company].filter(matches(mongoPath({ 'employees.skills.name': 'Python' })));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Tech Corp');
  });

  test('should support mixed exact indices and array traversal (employees.skills.1)', () => {
    // Test getting the second skill from each employee's skills array
    // Alice's skills[1] is Python, Bob's skills[1] is Django
    const result = [company].filter(
      matches(mongoPath({ 'employees.skills.1': { name: 'Python' } })),
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Tech Corp');
  });

  test('should support exact indices at multiple levels (employees.1.skills.0)', () => {
    // Test getting second employee's first skill
    const result = [company].filter(matches(mongoPath({ 'employees.1.skills.0.name': 'Python' })));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Tech Corp');
  });

  test('should handle string operators on nested array values', () => {
    // Test case-insensitive contains on nested array traversal
    const result = [company].filter(
      matches(mongoPath({ 'employees.skills.name': { _icontains: 'PYTHON' } })),
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Tech Corp');
  });

  test('should handle array operators on flattened nested arrays', () => {
    // Test _in operator on flattened skill names
    const result = [company].filter(
      matches(mongoPath({ 'employees.skills.name': { _in: ['TypeScript', 'Vue'] } })),
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Tech Corp');
  });

  test('should return empty for non-existent nested paths', () => {
    const result = [company].filter(matches(mongoPath({ 'employees.nonexistent.field': 'value' })));
    expect(result).toHaveLength(0);
  });

  test('should handle deep nesting with departments and teams', () => {
    // Create test data with deeper nesting
    const complexCompany = {
      name: 'Complex Corp',
      departments: [
        {
          name: 'Engineering',
          teams: [
            {
              name: 'Frontend',
              members: [
                { name: 'Alice', skills: ['React', 'TypeScript'] },
                { name: 'Bob', skills: ['Vue', 'JavaScript'] },
              ],
            },
            {
              name: 'Backend',
              members: [
                { name: 'Charlie', skills: ['Node.js', 'Python'] },
                { name: 'David', skills: ['Go', 'Rust'] },
              ],
            },
          ],
        },
      ],
    };

    // Test traversing through departments -> teams -> members -> skills
    const result = [complexCompany].filter(
      matches(mongoPath({ 'departments.teams.members.skills': 'Python' })),
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Complex Corp');

    // Test with exact indices mixed with traversal
    const result2 = [complexCompany].filter(
      matches(mongoPath({ 'departments.0.teams.1.members.skills': 'Python' })),
    );
    expect(result2).toHaveLength(1);
    expect(result2[0]!.name).toBe('Complex Corp');
  });

  test('should handle array indices that are out of bounds', () => {
    const result = [company].filter(matches({ 'employees.999.name': 'NonExistent' }));
    expect(result).toHaveLength(0);
  });

  test('should handle mixed primitive and object arrays', () => {
    const testData1 = {
      items: ['simple string', { nested: { value: 42 } }, { nested: { value: 100 } }],
    };
    const testData2 = {
      items: ['bruh', { nested: { value: 44 } }, 'hello'],
    };

    // This should match the nested objects, not the string
    // Should find the object with nested.value = 100 (which is > 50)
    const result = [testData1].filter(matches(mongoPath({ 'items.nested.value': { _gt: 50 } })));
    expect(result).toHaveLength(1);

    // Also test that we can find values <= 50
    const result2 = [testData1, testData2].filter(
      matches(mongoPath({ 'items.nested.value': { _lte: 50 } })),
    );
    expect(result2).toHaveLength(2);

    expect(result2[0]?.items[0]).toStrictEqual('simple string');
    expect(result2[1]?.items[2]).toStrictEqual('hello');

    // Test _exists behavior: when we query 'items.nested.value', we get a flattened array [42, 100]
    // _exists: true checks if this flattened result exists (non-empty), so it matches the parent object
    // This is why we expect 1 result (the testData object) not 2 (the individual nested objects)
    const result3 = [testData1].filter(
      matches(mongoPath({ 'items.nested.value': { _exists: true } })),
    );
    expect(result3).toHaveLength(1);
  });
});

describe('Filter vs Direct Matches Usage', () => {
  test('should demonstrate difference between filter and direct matches', () => {
    // Using .filter(matches(...)) - returns filtered array
    const filteredResult = [company].filter(matches({ name: 'Tech Corp' }));
    expect(filteredResult).toHaveLength(1);
    expect(filteredResult[0]!.name).toBe('Tech Corp');

    // Using matches(..., array) - returns boolean
    const booleanResult = matches({ name: 'Tech Corp' }, [company]);
    expect(booleanResult).toBe(true);

    // Non-matching case
    const noMatch = matches({ name: 'Other Corp' }, [company]);
    expect(noMatch).toBe(false);

    // With curried function
    const matcher = matches({ name: 'Tech Corp' });
    const curriedResult = matcher(company);
    expect(curriedResult).toBe(true);
  });
});

describe('Existence Operators', () => {
  test('should match _exists: true', () => {
    const result = users.filter(matches(mongoPath({ 'metadata.lastLogin': { _exists: true } })));
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.name).sort()).toEqual(['Bob Johnson', 'John Doe']);
  });

  test('should match _exists: false', () => {
    const result = users.filter(matches(mongoPath({ 'metadata.lastLogin': { _exists: false } })));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Jane Smith');
  });
});

describe('Logical Operators', () => {
  test('should match _and conditions', () => {
    const result = users.filter(
      matches({
        _and: [{ age: { _gte: 25 } }, { isActive: true }],
      }),
    );
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.name).sort()).toEqual(['Bob Johnson', 'John Doe']);
  });

  test('should match _or conditions', () => {
    const result = users.filter(
      matches({
        _or: [{ age: { _lt: 30 } }, { 'profile.location.city': 'London' }],
      }),
    );
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.name).sort()).toEqual(['Bob Johnson', 'Jane Smith']);
  });

  test('should match _not conditions', () => {
    const result = users.filter(
      matches({
        _not: { age: { _lt: 30 } },
      }),
    );
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.name).sort()).toEqual(['Bob Johnson', 'John Doe']);
  });

  test('should handle complex nested logical operators', () => {
    const result = users.filter(
      matches({
        _and: [
          {
            _or: [{ age: { _gte: 30 } }, { roles: 'admin' }],
          },
          { isActive: true },
        ],
      }),
    );
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.name).sort()).toEqual(['Bob Johnson', 'John Doe']);
  });
});

describe('Date Operations', () => {
  test('should handle Date comparisons', () => {
    const testDate = new Date('2025-01-10');
    const result = products.filter(matches({ createdAt: { _lt: testDate } }));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Laptop Pro');
  });

  test('should handle Date equality', () => {
    const exactDate = new Date('2025-01-01');
    const result = products.filter(matches({ createdAt: { _eq: exactDate } }));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Laptop Pro');
  });

  test('should handle Date ranges', () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-01-31');
    const result = products.filter(
      matches({
        createdAt: { _gte: startDate, _lte: endDate },
      }),
    );
    expect(result).toHaveLength(2);
  });
});

describe('Currying Support', () => {
  test('should support curried function calls', () => {
    const activeUsersFilter = matches({ isActive: true });
    const result = users.filter(activeUsersFilter);
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.name).sort()).toEqual(['Bob Johnson', 'John Doe']);
  });

  test('should work with complex curried filters', () => {
    const complexFilter = matches({
      _and: [{ age: { _gte: 25 } }, { roles: { _in: ['admin', 'user'] } }],
    });
    const result = users.filter(complexFilter);
    expect(result).toHaveLength(3);
  });
});

describe('Edge Cases and Error Handling', () => {
  test('should handle null/undefined values gracefully', () => {
    const testData = [
      { id: 1, name: 'Test1', value: null },
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
    // @ts-expect-error it is expected to type-error
    const result = users.filter(matches({ 'nonexistent.path': 'value' }));
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
      // @ts-expect-error bruh, it's expected to type-error
      matches({ bruh: 'invalid' }, users[0] as User);
    }).toThrow('_not needs a regex or a document');
  });
});

describe('Type Safety and Complex Nested Structures', () => {
  test('should provide type inference for complex nested paths', () => {
    // This test verifies TypeScript compilation works correctly
    const filter = matches(
      mongoPath({
        'headquarters.city': 'San Francisco',
        'headquarters.state': { _eq: 'CA' },
        'metadata.industry': { _contains: 'Tech' },
        'metadata.revenue': { _gt: 1000000 },
        'metadata.public': true,
      }),
    );

    const result = [company].filter(filter);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Tech Corp');
  });

  test('should handle deep nested array element access', () => {
    // the actual selection => {
    //   id: 2,
    //   name: 'Bob Smith',
    //   email: 'bob@techcorp.com',
    //   salary: 95000,
    //   department: 'Engineering',
    //   skills: [
    //     { name: 'Python', level: 'advanced', years: 4 },
    //     { name: 'Django', level: 'intermediate', years: 3 },
    //   ],
    //   address: {
    //     street: '456 Oak Ave',
    //     city: 'Seattle',
    //     state: 'WA',
    //     country: 'USA',
    //     zipCode: '98101',
    //   },
    //   directReports: [],
    // },
    const filter = matches<Company>({
      'employees.1.name': 'Bob Smith',
      'employees.1.address.city': 'Seattle',
      'employees.1.skills.0.name': 'Python',
      'employees.1.skills.1.name': 'Django',
      'employees.1.skills.1.level': 'intermediate',
    });

    const result = [company].filter(filter);
    expect(result).toHaveLength(1);
  });

  test('should support complex nested _elemMatch operations', () => {
    const filter = matches<Employee>({
      skills: {
        _elemMatch: {
          name: 'React',
          level: { _in: ['advanced', 'expert'] },
          years: { _gte: 5 },
        },
      },
    });

    const result = company.employees.filter(filter);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Alice Johnson');
  });

  test('should handle optional properties with _exists', () => {
    const filter = matches(
      mongoPath({
        'metadata.revenue': { _exists: true },
      }),
    );

    const result = [company].filter(filter);
    expect(result).toHaveLength(1);
  });
});

describe('Custom Extractor Function', () => {
  test('should work with custom extractor for case-insensitive matching', () => {
    // Helper function for custom extractors
    function cutomGetAttr(obj: any, key: string): any {
      if (!key) {
        return obj;
      }

      const parts = key.split('.');
      let current = obj;

      for (const part of parts) {
        if (current === null || current === undefined) {
          return undefined;
        }

        if (Array.isArray(current) && /^\d+$/.test(part)) {
          current = current[parseInt(part, 10)];
        } else if (typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return undefined;
        }
      }

      return current;
    }

    const caseInsensitiveExtractor = (obj: any, key: string) => {
      const value = cutomGetAttr(obj, key);

      return typeof value === 'string' ? value.toLowerCase() : value;
    };

    const result = [company].filter((item) =>
      matches(
        { name: 'tech corp' }, // lowercase search
        item,
        caseInsensitiveExtractor,
      ),
    );

    expect(result).toHaveLength(1);
  });
});

describe('Performance and Large Dataset Testing', () => {
  test('should work with large datasets and proper array filtering', () => {
    // Create a larger dataset for comprehensive array testing
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      age: 20 + (i % 50),
      isActive: i % 2 === 0,
      roles:
        i % 10 === 0 ? ['admin'] : i % 5 === 0 ? ['mod'] : i % 2 === 0 ? ['user'] : ['user', 'mod'],
      profile: {
        bio: `Bio for user ${i}`,
        skills: ['JavaScript', 'TypeScript'].slice(0, (i % 2) + 1),
        location: {
          city: ['New York', 'San Francisco', 'London'][i % 3],
          country: 'Test Country',
        },
      },
    }));

    // Test all array matching behaviors
    const adminsOnly = largeDataset.filter(matches({ roles: { _eq: ['admin'] } }));
    const usersOrModsOrUserAndMods = largeDataset.filter(
      matches({ roles: { _in: ['user', 'mod'] } }),
    );
    const usersOnly = largeDataset.filter(matches({ roles: ['user'] }));
    const hasUserRoleWithImplicitContains = largeDataset.filter(matches({ roles: 'user' }));
    const modsOnly = largeDataset.filter(matches({ roles: { _eq: ['mod'] } }));
    const usersAndModsExplicit = largeDataset.filter(matches({ roles: ['user', 'mod'] }));

    // Verify correct counts based on data distribution
    expect(adminsOnly.length).toBe(100); // i % 10 === 0
    expect(usersOrModsOrUserAndMods.length).toBe(900); // all except admin
    expect(usersOnly.length).toBe(400); // i % 2 === 0 but not % 5
    expect(hasUserRoleWithImplicitContains.length).toBe(800); // usersOnly + usersAndMods
    expect(modsOnly.length).toBe(100); // i % 5 === 0 but not % 10
    expect(usersAndModsExplicit.length).toBe(400); // else case (odd, not % 5)
  });

  test('should handle complex multi-level queries', () => {
    const startTime = performance.now();

    const result = users.filter(
      matches({
        _and: [
          {
            _or: [
              { 'profile.skills': { _in: ['JavaScript', 'TypeScript'] } },
              { 'profile.bio': { _regex: 'developer|engineer' } },
            ],
          },
          {
            _not: { age: { _lt: 30 } },
          },
          { isActive: false },
        ],
      }),
    );

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    expect(result).toHaveLength(0); // because `age` is 25, we look for above 30 (the _not _lt: 30)
    expect(executionTime).toBeLessThan(10); // Should execute quickly

    const result2 = users.filter(
      matches({
        _and: [
          {
            _or: [
              { 'profile.skills': { _in: ['JavaScript', 'TypeScript'] } },
              { 'profile.bio': { _regex: 'developer|engineer' } },
            ],
          },
          {
            _not: { age: { _lt: 20 } },
          },
          { isActive: false },
        ],
      }),
    );

    expect(result2).toHaveLength(1); // matches only one (jane)
    expect(result2.map((u) => u.name).sort()).toEqual(['Jane Smith']);

    const result3 = users.filter(
      matches({
        _and: [
          {
            _or: [
              { 'profile.skills': { _in: ['JavaScript', 'TypeScript'] } },
              { 'profile.bio': { _regex: 'developer|engineer' } },
            ],
          },
          {
            _not: { age: { _lt: 20 } },
          },
          { isActive: true },
        ],
      }),
    );

    expect(result3).toHaveLength(2); // matches two (bob and john, cuz their `isActive` is true)
    expect(result3.map((u) => u.name).sort()).toEqual(['Bob Johnson', 'John Doe']);
  });
});
