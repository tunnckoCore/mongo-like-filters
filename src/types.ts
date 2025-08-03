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
export type NoInfer<T> = [T][T extends any ? 0 : never];

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
export type FilterExpression<T> = {
  _and?: FilterExpression<T>[];
  _or?: FilterExpression<T>[];
  _not?: FilterExpression<T>;
} & {
  [K in keyof T]?: FilterValueForType<T[K]>;
} & {
  [K in DotNotationPaths<T>]?: PathValue<T, K> extends infer V ? FilterValueForType<V> : never;
};

export type Extractor = (obj: any, key: string) => any;
