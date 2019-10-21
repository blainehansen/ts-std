# `@ts-std/extensions`

> A variety of extensions to native types. Heavily use `Result` and `Maybe` types from ts-std/monads.

## `Array<T>`

### Common types

```ts
type Indexable = string | number | boolean
```

```ts
type MapFunc<T, U> = (element: T, index: number, array: T[]) => U
```

```ts
type Unzip<L extends any[]> = { [K in keyof L]: L[K][] }
```

### `sum(this: number[]): number`

If you have a list of numbers, you can just call `sum`.

```ts
[1, 1, 1].sum() === 3
```

### `sum(this: T[], key: KeysOfType<T, number> | MapFunc<T, number>): number`

An array of any type can be summed if you provide a key or function that produces a number from that type.

```ts
[{ a: 1 }, { a: 1 }, { a: 1 }].sum('a') == 3
[{ a: { v: 1 } }, { a: { v: 1 } }, { a: { v: 1 } }].sum(o => o.a.v) == 3

['a', 'a', 'a'].sum(s => s.length) == 3
```

### `filter_map<U>(fn: MapFunc<T, U | undefined>): U[]`

Basically a way of calling `filter` and `map` at the same time.

```ts
const double_evens = number => number % 2 === 0 ? number * 2 : undefined
[1, 2, 3, 4].filter_map(double_evens) === [4, 8]
```

### `maybe_find(fn: MapFunc<T, boolean>): Maybe<T>`

`find`, but returns a `Maybe` instead of `T | undefined`, which means you can chain functions directly.

```ts
const thing = [1, 2, 3, 4]
  .maybe_find(number => number > 4)
  .change(number => number * 2)
  .try_change(number => number % 3 == 0 ? Some(number) : number)

thing === None
```

### `index_by(arg: KeysOfType<T, Indexable> | MapFunc<T, Indexable>): { [key: string]: T }`

Create a dictionary from an array, by mapping each element to a key in the dictionary. Later will overwrite previous ones if they map to the same key.

```ts
const a = [{ a: 1, b: true }, { a: 2, b: false }, { a: 3, b: true }].index_by('a')
a === {
  1: { a: 1, b: true },
  2: { a: 2, b: false },
  3: { a: 3, b: true },
}

const b = ['a', 'ab', 'abc', 'b', 'bc'].index_by(str => str[0])
b === {
  a: 'abc',
  b: 'bc',
}
```

### `unique_index_by(arg: KeysOfType<T, Indexable> | MapFunc<T, Indexable>): Result<{ [key: string]: T }, [string, T, T]>`

Attempts to create a dictionary from an array, by mapping each element to a key in the dictionary. If two elements map to the same key, this will return an `Err` showing the key that overlapped and the items that both created it.

```ts
const ok = [{ name: 'alice', apples: 3 }, { name: 'bob', apples: 5 }, { name: 'cathy', apples: 2 }]
  .unique_index_by('name')

ok === Ok({
  alice: { name: 'alice', apples: 3 },
  bob: { name: 'bob', apples: 5 },
  cathy: { name: 'cathy', apples: 2 },
})

const err = [{ name: 'alice', apples: 3 }, { name: 'bob', apples: 5 }, { name: 'cathy', apples: 2 }]
  .unique_index_by(user => user.apples % 2 === 0)

err === Err(['false', { name: 'bob', apples: 5 }, { name: 'alice', apples: 3 }])
```

### `entries_to_dict<T>(this: [string, T][]): Dict<T>`

Create a dictionary from an array of "entries" shaped tuples.

```ts
const a = [['a', 1], ['b', 2], ['c', 3], ['a', 4]]
  .entries_to_dict()
a === { a: 4, b: 2, c: 3 }
```

### `unique_entries_to_dict<T>(this: [string, T][]): Result<Dict<T>, [string, T, T]>`

