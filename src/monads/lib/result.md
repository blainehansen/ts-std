# `type Result<T, E = string> = Ok<T> | Err<E>`

This type is a much safer and more predictable alternative to exceptions. Since a `Result` type can either be a successful `Ok` or a failed `Err`, it allows very granular control of how and when errors are dealt with, without threatening to crash programs and cause bad behavior.

Since a function that could fail can choose to return a `Result` rather than throwing an exception, this creates a clear contract between the caller and the callee, and requires the caller to make some intelligent decision about how to deal with that error, rather than being surprised with an exception.

```ts
import { Result, Ok, Err } from '@ts-std/monads'

function require_even(n: number): Result<number> {
  if (n % 2 === 0)
    return Ok(n)
  else
    return Err(`n must be an even number: ${n}`)
}
```

## `Result<T, E>` instances

### `is_ok(): this is Ok<T>`

Says if the value is an `Ok`. This is a guard, so you may access the inner `T` at `value`.

```ts
Ok(1).is_ok() === true
Err("error").is_ok() === false

const ok = Ok(1)
if (ok.is_ok()) {
  const n: number = ok.value
}
```

### `is_err(): this is Err<E>`

Says if the value is an `Err`. This is a guard, so you may access the inner `E` at `error`.

```ts
Ok(1).is_err() === false
Err("error").is_err() === true

const err = Err("error")
if (err.is_err()) {
  const n: string = err.value
}
```

### `ok_maybe(): Maybe<T>`

Converts the ok into a [`Maybe`](./maybe.md). This essentially discards any error value.

```ts
Ok(1).ok_maybe() === Some(1)
Err("error").ok_maybe() === None
```

### `ok_undef(): T | undefined`

Converts the ok into the internal value or `undefined`.

```ts
Ok(1).ok_undef() === 1
Err("error").ok_undef() === undefined
```

### `ok_null(): T | null`

Converts the ok into the internal value or `null`.

```ts
Ok(1).ok_null() === 1
Err("error").ok_null() === null
```

### `err_maybe(): Maybe<E>`

Converts the error into a [`Maybe`](./maybe.md). This essentially discards any ok value.

```ts
Ok(1).err_maybe() === None
Err("error").err_maybe() === Some("error")
```

### `err_undef(): E | undefined`

Converts the error into the internal value or `undefined`.

```ts
Ok(1).err_undef() === undefined
Err("error").err_undef() === "error"
```

### `err_null(): E | null`

Converts the error into the internal value or `null`.

```ts
Ok(1).err_null() === null
Err("error").err_null() === "error"
```

### `match<U>(fn: ResultMatch<T, E, U>): U`

```ts
type ResultMatch<T, E, U> = {
  ok: TransformerOrValue<T, U>,
  err: TransformerOrValue<E, U>,
}

type TransformerOrValue<T, U> = ((input: T) => U) | U
```

Matches on the value, taking a function to call or value to return for both the `Ok` and `Err` cases.

```ts
Ok(1).match({
  ok: number => "have a number",
  err: "don't have a number",
}) // => "have a number"

Err("error").match({
  ok: "have a number",
  err: error => error,
}) // => "error"
```


### `change<U>(fn: (value: T) => U): Result<U, E>`

Changes the internal value if it is `Ok`, else does nothing.

```ts
Ok(1).change(number => number + 1) === Ok(2)
Err("error").change(number => number + 1) === Err("error")
```

### `try_change<U>(fn: (value: T) => Result<U, E>): Result<U, E>`

Changes the internal value with a fallible operation if it is `Ok`, else does nothing.

```ts
const func = number => number >= 0 ? Ok(number + 1) : Err("negative number")
Ok(1).try_change(func) === Ok(2)
Err("started bad").try_change(func) === Err("started bad")

Ok(-1).try_change(func) === Err("negative number")
```

### `change_err<U>(fn: (err: E) => U): Result<T, U>`

Changes the error if it is `Err`, else does nothing.

```ts
const func = error => `something went wrong: ${error}`
Ok(1).change_err(func) === Ok(1)
Err("error").change_err(func) === Err("something went wrong: error")
```


### `and<U>(other: ProducerOrValue<Result<U, E>>): Result<U, E>`

