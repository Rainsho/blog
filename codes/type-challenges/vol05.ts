namespace Vol05 {
  // 1. MyDiff

  type MyDiff<A, B> = {
    [K in Exclude<keyof A, keyof B> | Exclude<keyof B, keyof A>]: K extends keyof A
      ? A[K]
      : K extends keyof B
      ? B[K]
      : never;
  };
  type Test1 = MyDiff<{ foo: number; bar: string }, { foo: number; baz: number }>;

  // 2. MyAnyOf

  // `{}` means object, everything extends object
  type Falsy = false | undefined | null | 0 | '' | [] | never | Record<any, never>;
  type MyAnyOf<T extends any[]> = T extends [infer H, ...infer R]
    ? H extends Falsy
      ? MyAnyOf<R>
      : true
    : false;
  type Test2 = MyAnyOf<[1, '', false, [], {}]>;
  type Test2_0 = MyAnyOf<[0, '', false, [], {}]>;
  type Test2_1 = MyAnyOf<[1]>;
  type Test2_2 = 1 extends Falsy ? true : false;

  // 3. MyIsNever

  type MyIsNever<T> = (() => T) extends () => never ? true : false;
  type Test3 = MyIsNever<never>;
  type Test3_0 = MyIsNever<number>;

  // 4. MyIsUnion

  type MyIsUnion<T, F = T> = T extends T ? ([F] extends [T] ? false : true) : never;
  type Test4 = MyIsUnion<string>;
  type Test4_0 = MyIsUnion<string | number>;

  // 5. MyReplaceKeys

  type MyReplaceKeys<T, K, O> = {
    [P in keyof T]: P extends K ? (P extends keyof O ? O[P] : never) : T[P];
  };
  type Test5 = MyReplaceKeys<{ foo: string }, 'foo', { foo: number }>;
  type Test5_0 = MyReplaceKeys<{ foo: string }, 'foo', { bar: number }>;

  // 6. MyRemoveIndex

  type MyRemoveIndex<T> = {
    [K in keyof T as K extends `${infer P}` ? P : never]: T[K];
  };
  type Test6 = MyRemoveIndex<{ [key: string]: any; foo(): void; bar: number }>;

  // 7. MyPercentageParser

  type MyPercentageParser<T, X = '', Y extends string = '', Z = ''> = T extends ''
    ? [X, Y, Z]
    : T extends `${infer H}${infer R}`
    ? R extends '%' | ''
      ? [X, `${Y}${H}`, R]
      : Y extends ''
      ? H extends '+' | '-'
        ? MyPercentageParser<R, H, Y, Z>
        : MyPercentageParser<R, X, H, Z>
      : MyPercentageParser<R, X, `${Y}${H}`, Z>
    : never;
  type Test7 = MyPercentageParser<''>; // expected ['', '', '']
  type Test7_0 = MyPercentageParser<'+85%'>; // expected ["+", "85", "%"]
  type Test7_1 = MyPercentageParser<'-85%'>; // expected ["-", "85", "%"]
  type Test7_2 = MyPercentageParser<'85%'>; // expected ["", "85", "%"]
  type Test7_3 = MyPercentageParser<'85'>; // expected ["", "85", ""]

  // 8. MyDropChar

  type MyDropChar<T, U> = T extends `${infer H}${infer R}`
    ? H extends U
      ? MyDropChar<R, U>
      : `${H}${MyDropChar<R, U>}`
    : '';
  type Test8 = MyDropChar<' b u t t e r f l y ! ', ' '>;
}
