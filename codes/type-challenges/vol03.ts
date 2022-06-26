namespace Vol03 {
  // 1. MyPromiseAll???

  declare function PromiseAll<T>(values: T): Promise<{
    [K in keyof T]: T[K] extends Promise<infer U> ? U : T[K];
  }>;
  const promiseAllTest1 = PromiseAll([1, 2, 3] as const);
  const promiseAllTest2 = PromiseAll([1, 2, Promise.resolve(3)] as const);
  const promiseAllTest3 = PromiseAll([1, 2, Promise.resolve(3)]);

  // 2. MyLookup

  type MyLookup<T, P> = T extends { type: infer U } ? (U extends P ? T : never) : never;
  type Test2 = { type: 'cat'; breeds: 'Curl' };
  type Test2_0 = { type: 'dog'; breeds: 'Hound'; color: 'red' | 'green' };
  type Test2_1 = MyLookup<Test2 | Test2_0, 'dog'>;

  // 3. MyTrimLeft<T>

  type MyTrimLeft<T extends string> = T extends ` ${infer U}` ? MyTrimLeft<U> : T;
  type Test3 = MyTrimLeft<'   Hello World   '>;

  // 4. MyTrim

  // type MyTrim<T extends string> = T extends ` ${infer U}`
  //   ? MyTrim<U>
  //   : T extends `${infer P} `
  //   ? MyTrim<P>
  //   : T;
  type MyTrim<T extends string> = T extends ` ${infer U}` | `${infer U} ` ? MyTrim<U> : T;
  type Test4 = MyTrim<'   Hello World   '>;

  // 5. MyCapitalize

  type MyCapitalize<T extends string> = T extends `${infer F}${infer R}`
    ? `${Uppercase<F>}${R}`
    : never;
  type Test5 = MyCapitalize<'hello world'>;

  // 6. MyReplace

  type MyReplace<
    S extends string,
    F extends string,
    T extends string
  > = S extends `${infer H}${F}${infer L}` ? `${H}${T}${L}` : S;
  type Test6 = MyReplace<'hello world', 'wor', 'foo'>;

  // 7. MyReplaceAll

  type MyReplaceAll<
    S extends string,
    F extends string,
    T extends string
  > = S extends `${infer H}${F}${infer L}` ? MyReplaceAll<`${H}${T}${L}`, F, T> : S;
  type Test7 = MyReplaceAll<'hello foo bar foo', 'foo', 'bar'>;

  // 8. MyAppendArgument

  type MyAppendArgument<F extends Function, T> = F extends (...args: infer A) => infer R
    ? (...args: [...A, T]) => R
    : never;
  type Test8 = MyAppendArgument<(a: number, b: string) => number, boolean>;
}
