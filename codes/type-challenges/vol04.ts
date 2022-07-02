namespace Vol04 {
  // 1. MyPermutation

  type MyPermutation<T, U = T> = [T] extends [never]
    ? []
    : T extends U
    ? [T, ...MyPermutation<Exclude<U, T>>]
    : [];
  type Test1 = MyPermutation<'A' | 'B' | 'C'>;

  // 2. MyLength

  type SP<T extends string> = T extends ''
    ? []
    : T extends `${infer H}${infer T}`
    ? [H, ...SP<T>]
    : never;
  type MyLength<T extends string> = SP<T>['length'];
  type Test2 = MyLength<'hello'>;

  // 3. MyFlatten

  type MyFlatten<T extends any[]> = T extends [infer F, ...infer R]
    ? F extends any[]
      ? [...MyFlatten<F>, ...MyFlatten<R>]
      : [F, ...MyFlatten<R>]
    : [];
  type Test3 = MyFlatten<[1, 2, [3, 4], [[[5]]]]>;

  // 4. MyAppend

  type MyAppend<T, K extends string, V> = T & { [key in K]: V };
  type Test4 = MyAppend<{ id: number }, 'foo', 'bar'>;

  // 5. MyAbsolute

  type MyAbsolute<T extends number> = `${T}` extends `-${infer R}` ? R : T;
  type Test5 = MyAbsolute<-100>;

  // 6. MyUnion

  type MyUnion<T extends string> = T extends ''
    ? never
    : T extends `${infer U}${infer V}`
    ? U | MyUnion<V>
    : never;
  type Test6 = MyUnion<'hello'>;

  // 7. MyMerge

  type MyMerge<T, U> = {
    [K in keyof U | keyof T]: K extends keyof U ? U[K] : K extends keyof T ? T[K] : never;
  };
  type Test7 = MyMerge<{ foo: string; bar: number }, { foo: number; baz: string }>;

  // 8. MyKebab

  type MyKebab0<T extends string> = T extends `${infer U}${infer V}`
    ? U extends Uppercase<U>
      ? `-${Lowercase<U>}${MyKebab0<V>}`
      : `${U}${MyKebab0<V>}`
    : '';
  type MyKebab<T extends string> = MyKebab0<T> extends `-${infer S}` ? S : never;
  type Test8 = MyKebab<'FooBarBaz'>;
}
