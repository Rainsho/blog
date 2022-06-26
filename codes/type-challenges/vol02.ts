namespace Vol02 {
  // 1. MyReturnType

  type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
  type Test1 = MyReturnType<typeof Math.random>;

  // 2. MyOmit

  type MyOmit0<T, K> = { [P in keyof T]: P extends K ? never : P }[keyof T];
  type MyOmit<T, K> = { [P in MyOmit0<T, K>]: T[P] };
  type Test2 = MyOmit<{ foo: string; bar: number }, 'foo'>;

  // 3. MyReadonlyAdv

  type MyReadonlyAdv<T, K extends keyof T> = {
    [Q in MyOmit0<T, K>]: T[Q];
  } & { readonly [P in K]: T[P] };
  const test3: MyReadonlyAdv<{ foo: string; bar: number }, 'foo'> = { foo: 'foo', bar: 23 };
  test3.foo = 'xxx';
  test3.bar = 12;

  // 4. MyReadonlyDeep

  type MyReadonlyDeep<T> = { readonly [P in keyof T]: MyReadonlyDeep<T[P]> };
  const test4: MyReadonlyDeep<{ foo: string; bar: { baz: { qux: number } } }> = {
    foo: 'foo',
    bar: { baz: { qux: 1 } },
  };
  test4.foo = 'xxx';
  test4.bar.baz.qux = 2;

  // 5. MyUnion

  type MyUnion<T extends unknown[]> = T[number];
  type Test5 = MyUnion<[1, 2, 'foo', 'bar']>;

  // 6. MyChain

  type MyChain<S = {}> = {
    option: <T extends string, K>(key: T, value: K) => MyChain<S & { [P in T]: K }>;
    get: () => S;
  };
  declare const config: MyChain;
  const result = config
    .option('foo', 123)
    .option('name', 'type-challenges')
    .option('bar', { value: 'Hello World' })
    .get();

  // 7. MyLast

  // type MyLast<T extends unknown[]> = T['length'] extends 1
  //   ? T extends [infer R]
  //     ? R
  //     : never
  //   : T extends [infer H, ...infer L]
  //   ? MyLast<L>
  //   : never;
  type MyLast<T extends unknown[]> = T extends [...infer H, infer L] ? L : never;
  type Test7 = MyLast<[1, 2, 'foo', 'bar']>;
  type Test7_0 = MyLast<[]>;

  // 8. MyPop

  type MyPop<T extends unknown[]> = T extends [...infer H, infer L] ? H : never;
  type Test8 = MyPop<[1, 2, 'foo', 'bar']>;
  type Test8_0 = MyPop<[]>;
}
