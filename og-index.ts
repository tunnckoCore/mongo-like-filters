/* eslint-disable complexity, max-statements, guard-for-in, style/indent-binary-ops, no-restricted-syntax, max-depth, style/indent, style/quote-props, style/quotes, max-nested-callbacks */

type Primitive = string | number | boolean | Date | null | undefined;

// Helper type to count depth
type Prev = [never, 0, 1, 2, 3, 4, 5, ...0[]];

// Updated dot notation paths for better autocomplete
type DotNotationPaths<T, Depth extends number = 4> = Depth extends 0
  ? never
  : {
      [K in keyof T]: T[K] extends Primitive
        ? K & string
        : T[K] extends any[]
          ? T[K] extends (infer U)[]
            ? U extends Primitive
              ? (K & string) | `${K & string}.${number}`
              :
                  | (K & string)
                  | `${K & string}.${number}`
                  | `${K & string}.${number}.${DotNotationPaths<U, Prev[Depth]>}`
            : (K & string) | `${K & string}.${number}`
          : (K & string) | `${K & string}.${DotNotationPaths<T[K], Prev[Depth]>}`;
    }[keyof T];

// Get the type of value at a specific path with depth limiting
type PathValue<T, P extends string, Depth extends number = 4> = Depth extends 0
  ? any
  : P extends keyof T
    ? T[P]
    : P extends `${infer K}.${infer Rest}`
      ? K extends keyof T
        ? T[K] extends any[]
          ? Rest extends `${number}`
            ? T[K] extends (infer U)[]
              ? U
              : never
            : Rest extends `${number}.${infer Deeper}`
              ? T[K] extends (infer U)[]
                ? PathValue<U, Deeper, Prev[Depth]>
                : never
              : PathValue<T[K], Rest, Prev[Depth]>
          : PathValue<T[K], Rest, Prev[Depth]>
        : never
      : never;

// Operators based on value type
type OperatorsForType<T> = T extends string
  ? StringOperators<T>
  : T extends number
    ? NumberOperators<T>
    : T extends boolean
      ? BooleanOperators<T>
      : T extends Date
        ? DateOperators<T>
        : T extends any[]
          ? ArrayOperators<T>
          : T extends object
            ? ObjectOperators<T>
            : BaseOperators<T>;

interface BaseOperators<T> {
  _eq?: T;
  _ne?: T;
  _exists?: boolean;
  _in?: T[];
  _nin?: T[];
  _not?: OperatorsForType<T>;
}

type StringOperators<T> = BaseOperators<T> & {
  _contains?: string;
  _startsWith?: string;
  _endsWith?: string;
  _icontains?: string;
  _istartsWith?: string;
  _iendsWith?: string;
  _regex?: string;
  _size?: number | OperatorsForType<number>;
};

type NumberOperators<T> = BaseOperators<T> & {
  _gt?: T;
  _gte?: T;
  _lt?: T;
  _lte?: T;
};

type BooleanOperators<T> = BaseOperators<T>;

type DateOperators<T> = BaseOperators<T> & {
  _gt?: T;
  _gte?: T;
  _lt?: T;
  _lte?: T;
};

// Simplified element match type to avoid circular reference issues
type ElementMatchExpression<T> = T extends string
  ? {
      _eq?: string;
      _ne?: string;
      _in?: string[];
      _nin?: string[];
      _contains?: string;
      _startsWith?: string;
      _endsWith?: string;
      _regex?: string;
    }
  : T extends number
    ? {
        _eq?: number;
        _ne?: number;
        _in?: number[];
        _nin?: number[];
        _gt?: number;
        _gte?: number;
        _lt?: number;
        _lte?: number;
      }
    : T extends boolean
      ? { _eq?: boolean; _ne?: boolean; _in?: boolean[]; _nin?: boolean[] }
      : T extends object
        ? {
            _eq?: T;
            _ne?: T;
            _in?: T[];
            _nin?: T[];
          } & {
            [K in keyof T]?: T[K] extends string
              ? string | StringOperators<string>
              : T[K] extends number
                ? number | NumberOperators<number>
                : T[K] extends boolean
                  ? boolean | BooleanOperators<boolean>
                  : T[K] extends any[]
                    ? T[K][number] | T[K] | ArrayOperators<T[K]>
                    : T[K] | BaseOperators<T[K]>;
          }
        : { _eq?: T; _ne?: T; _in?: T[]; _nin?: T[] };

type ArrayOperators<T> = Omit<BaseOperators<T>, '_in' | '_nin'> & {
  _size?: number | OperatorsForType<number>;
  _elemMatch?: T extends (infer U)[] ? ElementMatchExpression<U> : never;
  _gt?: number;
  _gte?: number;
  _lt?: number;
  _lte?: number;
  _in?: T extends (infer U)[] ? U[] : never;
  _nin?: T extends (infer U)[] ? U[] : never;
};

type ObjectOperators<T> = BaseOperators<T> & {
  _size?: number | OperatorsForType<number>;
};

// Helper to prevent wrong type inference
type NoInfer<T> = [T][T extends any ? 0 : never];

