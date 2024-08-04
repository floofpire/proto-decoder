export type JSONValue = string | number | boolean | JSONObject | JSONArray;

export interface JSONObject {
  [x: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> {}

/**
 * Gets all elements except for head in an array
 * @example
 * Tail<[1, 2, 3]>; // [2, 3]
 */
type Tail<T extends unknown[]> = T extends [unknown, ...infer Rest] ? Rest : never;

/**
 * Returns Tail<T> if first element of T matches P. Somehow resolves issues with
 * union types, but unsure how; @see {@link https://stackoverflow.com/a/57837897/1105281}
 */
type TailUnion<P extends unknown, T extends unknown[]> = T extends unknown[]
  ? T[0] extends P
    ? Tail<T>
    : never
  : never;

/**
 * Converts a string like "a.b.c" to an array ["a", "b", "c"]
 */
type PathToStringArray<T extends string> = T extends `${infer Head}.${infer Tail}`
  ? [...PathToStringArray<Head>, ...PathToStringArray<Tail>]
  : [T];

/**
 * For any object, enforces that the keys provided are all present; paths are
 * expressed as lists of keys in the order you would access them on an object;
 * for instance, for an object called obj, obj.a.b.c would be represented as
 * ["a", "b", "c"]
 *
 * @see RequireKeysDeep for usage
 */
type RequireKeysDeepArr<
  Obj,
  PathsToRequire extends string[],
  // eslint-disable-next-line @typescript-eslint/ban-types
> = Obj extends object
  ? Omit<Obj, Extract<keyof Obj, PathsToRequire[0]>> &
      Required<{
        [K in Extract<keyof Obj, PathsToRequire[0]>]: NonNullable<
          RequireKeysDeepArr<Obj[K], TailUnion<K, PathsToRequire>>
        >;
      }>
  : Obj;

/**
 * For any object, enforces that the keys provided are all present; works with
 * deeply nested syntax, by using period (`.`) as a delimiter.
 *
 * @example
 * type Foo = { a?: 2, b?: { c?: 3, d: 4 } }
 * type A = RequireKeysDeep<Foo, "a">; // {a: 2, b?: { c?: 3, d: 4 } }
 * type B = RequireKeysDeep<Foo, "b">; // {a?: 2, b: { c?: 3, d: 4 } }
 * type BC = RequireKeysDeep<Foo, "b.c">; // {a?: 2, b: { c: 3, d: 4 } }
 * type ABC = RequireKeysDeep<Foo, "a" | "b.c">; // {a: 2, b: { c: 3, d: 4 } }
 */
export type RequireKeysDeep<T, P extends string> = RequireKeysDeepArr<T, PathToStringArray<P>>;
