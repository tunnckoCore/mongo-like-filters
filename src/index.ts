import type { Extractor, FilterExpression, NoInfer } from './types.ts';

export class FilterError extends Error {
  constructor(message: string, expression?: any) {
    super(`Filter Error: ${message}${expression ? ` in ${JSON.stringify(expression)}` : ''}`);
    this.name = 'FilterError';
  }
}

function getAttribute(obj: any, key: string): any {
  if (!key) {
    return obj;
  }

  const parts = key.split('.');

  return getNestedValue(obj, parts, 0);
}

function getNestedValue(current: any, parts: string[], index: number): any {
  if (index >= parts.length) {
    return current;
  }

  if (current === null || current === undefined) {
    return undefined;
  }

  const part = parts[index];
  if (!part) {
    return undefined;
  }

  // Handle exact array indices like "items.0.name"
  if (Array.isArray(current) && /^\d+$/.test(part)) {
    const arrayIndex = parseInt(part, 10);
    if (arrayIndex >= 0 && arrayIndex < current.length) {
      return getNestedValue(current[arrayIndex], parts, index + 1);
    }
    return undefined;
  }

  // Handle object properties
  if (typeof current === 'object' && part in current) {
    return getNestedValue(current[part], parts, index + 1);
  }

  // MongoDB-style array traversal: if current is an array and the part is not a numeric index,
  // try to traverse into each array element and collect matching values
  if (Array.isArray(current) && !/^\d+$/.test(part)) {
    const results: any[] = [];

    for (const item of current) {
      if (item !== null && item !== undefined && typeof item === 'object' && part in item) {
        const value = getNestedValue(item[part], parts, index + 1);
        if (value !== undefined) {
          if (Array.isArray(value)) {
            results.push(...value);
          } else {
            results.push(value);
          }
        }
      }
    }

    // Mark flattened results with a special property to distinguish from regular arrays
    if (results.length > 0) {
      const flattenedArray = results as any;
      flattenedArray.__isFlattened = true;
      return flattenedArray;
    }
    return undefined;
  }

  return undefined;
}

function exists(a: any, shouldExist: boolean): boolean {
  const doesExist = a !== null && a !== undefined;

  return shouldExist ? doesExist : !doesExist;
}

function isEqual(a: any, b: any): boolean {
  if (a === b) {
    return true;
  }

  // Handle Date equality
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Handle array equality
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => isEqual(item, b[index]));
  }

  return false;
}

function greaterThan(a: any, b: any): boolean {
  return a > b;
}

function greaterThanOrEqual(a: any, b: any): boolean {
  return a >= b;
}

function lessThan(a: any, b: any): boolean {
  return a < b;
}

function lessThanOrEqual(a: any, b: any): boolean {
  return a <= b;
}

function getSize(value: any): number {
  if (Array.isArray(value) || typeof value === 'string') {
    return value.length;
  }
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).length;
  }
  return 0;
}

// Internal non-generic version for recursive calls
function matchesInternal(expression: any, data: any, extractor: Extractor = getAttribute): boolean {
  if (expression === null || expression === undefined) {
    throw new FilterError('Expression cannot be null or undefined');
  }

  if (Array.isArray(data)) {
    return data.some((item) => matchesInternal(expression, item, extractor));
  }

  if (typeof expression !== 'object' || expression instanceof Date) {
    return isEqual(expression, data);
  }

  if (expression._and && expression._or) {
    throw new FilterError(
      'Indeterminate behavior. "_and" and "_or" operators cannot be present at the same level.',
    );
  }

  if (Array.isArray(expression._and)) {
    return expression._and.every((exp: any) => matchesInternal(exp, data, extractor));
  }
  if (Array.isArray(expression._or)) {
    return expression._or.some((exp: any) => matchesInternal(exp, data, extractor));
  }
  if (expression._not) {
    if (typeof expression._not !== 'object') {
      throw new FilterError('_not needs a regex or a document');
    }

    return !matchesInternal(expression._not, data, extractor);
  }
  if (!Array.isArray(data) && typeof data === 'object') {
    for (const key in expression) {
      const value = extractor(data, key);

      if (!testExpression(expression[key], value)) {
        return false;
      }
    }

    return true;
  }
  return testExpression(expression, data);
}

