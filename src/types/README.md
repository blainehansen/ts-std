# `@ts-std/types`

> Various helpful type definitions and type assertion helpers. Includes many tricky recursive and functional types.

## API

### Tuples

#### `function tuple<L extends any[]>(...values: L): L`

Let's you quickly create a tuple without requiring a type assertion.

```ts
// the old way
const yuck = [1, 'a', true] as [number, string, boolean]

// the better way
// especially nice if you need to create many tuples in a file
import { tuple as t } from '@ts-std/types'
const yay = t(1, 'a', true)
```

#### `type Unshift<Item, List extends any[]>`

Very useful for prepending items to tuples.

```ts
const a: Unshift<number, [string, boolean]> = [1, 'a', true]

function join<T, L extends any[]>(item: T, ...list: L): Unshift<T, L> {
  return [item, ...list] as Unshift<T, L>
}
```

#### `type Head<L extends any[]>`

Gets the first element from a tuple type.

```ts
assert_is_type<Head<[number, string], number>>(true)
assert_is_type<Head<[], never>>(true)
```

#### `type Tail<L extends any[]>`

Gets all but the `Head` from a tuple type.

```ts
assert_is_type<Tail<[number, string, boolean], [string, boolean]>>(true)
assert_is_type<Tail<[number], []>>(true)
assert_is_type<Tail<[], []>>(true)
```

#### `type HasTail<L extends any[]>`

Checks whether the tuple type has a tail.

```ts
assert_boolean_type<HasTail<[number, string]>>(true)
assert_boolean_type<HasTail<[number]>>(false)
assert_boolean_type<HasTail<[]>>(false)
```

#### `type Last<L extends any[]>`

Gets the final item from a tuple type.

```ts
assert_is_type<Last<[number, string]>, string>(true)
assert_is_type<Last<[number]>, number>(true)
assert_is_never<Last<[]>>(true)
```

#### `type OnlyOne<L extends any[]>`

Checks whether a tuple type has only one element.

```ts
assert_boolean_type<OnlyOne<[number, string]>>(false)
assert_boolean_type<OnlyOne<[number]>>(true)
assert_boolean_type<OnlyOne<[]>>(false)
```


### Type assertion

These are useful for testing if your library functions return the correct types or not. Typically used in a testing suite to ensure that unexpected type returns break the build.

#### `type IsType<T, U>`

Checks that two types are exactly the same.

#### `type IsNever<T> = IsType<T, never>`

Checks that a type is `never`.

#### `function assert_boolean_type<T extends boolean>(expectTrue: T extends true ? true : false)`

Checks a boolean conditional type.

```ts
// type IsString<T> = T extends string ? true : false
assert_boolean_type<IsString<string>>(true)
assert_boolean_type<IsString<boolean>>(false)
```

#### `function assert_is_type<T, U>(expectTrue: IsType<T, U> extends true ? true : false)`

Checks that two types are exactly the same.

```ts
assert_is_type<NonNullable<string | null>, string>(true)
assert_is_type<NonNullable<string | null>, string | null>(false)
```

#### `function assert_is_never<T>(expectTrue: IsNever<T> extends true ? true : false)`

Checks that a type is `never`.

```ts
assert_is_never<Head<[]>>(true)
assert_is_never<Head<[string]>>(false)
```

#### `function assert_type<T>(value: T)`

Checks that the value is of type.

```ts
assert_type<number>(4)
```

#### `function assert_value_types<T, U>(a: T, b: U, expectTrue: IsType<T, U> extends true ? true : false)`

Checks that two values have the same type.

```ts
assert_value_types(
  [1, 'a', true] as [number, string, boolean],
  t(1, 'a', true),
  true,
)

assert_value_types(
  [1, 'a', true],
  t(1, 'a', true),
  false,
)
```


### Miscellaneous

#### `type KeysOfType<T, U>`

Gets the keys from `T` that are of `U`.

```ts
type Data = { a: number, b: string, c: boolean }
type A = KeysOfType<Data, number> // -> 'a'
type B = KeysOfType<Data, string> // -> 'b'
type Both = KeysOfType<Data, number | string> // -> 'a' | 'b'
```

#### `type PickOfType<T, U>`

Creates a new type from `T` with only the keys that are of `U`.

```ts
type Data = { a: number, b: string, c: boolean }
type A = PickOfType<Data, number> // -> { a: number }
type B = PickOfType<Data, string> // -> { b: string }
type Both = PickOfType<Data, number | string> // -> { a: number, b: string }
```

#### `type SingleParameter<F extends (arg: any) => any>`

Pulls the single input type from a function.

```ts
assert_is_type<SingleParameter<(arg: number) => any, number>>(true)
assert_is_type<SingleParameter<(arg: number) => any>, string>(false)
```

#### `type FoldingFunctions<L extends ((arg: any) => any)[]>`

Requires that a tuple of functions have inputs and outputs that "chain" from one to the next, and gives the final output type.

Useful for situations where functions will be called in order with the output of the previous.

```ts
assert_is_type<FoldingFunctions<[() => number, (a: number) => string, (a: string) => boolean]>, boolean>(true)
assert_is_type<FoldingFunctions<[() => number]>, number>(true)
assert_is_type<FoldingFunctions<[() => number]>, string>(false)

assert_is_never<FoldingFunctions<[() => number, () => string]>>(true)
assert_is_never<FoldingFunctions<[]>>(true)
assert_is_never<FoldingFunctions<[() => number, (a: string) => string]>>(true)
```
