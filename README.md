# mongo-like-filters

A lightweight, type-safe JavaScript/TypeScript library for filtering objects using MongoDB-style query syntax. Perfect for client-side filtering, in-memory data processing, and anywhere you need powerful object querying without a database.

## ✨ Features

- 🎯 **MongoDB-style syntax** - Familiar query operators like `_eq`, `_gt`, `_in`, `_regex`, etc.
- 🔍 **Deep object traversal** - Query nested properties with dot notation (`profile.location.city`)
- 📋 **Array support** - Filter arrays with `_elemMatch` and direct index access (`items.0.name`)
- 🔤 **String operations** - Case-sensitive and case-insensitive string matching
- 📏 **Size operations** - Check array/string/object sizes
- 🎛️ **Logical operators** - Complex queries with `_and`, `_or`, `_not`
- 📅 **Date support** - Native Date object comparisons
- 🛡️ **Type-safe** - Full TypeScript support with proper type definitions
- 🚀 **Zero dependencies** - Lightweight and fast
- 🔧 **Extensible** - Custom field extractors for advanced use cases

## 📦 Installation

```bash
npm install mongo-like-filters
```

## 🚀 Quick Start

```typescript
import { matches } from "mongo-like-filters";

const users = [
  { name: "John", age: 30, roles: ["admin"] },
  { name: "Jane", age: 25, roles: ["user"] },
  { name: "Bob", age: 35, roles: ["user", "moderator"] },
];

// Simple equality
const johns = users.filter((user) => matches({ name: "John" }, user));

// Comparison operators
const adults = users.filter((user) => matches({ age: { _gte: 30 } }, user));

// Array operations
const admins = users.filter((user) => matches({ roles: "admin" }, user));

// Complex queries
const seniorUsers = users.filter((user) =>
  matches(
    {
      _and: [{ age: { _gt: 25 } }, { roles: { _in: ["user", "moderator"] } }],
    },
    user,
  ),
);
```

## 📖 API Reference

### matches(expression, record, extractor?)

Main function to test if a record matches the given filter expression.

**Parameters:**

- `expression`: Filter expression object
- `record`: Object to test against
- `extractor?`: Optional custom field extractor function

**Returns:** `boolean`

### FilterExpression

TypeScript interface defining all available operators:

```typescript
interface FilterExpression {
  // Comparison operators
  _eq?: any; // Equal to
  _ne?: any; // Not equal to
  _gt?: any; // Greater than
  _gte?: any; // Greater than or equal
  _lt?: any; // Less than
  _lte?: any; // Less than or equal

  // Array operators
  _in?: any[]; // Value in array
  _nin?: any[]; // Value not in array
  _size?: number; // Array/string/object size

  // String operators
  _contains?: string; // Contains substring
  _includes?: string; // Contains substring (alias)
  _startsWith?: string; // Starts with string
  _endsWith?: string; // Ends with string
  _icontains?: string; // Case-insensitive contains
  _istartsWith?: string; // Case-insensitive starts with
  _iendsWith?: string; // Case-insensitive ends with
  _regex?: string; // Regular expression match

  // Logical operators
  _and?: FilterExpression[]; // Logical AND
  _or?: FilterExpression[]; // Logical OR
  _not?: FilterExpression; // Logical NOT

  // Existence and special operators
  _exists?: boolean; // Field exists/doesn't exist
  _elemMatch?: FilterExpression; // Array element matching

  // Dynamic properties
  [key: string]: any;
}
```

## 🎯 Operator Examples

### Comparison Operators

```typescript
// Equal to
matches({ age: 30 }, user);
matches({ age: { _eq: 30 } }, user);

// Comparisons
matches({ age: { _gt: 25 } }, user); // Greater than
matches({ age: { _gte: 30 } }, user); // Greater than or equal
matches({ age: { _lt: 40 } }, user); // Less than
matches({ age: { _lte: 35 } }, user); // Less than or equal
matches({ name: { _ne: "John" } }, user); // Not equal
```

### String Operators

```typescript
// Case-sensitive
matches({ email: { _contains: "gmail" } }, user);
matches({ email: { _includes: "gmail" } }, user); // Alias for _contains
matches({ name: { _startsWith: "J" } }, user);
matches({ name: { _endsWith: "son" } }, user);

// Case-insensitive
matches({ email: { _icontains: "GMAIL" } }, user);
matches({ name: { _istartsWith: "j" } }, user);
matches({ name: { _iendsWith: "SON" } }, user);

// Regular expressions
matches({ email: { _regex: "^[a-z]+@gmail\\.com$" } }, user);
```