Changes the internal value to `other` if both are `Ok`, else returns the first `Err`.

`other` can be a function that returns a value, for lazy execution.

```ts
Ok(1).and(Ok('a')) === Ok('a')
Err("error").and(Ok('a')) === Err("error")
Ok(1).and(Err("error")) === Err("error")
Err("one error").and(Err("two error")) === Err("one error")

Ok(1).and(() => Ok('a')) === Ok('a')
```

### `or(other: ProducerOrValue<Result<T, E>>): Result<T, E>`

Returns the first `Ok` if either is `Ok`, else the first `Err`.

`other` can be a function that returns a value, for lazy execution.

```ts
Ok(1).or(Ok(2)) === Ok(1)
Err("error").or(Ok(2)) === Ok(2)
Ok(1).or(Err("error")) === Ok(1)
Err("one error").or(Err("two error")) === Err("one error")

Ok(1).or(() => Ok(2)) === Ok(1)
```

### `xor(other: ProducerOrValue<Result<T, E>>, same_err: ProducerOrValue<E>): Result<T, E>`

Returns `this` or `other` if exactly one of them is `Ok`, else `Err`.

Both `other` and `same_err` can be a function that returns a value, for lazy execution.

```ts
Ok(1).xor(Ok(2), "both Ok") === Err("both Ok")
Err("error").xor(Ok(2), "both Ok") === Ok(2)
Ok(1).xor(Err("error"), "both Ok") === Ok(1)
Err("one error").xor(Err("two error"), "both Ok") === Err("one error")

Ok(1).xor(() => Ok(2), () => "both Ok") === Err("both Ok")
```

### `default(def: ProducerOrValue<T>): T`

Returns the ok value if it is `Ok`, else `def`.

`def` can be a function that returns a value, for lazy execution.

```ts
Ok(1).default(0) === 1
Err("error").default(0) === 0

Err("error").default(() => 0) === 0
```

### `default_err(def_err: ProducerOrValue<E>): E`

Returns the err value if it is `Err`, else `def_err`.

`default_err` can be a function that returns a value, for lazy execution.

```ts
Ok(1).default_err("Uh oh") === "Uh oh"
Err("error").default_err("Uh oh") === "error"

Ok(1).default_err(() => "Uh oh") === "Uh oh"
```

### `expect(message: string): T | never`

Returns the ok value if it is `Ok`, otherwise throws an error with `message`. Use this cautiously!

```ts
Ok(1).expect("Uh oh") === 1
Err("error").expect("Uh oh") // throws Error("Uh oh")
```

### `expect_err(message: string): E | never`

Returns the err value if it is `Err`, otherwise throws an error with `message`. Use this cautiously!

```ts
Err("error").expect_err("Uh oh") === "error"
Ok(1).expect_err("Uh oh") // throws Error("Uh oh")
```

### `join<L extends any[]>(...args: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E>`

Joins `this` and many more `Result`s into a `ResultJoin`, which is detailed more below. Joining allows you to perform computations on many `Result`s that rely on them all being successful. All the `Result`s may be of different types.

### `join_collect_err<L extends any[]>(...args: ResultTuple<L, E>): ResultJoin<Unshift<T, L>, E[]>`

Same as `join`, but collects all errors into an array.

```ts
const combine_err = Ok(1).join(Err("one error"), Err("two error"))
  .combine((one, two, three) => one + two + three)

combine_err === Err(["one error", "two error"])
```


## `type ResultJoin<L extends any[], E = string>`

The type created from joining `Results`s. Has methods to either combine the internal values or convert the join into a `Result`.

### `combine<T>(fn: (...args: L) => T): Result<T, E>`

Combines the internal `Result`s if they were all `Ok`, else does nothing and returns the `Err` created at the time of join.

```ts
const combine_ok = Ok(1).join(Ok(2), Ok(3))
  .combine((one, two, three) => one + two + three)

combine_ok === Ok(6)

const combine_err = Ok(1).join(Err("one error"), Err("two error"))
  .combine((one, two, three) => one + two + three)

combine_err === Err("one error")
```

### `try_combine<T>(fn: (...args: L) => Result<T, E>): Result<T, E>`