Attempts to create a dictionary from an array of "entries" shaped tuples. If two elements map to the same key, this will return an `Err` showing the key that overlapped and the items that both created it.

```ts
const ok = [['a', true], ['b', false], ['c', true]]
  .unique_entries_to_dict('name')

ok === Ok({ a: true, b: false, c: true })

const err = [['a', 1], ['b', 2], ['c', 3], ['a', 4]]
  .unique_entries_to_dict()

err === Err(['a', 1, 4])
```

### `unzip<L extends any[]>(this: L[]): Maybe<Unzip<L>>`

Take an array of tuples and pull it apart into a tuple of arrays. Will return `None` if the array is empty, because the function can't know how many arrays to produce.

```ts
[[1, 'a'], [2, 'b'], [3, 'c']].unzip() === Some([[1, 2, 3], ['a', 'b', 'c']])
[].unzip() === None
```

### `Array.zip_lenient<L extends any[]>(...arrays: Unzip<L>): L[]`

Takes many arrays and produces an array of tuples. If the arrays are different lengths, will just stop at the shortest one.

```ts
Array.zip_lenient([1, 2, 3], ['a', 'b', 'c']) === [[1, 'a'], [2, 'b'], [3, 'c']]

Array.zip_lenient([true, false], ['a', 'b', 'c']) === [[true, 'a'], [false, 'b']]
```

### `Array.zip_equal<L extends any[]>(...arrays: Unzip<L>): Result<L[], [number, number]>`

Attempts to take many arrays and produce an array of tuples. If the arrays are different lengths, will return `Err` with the two differing lengths that were found.

```ts
Array.zip_equal([1, 2, 3], ['a', 'b', 'c']) === Ok([[1, 'a'], [2, 'b'], [3, 'c']])

Array.zip_equal([true, false], ['a', 'b', 'c']) === Err([2, 3])
```

## `Promise<T>`

### `join<L extends any[]>(...args: PromiseTuple<L>): Promise<Unshift<T, L>>`

Joins promises together into a single promise of a tuple.

```ts
const a = async () => 'a'
const b = async () => 'b'
const c = async () => 'c'
await a().join(b(), c()) === ['a', 'b', 'c']
```

### `use_maybe(): Promise<Maybe<T>>`

Makes the promise safe by `catch`ing with `None`.

```ts
const good = async () => 'a'
const bad = async () => { throw new Error('uh oh') }
await good().use_maybe() === Some('a')
await bad().use_maybe() === None
```

### `use_result(): Promise<Result<T, Error>>`

Makes the promise safe by `catch`ing with `Err`.

```ts
const good = async () => 'a'
const bad = async () => { throw new Error('uh oh') }
await good().use_result() === Ok('a')
await bad().use_result() === Err(Error('uh oh'))
```

### `Promise.join<L extends any[]>(...args: PromiseTuple<L>): Promise<L>`

A static counterpart to `join`. Joins promises together into a single promise of a tuple.

```ts
const a = async () => 'a'
const b = async () => 'b'
const c = async () => 'c'
await Promise.join(a(), b(), c()) === ['a', 'b', 'c']
```

### `Promise.join_object<O extends { [key: string]: Promise<any> }>(obj: O): PromiseObject<O>`

Turns an object with promise attributes into a promise of an object.

```ts
const a = async () => 'a'
const b = async () => 'b'
const c = async () => 'c'
await Promise.join_object({
  a: a(),
  b: b(),
  c: c(),
}) === { a: 'a', b: 'b', c: 'c' }
```

## `Object`

### `Object.maybe_get<T>(obj: { [key: string]: T }, key: Indexable): Maybe<T>`

Get a value from a dictionary, but return a `Maybe` instead of `T | undefined` which means you can chain functions directly.

```ts
const thing = Object.maybe_get({ a: 1, b: 2, c: 3 }, 'd')
  .change(number => number * 2)
  .try_change(number => number % 3 == 0 ? Some(number) : number)

thing === None
```
