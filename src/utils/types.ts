/**
 * Extracts the narrowed type from a type predicate function.
 * 
 * @example
 * // For a type predicate function like:
 * function isString(x: any): x is string { 
 *   return typeof x === 'string'; 
 * }
 * 
 * // Narrowed<typeof isString> resolves to type "string"
 * type ExtractedType = Narrowed<typeof isString>;
 * 
 * @template T - A type predicate function with signature `(x: any) => x is SomeType`
 * @returns The type that the predicate function narrows to (the "SomeType" in the example)
 */
export type Narrowed<T extends (x: any) => x is any> =
  T extends (x: any) => x is infer R ? R : never;