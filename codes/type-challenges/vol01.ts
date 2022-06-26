namespace Vol01 {
  // 1. MyPick

  type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
  type Test1 = MyPick<{ foo: string; bar: string; baz?: number }, 'foo'>;

  // 2. MyReadonly

  type MyReadonly<T> = {
    readonly [P in keyof T]: MyReadonly<T[P]>;
  };
  const test2: MyReadonly<{ foo: string; bar: { baz: number } }> = { foo: 'bar', bar: { baz: 1 } };
  test2.foo = 'baz';
  test2.bar.baz = 2;

  // 3. MyFirst

  type MyFirst<T extends any[]> = T[0];
  type Test3 = MyFirst<['a', 2, 3]>;

  // 4. MyLength

  type MyLength<T extends any[]> = T['length'];
  type Test4 = MyLength<['a', 2, 3]>;

  // 5. MyExclude

  type MyExclude<T, U extends keyof T> = { [P in keyof T]: P extends U ? never : P }[keyof T];
  type Test5 = MyExclude<{ foo: string; bar: number }, 'foo'>;

  // 6. MyAwaited

  type MyAwaited<T extends Promise<unknown>> = T extends Promise<infer A>
    ? A extends Promise<unknown>
      ? MyAwaited<A>
      : A
    : never;
  type Test6 = MyAwaited<Promise<number>>;
  type Test6_0 = MyAwaited<Promise<Promise<number>>>;

  // 7. MyIf

  type MyIf<C, T, F> = C extends true ? T : F;
  type Test7 = MyIf<true, 1, 2>;
  type Test7_0 = MyIf<0, 1, '2'>;

  // 8. MyConcat

  type MyConcat<P extends unknown[], Q extends unknown[]> = [...P, ...Q];
  type Test8 = MyConcat<['a', 2, 3], [4, 5]>;

  // 9. MyIncludes

  // type MyIncludes<T, K> = T extends [infer H, ...infer R]
  //   ? H extends K
  //     ? true
  //     : MyIncludes<R, K>
  //   : false;
  type MyIncludes<T extends unknown[], K> = K extends T[number] ? true : false;
  type Test9 = MyIncludes<['foo', 'bar', 'baz'], 'foo'>;
  type Test9_0 = MyIncludes<['foo', 'bar', 'baz'], 'far'>;

  // 10. MyPush

  type MyPush<T extends unknown[], P> = [...T, P];
  type Test10 = MyPush<['foo', 'bar', 'baz'], 3>;

  // 11. MyUnshift

  type MyUnshift<T extends unknown[], P> = [P, ...T];
  type Test11 = MyUnshift<['foo', 'bar', 'baz'], 3>;

  // 12. MyParameters

  type MyParameters<T> = T extends (...args: infer A) => any ? A : never;
}
