# `@ts-std/monads`

> `Result` and `Maybe` types that allow a safe and "functional" way of dealing with errors and nullable values.

These types wrap successful or unsuccessful values in a way that allows very convenient chaining and recombination. Ever wanted to do a task on a value only if it is actually there? Or ever wanted to do some task with a bunch of values that all individually could fail or not? Are you sick of having to catch exceptions all the time that come out of nowhere and make your software buggy and unreliable? This library is for you.

## [`type Result<T, E = string> = Ok<T> | Err<E>`](./lib/result.md)

This type is a much safer and more predictable alternative to exceptions. Since a `Result` type can either be a successful `Ok` or a failed `Err`, it allows very granular control of how and when errors are dealt with, without threatening to crash programs and cause bad behavior.

Since a function that could fail can choose to return a `Result` rather than throwing an exception, this creates a clear contract between the caller and the callee, and requires the caller to make some intelligent decision about how to deal with that error, rather than being surprised with an exception.

**Full `Result` docs [here](./lib/result.md)**

```ts
import { Result, Ok, Err } from '@ts-std/monads'

const a = Ok(5)
  // perform some infallible operation on a successful value
  .change(number => number + 1)
  // perform some *fallible* operation on a successful value
  .try_change(number => number % 2 === 0 ? Ok(number + 1) : Err("number wasn't even"))

a === Ok(7)

const b = Err("starting off bad...")
  .change(number => number + 1)
  .try_change(number => number % 2 === 0 ? Ok(number + 1) : Err("number wasn't even"))

b === Err("starting off bad...")

const c = Ok(6)
  .change(number => number + 1)
  .try_change(number => number % 2 === 0 ? Ok(number + 1) : Err("number wasn't even"))

c === Err("number wasn't even")


const combine_ok = Ok(1).join(Ok(2), Ok(3))
  .combine((one, two, three) => one + two + three)

combine_ok === Ok(6)

const combine_err = Ok(1).join(Err("two failed..."), Ok(3))
  .combine((one, two, three) => one + two + three)

combine_err === Err("two failed...")
```


## [`type Maybe<T> = Some(T) | None`](./lib/maybe.md)

This type is an alternative to `null | undefined`, but it allows for chaining and joining in a functional style.

**Full `Maybe` docs [here](./lib/maybe.md)**

```ts
import { Maybe, Some, None } from '@ts-std/monads'

const a = Some(5)
  // perform some infallible operation on a successful value
  .change(number => number + 1)
  // perform some *fallible* operation on a successful value
  .try_change(number => number % 2 === 0 ? Some(number + 1) : None)

a === Some(7)

const b = None
  .change(number => number + 1)
  .try_change(number => number % 2 === 0 ? Some(number + 1) : None)

b === None


const combine_some = Some(1).join(Some(2), Some(3))
  .combine((one, two, three) => one + two + three)

combine_some === Some(6)

const combine_none = Some(1).join(None, Some(3))
  .combine((one, two, three) => one + two + three)

combine_none === None
```
