# mongo-like-filters Test Suite

This directory contains comprehensive tests for the mongo-like-filters library using Bun's built-in test runner.

## Test Files

### `basic.test.ts`
Core functionality tests covering:
- **Basic equality matching** - String, number, and boolean exact matches
- **Comparison operators** - `_gt`, `_gte`, `_lt`, `_lte`, `_ne`
- **String operators** - `_contains`, `_startsWith`, `_endsWith`, case-insensitive variants, regex
- **Array operations** - `_in`, `_nin`, direct array contains, `_elemMatch`, `_size`
- **Nested path access** - Dot notation paths like `'profile.bio'`, `'profile.location.city'`
- **Existence checks** - `_exists` for optional properties
- **Logical operators** - `_and`, `_or`, `_not` with complex nesting
- **Size operations** - String, array, and object size matching
- **Currying support** - Function composition and reusable filters
- **Edge cases** - Error handling, null/undefined values, empty arrays
- **Type inference** - TypeScript compilation validation
- **Performance** - Large dataset handling

### `examples.test.ts`
Validation tests that ensure all examples from the documentation work correctly:
- Mirrors the examples from `example.ts`
- Tests real-world usage patterns
- Validates date operations
- Complex data structure handling
- Custom extractor functions
- Error handling scenarios

### `types.test.ts`
Advanced type safety and TypeScript features:
- **Deep nested path inference** - Complex object structures
- **Date handling** - Date comparisons and ranges
- **Union types** - Enum-like string unions in `_elemMatch`
- **Optional properties** - Proper handling of optional fields
- **Complex `_elemMatch`** - Nested array operations with logical operators
- **Performance with complex types** - Large nested objects
- **Edge cases** - Circular reference prevention, mixed data types
- **Custom extractors** - Case-insensitive matching, transformations
- **Type constraints** - Generic type validation

## Running Tests

```bash
# Run all tests
bun test mongo-like-filters/test/

# Run specific test file
bun test mongo-like-filters/test/basic.test.ts

# Run with watch mode
bun test --watch mongo-like-filters/test/

# Run specific test pattern
bun test --test-name-pattern "String operators"
```

## Test Data

Each test file uses realistic data structures:
- **User interface** - Standard user profile with nested objects and arrays
- **Company interface** - Complex nested business data
- **Product interface** - E-commerce style data
- **Employee/Department** - Enterprise organizational data

## Type Safety

All tests are written in TypeScript and validate:
- ✅ **Compile-time type checking** - No TypeScript errors
- ✅ **Autocomplete support** - IntelliSense works correctly
- ✅ **Type inference** - Proper operator suggestions based on field types
- ✅ **Deep nesting** - Multi-level object path support
- ✅ **Array operations** - Element matching and array-specific operators

## Coverage

The test suite covers:
- **120 test cases** across 3 files
- **All operators** - String, number, boolean, array, object, logical
- **All data types** - Primitives, objects, arrays, dates, optional fields
- **Error conditions** - Invalid usage, edge cases, null handling
- **Performance** - Large datasets, complex queries
- **Real-world scenarios** - Practical filtering use cases

## Performance Benchmarks

Tests include performance validations:
- Complex multi-level queries execute in <10ms
- Large datasets (1000+ items) filter in <100ms
- Type compilation completes without excessive depth errors

## Notes

- Some `_size` operations on top-level arrays may have implementation quirks
- The `_includes` operator currently behaves the same as `_contains`
- Date equality requires exact timestamp matching
- Array index access supports dot notation like `'array.0'`, `'array.1'`

## Contributing

When adding new tests:
1. Add to the appropriate test file based on functionality
2. Include both positive and negative test cases
3. Test TypeScript compilation with `npx tsc --noEmit`
4. Ensure performance tests remain under timing thresholds
5. Document any known limitations or quirks