// Helper type to determine filter value for a given type
type FilterValueForType<T> =
  | T
  | {
      readonly _eq?: T;
      readonly _ne?: T;
      readonly _exists?: boolean;
      readonly _in?: T[];
      readonly _nin?: T[];
      readonly _not?: OperatorsForType<T>;
    }
  | (T extends string
      ? {
          readonly _contains?: string;
          readonly _startsWith?: string;
          readonly _endsWith?: string;
          readonly _icontains?: string;
          readonly _istartsWith?: string;
          readonly _iendsWith?: string;
          readonly _regex?: string;
          readonly _size?: number;
        }
      : never)
  | (T extends number
      ? {
          readonly _gt?: T;
          readonly _gte?: T;
          readonly _lt?: T;
          readonly _lte?: T;
        }
      : never)
  | (T extends Date
      ? {
          readonly _gt?: T;
          readonly _gte?: T;
          readonly _lt?: T;
          readonly _lte?: T;
        }
      : never)
  | (T extends any[]
      ?
          | T[number]
          | {
              readonly _size?: number;
              readonly _elemMatch?: T extends (infer U)[] ? FilterExpression<U> : never;
              readonly _gt?: number;
              readonly _gte?: number;
              readonly _lt?: number;
              readonly _lte?: number;
              readonly _in?: T extends (infer U)[] ? U[] : never;
              readonly _nin?: T extends (infer U)[] ? U[] : never;
            }
      : never)
  | (T extends object
      ?
          | Partial<FilterExpression<T>>
          | {
              readonly _size?: number;
            }
      : never);

// Combined filter expression with both nested object and dot notation support
type FilterExpression<T> = {
  _and?: FilterExpression<T>[];
  _or?: FilterExpression<T>[];
  _not?: FilterExpression<T>;
} & {
  [K in keyof T]?: FilterValueForType<T[K]>;
} & {
  [K in DotNotationPaths<T>]?: PathValue<T, K> extends infer V ? FilterValueForType<V> : never;
};

type Extractor = (obj: any, key: string) => any;

class FilterError extends Error {
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
function matchesInternal(
  expression: any,
  record: any,
  extractor: Extractor = getAttribute,
): boolean {
  if (expression === null || expression === undefined) {
    throw new FilterError('Expression cannot be null or undefined');
  }

  if (Array.isArray(record)) {
    return record.some((item) => matchesInternal(expression, item, extractor));
  }

  if (typeof expression !== 'object' || expression instanceof Date) {
    return isEqual(expression, record);
  }

  if (expression._and && expression._or) {
    throw new FilterError(
      'Indeterminate behavior. "_and" and "_or" operators cannot be present at the same level.',
    );
  }

  if (Array.isArray(expression._and)) {
    return expression._and.every((exp: any) => matchesInternal(exp, record, extractor));
  }
  if (Array.isArray(expression._or)) {
    return expression._or.some((exp: any) => matchesInternal(exp, record, extractor));
  }
  if (expression._not) {
    if (typeof expression._not !== 'object') {
      throw new FilterError('_not needs a regex or a document');
    }

    return !matchesInternal(expression._not, record, extractor);
  }
  if (!Array.isArray(record) && typeof record === 'object') {
    for (const key in expression) {
      const value = extractor(record, key);

      if (!testExpression(expression[key], value)) {
        return false;
      }
    }

    return true;
  }
  return testExpression(expression, record);
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
    if ('_gt' in expr) {
      return value.some((v) => greaterThan(v, expr._gt));
    }
    if ('_gte' in expr) {
      return value.some((v) => greaterThanOrEqual(v, expr._gte));
    }
    if ('_lt' in expr) {
      return value.some((v) => lessThan(v, expr._lt));
    }
    if ('_lte' in expr) {
      return value.some((v) => lessThanOrEqual(v, expr._lte));
    }
    if ('_eq' in expr) {
      return value.some((v) => isEqual(v, expr._eq));
    }
    if ('_ne' in expr) {
      return !value.every((v) => isEqual(v, expr._ne));
    }
    if ('_in' in expr) {
      return value.some((v) => expr._in.includes(v));
    }
    if ('_nin' in expr) {
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

  if ('_eq' in expr && !isEqual(value, expr._eq)) {
    return false;
  }

  if ('_ne' in expr && isEqual(value, expr._ne)) {
    return false;
  }

  if (typeof expr._exists === 'boolean' && !exists(value, expr._exists)) {
    return false;
  }

  if ('_not' in expr) {
    if (typeof expr._not !== 'object' || expr._not === null) {
      throw new FilterError('_not needs a regex or a document');
    }

    if (testExpression(expr._not, value)) {
      return false;
    }
  }

  if (expr._gt !== undefined) {
    const compareValue = Array.isArray(value) ? value.length : value;
    if (!greaterThan(compareValue, expr._gt)) {
      return false;
    }
  }

  if (expr._lt !== undefined) {
    const compareValue = Array.isArray(value) ? value.length : value;
    if (!lessThan(compareValue, expr._lt)) {
      return false;
    }
  }

  if (expr._lte !== undefined) {
    const compareValue = Array.isArray(value) ? value.length : value;
    if (!lessThanOrEqual(compareValue, expr._lte)) {
      return false;
    }
  }

  if (expr._gte !== undefined) {
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
export function mongoPath<T = any>(expression: Record<string, any>): Record<string, any> {
  return expression;
}
