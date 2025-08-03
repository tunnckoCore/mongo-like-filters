import { matches } from './index.ts';

interface User {
  name: string;
  email: string;
  age: number;
  profile: {
    bio: string;
    skills: string[];
    location: {
      city: string;
      country: string;
    };
  };
}

const user: User = {
  name: 'John',
  email: 'john@example.com',
  age: 30,
  profile: {
    bio: 'Developer',
    skills: ['TypeScript', 'React'],
    location: {
      city: 'New York',
      country: 'USA',
    },
  },
};

// Test basic property matching
const test1 = matches<User>({ email: 'john@example.com' });

// Test string operators - this should work but currently fails
const test2 = matches<User>({ email: { _contains: 'example' } });

// Test unknown property - this should error
// const test3 = matches<User>({ unknownProp: 'value' });

// Test unknown operator - this should error
// const test4 = matches<User>({ email: { _unknownOp: 'value' } });

// Test nested object
const test5 = matches<User>({ profile: { location: { city: 'New York' } } });

// Test nested object with operators
const test6 = matches<User>({ profile: { location: { city: { _contains: 'York' } } } });