Combines the internal `Result`s if they were all `Ok` with a fallible computation, else does nothing and returns the `Err` created at the time of join.

```ts
const func = (one, two, three) => {
  if (one < 0)
    return Err("error")
  else
    return one + two + three
}

const combine_ok = Ok(1).join(Ok(2), Ok(3))
  .try_combine(func)

combine_ok === Ok(6)

const combine_err = Ok(-1).join(Ok(2), Ok(3))
  .try_combine(func)

combine_err === Err("error")
```

### `into_result(): Result<L, E>`

Converts the `ResultJoin` into a normal `Result` where the internal value is a tuple.

```ts
const combine_ok = Ok(1).join(Ok('a'), Ok(true))
  .into_result()

combine_ok === Ok([1, 'a', true])

const combine_err = Ok(1).join(Err("error"), Ok(true))
  .into_result()

combine_err === Err("error")
```


## `Result` static functions

### `Result.from_nillable<T, E>(value: T | null | undefined, err: ProducerOrValue<E>): Result<T, E>`

Converts an ordinary javascript value that could be `null | undefined` into a `Result`.

`err` can be a function that returns a value, for lazy execution.

```ts
Result.from_nillable(1, "was nillable") === Ok(1)
Result.from_nillable(null, "was nillable") === Err("was nillable")
Result.from_nillable(undefined, () => "was nillable") === Err("was nillable")
```

### `Result.is_result(value: any): value is Result<unknown, unknown>`

Checks if a value is a `Result`.

```ts
Result.is_result(Ok(1)) === true
Result.is_result(Err("error")) === true
Result.is_result('a') === false
```

### `Result.all<T, E>(results: Result<T, E>[]): Result<T[], E>`

Takes an array of `Result`s and converts it to a `Result` where the internal value is an array. If any value is `Err`, the output is the first `Err`.

```ts
Result.all([Ok(1), Ok(2), Ok(3)]) === Ok([1, 2, 3])
Result.all([Ok(1), Err("error"), Ok(3)]) === Err("error")
```

### `Result.all_collect_err<T, E>(results: Result<T, E>[]): Result<T[], E[]>`

Takes an array of `Result`s and converts it to a `Result` where the internal value is an array. If any value is `Err`, the output is the collected `Err`s.

```ts
Result.all([Ok(1), Ok(2), Ok(3)]) === Ok([1, 2, 3])
Result.all([Ok(1), Err("one"), Ok(3), Err("two")]) === Err(["one", "two"])
```

### `Result.join<L extends any[], E>(...results: ResultTuple<L, E>): ResultJoin<L, E>`

A static counterpart to `instance.join`.

```ts
const combine_ok = Result.join(Ok(1), Ok(2), Ok(3))
  .combine((one, two, three) => one + two + three)

combine_ok === Ok(6)

const combine_err = Result.join(Ok(1), Err("error"), Ok(3))
  .combine((one, two, three) => one + two + three)

combine_err === Err("error")
```

### `Result.join_collect_err<L extends any[], E>(...results: ResultTuple<L, E>): ResultJoin<L, E[]>`

A static counterpart to `instance.join_collect_err`.

### `Result.filter<T, E>(results: Result<T, E>[]): T[]`

Takes an array of `Result`s, removes all `Err`s, and returns an array of the internal values.

```ts
const results = [Some(1), Err("error"), Some(2), Some(3), Err("error")]
Result.filter(results) === [1, 2, 3]
```

### `Result.split<T, E>(results: Result<T, E>[]): [T[], E[]]`

Takes an array of `Result`s, and splits it into two arrays, one of `Ok` values and one of `Err` values.

```ts
const results = [Ok(1), Err("two"), Ok(3), Err("four")]
Result.split(results) === [[1, 3], ["two", "four"]]
```

### `Result.attempt<T>(fn: () => T): Result<T, Error>`

Wraps a function that throws an exception, returning `Ok` if the function is successful and an `Err` containing the thrown exception otherwise.

```ts
Result.attempt(() => 1) === Ok(1)
Result.attempt(() => { throw new Error("Uh oh") }) === Err(Error("Uh oh"))
```

**Note:** only use this function with external functions that you can't control. For your own functions, it's better to simply use `Maybe` and `Result` values rather than throwing exceptions.