### Array Operators

```typescript
// Value in/not in array
matches({ status: { _in: ["active", "pending"] } }, user);
matches({ status: { _nin: ["deleted", "banned"] } }, user);

// Array contains value
matches({ roles: "admin" }, user);

// Array size
matches({ roles: { _size: 2 } }, user);
matches({ skills: { _size: { _gt: 3 } } }, user);

// Element matching
matches(
  {
    projects: { _elemMatch: { status: "active" } },
  },
  user,
);
```

### Nested Objects & Dot Notation

```typescript
// Nested properties
matches({ "profile.location.city": "New York" }, user);
matches({ "settings.theme": "dark" }, user);

// Array index access
matches({ "skills.0": "JavaScript" }, user);
matches({ "projects.1.status": "completed" }, user);
matches({ "history.0.action": "login" }, user);
```

### Logical Operators

```typescript
// AND operation
matches(
  {
    _and: [{ age: { _gte: 25 } }, { status: "active" }],
  },
  user,
);

// OR operation
matches(
  {
    _or: [{ role: "admin" }, { permissions: { _contains: "write" } }],
  },
  user,
);

// NOT operation
matches(
  {
    _not: { status: "deleted" },
  },
  user,
);

// Complex combinations
matches(
  {
    _and: [
      { age: { _gt: 18 } },
      {
        _or: [{ role: "admin" }, { verified: true }],
      },
    ],
  },
  user,
);
```

### Existence Checks

```typescript
// Field exists
matches({ "profile.bio": { _exists: true } }, user);

// Field doesn't exist
matches({ deletedAt: { _exists: false } }, user);
```

### Date Operations

```typescript
const user = {
  createdAt: new Date("2025-01-15"),
  lastLogin: new Date("2025-07-30"),
};

// Date equality
matches({ createdAt: new Date("2025-01-15") }, user);

// Date comparisons
matches({ createdAt: { _gt: new Date("2024-12-01") } }, user);
matches({ lastLogin: { _lt: new Date() } }, user);

// Date ranges
matches(
  {
    _and: [
      { createdAt: { _gte: new Date("2025-01-01") } },
      { createdAt: { _lt: new Date("2026-01-01") } },
    ],
  },
  user,
);
```

## 🔧 Advanced Usage

### Custom Field Extractors

Customize how fields are extracted from objects:

```typescript
// Case-insensitive field extraction
const caseInsensitiveExtractor = (obj: any, key: string) => {
  const value = obj[key];
  return typeof value === "string" ? value.toLowerCase() : value;
};

matches({ name: "john doe" }, user, caseInsensitiveExtractor);

// Custom nested property access
const customExtractor = (obj: any, key: string) => {
  // Your custom logic here
  return obj[key];
};
```

### Multiple Conditions (Implicit AND)

```typescript
// These are equivalent
matches(
  {
    age: { _gte: 25 },
    status: "active",
    role: { _in: ["user", "admin"] },
  },
  user,
);

matches(
  {
    _and: [
      { age: { _gte: 25 } },
      { status: "active" },
      { role: { _in: ["user", "admin"] } },
    ],
  },
  user,
);
```

### Working with Arrays of Objects

```typescript
const data = [
  {
    name: "Project Alpha",
    tasks: [
      { title: "Setup", completed: true },
      { title: "Development", completed: false },
    ],
  },
];

// Find projects with completed tasks
const result = data.filter((project) =>
  matches(
    {
      tasks: { _elemMatch: { completed: true } },
    },
    project,
  ),
);

// Access specific array elements
matches({ "tasks.0.completed": true }, project);
matches({ "tasks.1.title": { _contains: "Dev" } }, project);
```

## 🐛 Error Handling

The library throws `FilterError` for invalid expressions:

```typescript
import { FilterError } from "mongo-like-filters";

try {
  matches({ _and: [], _or: [] }, user); // Invalid: both _and and _or
} catch (error) {
  if (error instanceof FilterError) {
    console.log("Filter error:", error.message);
  }
}
```

## 🚀 Performance Tips

- Use specific comparison operators (`_eq`, `_gt`) rather than regex when possible
- More specific filters are better - they eliminate non-matching records earlier
- For large datasets, structure your `_and` conditions with the most selective filters first
- Use `_exists: false` instead of complex null/undefined checks

## 🙏 Acknowledgments

Inspired by MongoDB's query syntax and designed for JavaScript/TypeScript applications that need powerful client-side filtering capabilities.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MPL-2.0 License - see the [LICENSE](./LICENSE.md) file for details.