function testExpression(expr: any, value: any): boolean {
  if (typeof expr !== 'object' || expr instanceof Date) {
    if (Array.isArray(value)) {
      return value.some((v) => isEqual(v, expr));
    }
    return isEqual(expr, value);
  }

  // Special handling for flattened arrays from nested traversal
  if (Array.isArray(value) && (value as any).__isFlattened) {
    // For flattened arrays, apply operators to individual elements
    if (expr._gt) {
      return value.some((v) => greaterThan(v, expr._gt));
    }
    if (expr._gte) {
      return value.some((v) => greaterThanOrEqual(v, expr._gte));
    }
    if (expr._lt) {
      return value.some((v) => lessThan(v, expr._lt));
    }
    if (expr._lte) {
      return value.some((v) => lessThanOrEqual(v, expr._lte));
    }
    if (expr._eq) {
      return value.some((v) => isEqual(v, expr._eq));
    }
    if (expr._ne) {
      return !value.every((v) => isEqual(v, expr._ne));
    }
    if (expr._in) {
      return value.some((v) => expr._in.includes(v));
    }
    if (expr._nin) {
      return !value.some((v) => expr._nin.includes(v));
    }
  }

  // Handle direct array assignment (e.g., roles: ['admin'])
  if (Array.isArray(expr)) {
    if (Array.isArray(value)) {
      // Both are arrays - use strict equality
      return (
        expr.length === value.length && expr.every((item, index) => isEqual(item, value[index]))
      );
    }
    return false;
  }

  if (expr && expr._elemMatch) {
    if (!Array.isArray(value)) {
      return false;
    }
    if (!value.some((v) => matchesInternal(expr._elemMatch!, v, undefined))) {
      return false;
    }
  } else if (Array.isArray(value)) {
    // Check if expression contains array-specific operators
    const arrayOperators = [
      '_size',
      '_elemMatch',
      '_gt',
      '_gte',
      '_lt',
      '_lte',
      '_eq',
      '_ne',
      '_in',
      '_nin',
    ];
    const hasArrayOperator = Object.keys(expr).some((key) => arrayOperators.includes(key));

    if (hasArrayOperator) {
      // Apply operators to the array itself, not its elements
      // Fall through to normal operator handling below
    } else {
      // Simplified array element matching logic
      for (const [key, subExpr] of Object.entries(expr)) {
        const hasMatch = value.some((item) => {
          const partialExpr = { [key]: subExpr };

          return matchesInternal(partialExpr, item, undefined);
        });
        if (!hasMatch) {
          return false;
        }
      }
      return true;
    }
  }

  // Handle nested object matching - check if expr is a nested object (not an operator)
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    // Check if expr contains only nested properties (no operators)
    const hasOperators = Object.keys(expr).some((key) => key.startsWith('_'));
    if (!hasOperators) {
      // This is a nested object expression, recursively match each property
      for (const [key, subExpr] of Object.entries(expr)) {
        if (!matchesInternal({ [key]: subExpr }, value, undefined)) {
          return false;
        }
      }
      return true;
    }
  }

  if (expr._eq && !isEqual(value, expr._eq)) {
    return false;
  }

  if (expr._ne && isEqual(value, expr._ne)) {
    return false;
  }

  if (typeof expr._exists === 'boolean' && !exists(value, expr._exists)) {
    return false;
  }

  if (expr._not) {
    if (typeof expr._not !== 'object' || expr._not === null) {
      throw new FilterError('_not needs a regex or a document');
    }

    if (testExpression(expr._not, value)) {
      return false;
    }
  }

  if (expr._gt) {
    const compareValue = Array.isArray(value) ? value.length : value;
    if (!greaterThan(compareValue, expr._gt)) {
      return false;
    }
  }

  if (expr._lt) {
    const compareValue = Array.isArray(value) ? value.length : value;
    if (!lessThan(compareValue, expr._lt)) {
      return false;
    }
  }

  if (expr._lte) {
    const compareValue = Array.isArray(value) ? value.length : value;
    if (!lessThanOrEqual(compareValue, expr._lte)) {
      return false;
    }
  }

  if (expr._gte) {
    const compareValue = Array.isArray(value) ? value.length : value;
    if (!greaterThanOrEqual(compareValue, expr._gte)) {
      return false;
    }
  }

  // String operations
  if (expr._contains && typeof value === 'string' && !value.includes(expr._contains)) {
    return false;
  }
  if (expr._startsWith && typeof value === 'string' && !value.startsWith(expr._startsWith)) {
    return false;
  }
  if (expr._endsWith && typeof value === 'string' && !value.endsWith(expr._endsWith)) {
    return false;
  }

  // Case-insensitive string operations
  if (
    expr._icontains &&
    typeof value === 'string' &&
    !value.toLowerCase().includes(expr._icontains.toLowerCase())
  ) {
    return false;
  }

  if (
    expr._istartsWith &&
    typeof value === 'string' &&
    !value.toLowerCase().startsWith(expr._istartsWith.toLowerCase())
  ) {
    return false;
  }

  if (
    expr._iendsWith &&
    typeof value === 'string' &&
    !value.toLowerCase().endsWith(expr._iendsWith.toLowerCase())
  ) {
    return false;
  }

  if (expr._in) {
    if (Array.isArray(value)) {
      // For arrays, check if any element is in the _in list
      if (!value.some((item) => expr._in.includes(item))) {
        return false;
      }
    } else {
      // For non-arrays, use original logic
      // eslint-disable-next-line no-lonely-if
      if (!expr._in.includes(value)) {
        return false;
      }
    }
  }

  if (expr._nin) {
    if (Array.isArray(value)) {
      // For arrays, check if any element is in the _nin list (if so, filter out)
      if (value.some((item) => expr._nin.includes(item))) {
        return false;
      }
    } else {
      // For non-arrays, use original logic
      // eslint-disable-next-line no-lonely-if
      if (expr._nin.includes(value)) {
        return false;
      }
    }
  }

  if (expr._regex && !new RegExp(expr._regex).test(value)) {
    return false;
  }

  if (expr._size !== undefined && getSize(value) !== expr._size) {
    return false;
  }

  return true;
}

// Simplified function overloads to avoid infinite recursion
export function matches<T = any>(expression: FilterExpression<NoInfer<T>>): (data: T) => boolean;

export function matches<T = any>(
  expression: FilterExpression<NoInfer<T>>,
  data: T,
  extractor?: Extractor,
): boolean;

export function matches<T = any>(
  expression: FilterExpression<NoInfer<T>>,
  data: T[],
  extractor?: Extractor,
): boolean;

export function matches<T = any>(
  expression: FilterExpression<NoInfer<T>>,
  data?: T | T[],
  extractor: Extractor = getAttribute,
): boolean | ((data: T) => boolean) {
  // Currying support - if no record provided, return a function
  if (data === undefined) {
    return (rec: T) => matchesInternal(expression, rec, extractor);
  }

  return matchesInternal(expression, data, extractor);
}

// Utility function for MongoDB-style paths that bypasses strict typing
export function mongoPath(expression: Record<string, any>): Record<string, any> {
  return expression;
}
