# `type Maybe<T> = Some(T) | None`

This type is an alternative to `null | undefined`, but it allows for chaining and joining in a functional style.

```ts
import { Maybe, Some, None } from '@ts-std/monads'

function require_even(n: number): Maybe<number> {
  if (n % 2 === 0)
    return Some(n)
  else
    return None
}
```

## `Maybe<T>` instances

### `is_some(): this is Some<T>`

Says if the value is a `Some`. This is a guard, so you may access the inner `T` at `value`.

```ts
Some(1).is_some() === true
None.is_some() === false

const some = Some(1)
if (some.is_some()) {
  const n: number = some.value
}
```

### `is_none(): this is None`

Says if the value is `None`. This is a guard.

```ts
Some(1).is_none() === false
None.is_none() === true
```

### `to_undef(): T | undefined`

Converts the `Maybe` into the internal value or `undefined`.

```ts
Some(1).to_undef() === 1
None.to_undef() === undefined
```

### `to_null(): T | null`

Converts the `Maybe` into the internal value or `null`.

```ts
Some(1).to_null() === 1
None.to_null() === null
```

### `to_result<E>(err: E): Result<T, E>`

Converts the `Maybe` into a [`Result`](./result.md), taking in an error value.

```ts
Some(1).to_result("no number") === Ok(5)
None.to_result("no number") === Err("no number")
```

### `match<U>(fn: MaybeMatch<T, U>): U`

```ts
type MaybeMatch<T, U> = {
  some: TransformerOrValue<T, U>,
  none: ProducerOrValue<U>,
}

type TransformerOrValue<T, U> = ((input: T) => U) | U
type ProducerOrValue<U> = () => (() => U) | U
```

Matches on the value, taking a function to call or value to return for both the `Some` and `None` cases.

```ts
Some(1).match({
  some: number => "have a number",
  none: "don't have a number",
}) // => "have a number"

None.match({
  some: "have a number",
  none: () => "don't have a number",
}) // => "don't have a number"
```

### `change<U>(fn: (value: T) => U): Maybe<U>`

Changes the internal value if it is `Some`, else does nothing.

```ts
Some(1).change(number => number + 1) === Some(2)
None.change(number => number + 1) === None
```

### `try_change<U>(fn: (value: T) => Maybe<U>): Maybe<U>`

Changes the internal value with a fallible operation if it is `Some`, else does nothing.

```ts
const func = number => number >= 0 ? Some(number + 1) : None
Some(1).try_change(func) === Some(2)
None.try_change(func) === None

Some(-1).try_change(func) === None
```

### `and<U>(other: ProducerOrValue<Maybe<U>>): Maybe<U>`

Returns `other` if both are `Some`, else returns `None`.

`other` can be a function that returns a value, for lazy execution.

```ts
Some(1).and(Some('a')) === Some('a')
None.and(Some('a')) === None
Some(1).and(None) === None
None.and(None) === None

Some(1).and(() => Some('a')) === Some('a')
```

### `or(other: ProducerOrValue<Maybe<T>>): Maybe<T>`

Returns the first `Some` if either is `Some`, else `None`.

`other` can be a function that returns a value, for lazy execution.

```ts
Some(1).or(Some(2)) === Some(1)
None.or(Some(2)) === Some(2)
Some(1).or(None) === Some(1)
None.or(None) === None

Some(1).or(() => Some(2)) === Some(1)
```


### `xor(other: ProducerOrValue<Maybe<T>>): Maybe<T>`

Returns `this` or `other` if exactly one of them is `Some`, else `None`.

`other` can be a function that returns a value, for lazy execution.

```ts
Some(1).xor(Some(2)) === None
None.xor(Some(2)) === Some(2)
Some(1).xor(None) === Some(1)
None.xor(None) === None

Some(1).xor(() => Some(2)) === None
```

### `default(def: ProducerOrValue<T>): T`

Returns the internal value if it is `Some`, else `def`.

`def` can be a function that returns a value, for lazy execution.

```ts
Some(1).default(0) === 1
None.default(0) === 0

None.default(() => 0) === 0
```

### `expect(message: string): T | never`

Returns the internal value if it is `Some`, otherwise throws an error with `message`. Use this cautiously!

```ts
Some(1).expect("Uh oh") === 1
None.expect("Uh oh") // throws Error("Uh oh")
```

### `join<L extends any[]>(...maybes: MaybeTuple<L>): MaybeJoin<Unshift<T, L>>`

Joins `this` and many more `Maybe`s into a `MaybeJoin`, which is detailed more below. Joining allows you to perform computations on many `Maybe`s that rely on them all being successful. All the `Maybe`s may be of different types.


## `type MaybeJoin<L extends any[]>`

The type created when joining `Maybe`s. Has methods to either combine the internal values or convert the join into a `Maybe`.

### `combine<T>(fn: (...args: L) => T): Maybe<T>`

Combines the internal `Maybe`s if they were all `Some`, else does nothing and returns `None`.

```ts
const combine_some = Some(1).join(Some(2), Some(3))
  .combine((one, two, three) => one + two + three)

combine_some === Some(6)

const combine_none = Some(1).join(None, Some(3))
  .combine((one, two, three) => one + two + three)

combine_none === None
```

### `try_combine<T>(fn: (...args: L) => Maybe<T>): Maybe<T>`

Combines the internal `Maybe`s if they were all `Some` with a fallible computation, else does nothing and returns `None`.

```ts
const func = (one, two, three) => {
  if (one < 0)
    return None
  else
    return one + two + three
}

const combine_some = Some(1).join(Some(2), Some(3))
  .try_combine(func)

combine_some === Some(6)

const combine_none = Some(-1).join(Some(2), Some(3))
  .try_combine(func)

combine_none === None
```

### `into_maybe(): Maybe<L>`

Converts the `MaybeJoin` into a normal `Maybe` where the internal value is a tuple.

```ts
const combine_some = Some(1).join(Some('a'), Some(true))
  .into_maybe()

combine_some === Some([1, 'a', true])

const combine_none = Some(1).join(None, Some(true))
  .into_maybe()

combine_none === None
```


## `Maybe` static functions

### `Maybe.from_nillable<T>(value: T | null | undefined): Maybe<T>`

Converts an ordinary javascript value that could be `null | undefined` into a `Maybe`.

```ts
Maybe.from_nillable(1) === Some(1)
Maybe.from_nillable(null) === None
Maybe.from_nillable(() => undefined) === None
```

### `Maybe.is_maybe(value: any): value is Maybe<unknown>`

Checks if a value is a `Maybe`.

```ts
Maybe.is_maybe(Some(1)) === true
Maybe.is_maybe(None) === true
Maybe.is_maybe('a') === false
```

### `Maybe.all<T>(maybes: Maybe<T>[]): Maybe<T[]>`

Takes an array of `Maybe`s and converts it to a `Maybe` where the internal value is an array. If any value is `None`, the output is `None`.

```ts
Maybe.all([Some(1), Some(2), Some(3)]) === Some([1, 2, 3])
Maybe.all([Some(1), None, Some(3)]) === None
```

### `Maybe.filter<T>(maybes: Maybe<T>[]): T[]`

Takes an array of `Maybe`s, removes all `None`s, and returns an array of the internal values.

```ts
Maybe.filter([Some(1), None, Some(2), Some(3), None]) === [1, 2, 3]
```

### `Maybe.join<L extends any[]>(...maybes: MaybeTuple<L>): MaybeJoin<L>`

A static counterpart to `instance.join`.

```ts
const combine_some = Maybe.join(Some(1), Some(2), Some(3))
  .combine((one, two, three) => one + two + three)

combine_some === Some(6)

const combine_none = Maybe.join(Some(1), None, Some(3))
  .combine((one, two, three) => one + two + three)

combine_none === None
```

### `Maybe.attempt<T>(fn: () => T): Maybe<T>`

Wraps a function that throws an error, returning `Some` if the function is successful and `None` otherwise.

```ts
Maybe.attempt(() => 1) === Some(1)
Maybe.attempt(() => { throw new Error("Uh oh") }) === None
```

**Note:** only use this function with external functions that you can't control. For your own functions, it's better to simply use `Maybe` and `Result` values rather than throwing exceptions.
