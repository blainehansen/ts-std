# `@ts-std/collections`

> `HashSet` and `HashMap` collections for typescript.

## Interfaces and Helpers

### `Hashable`

```ts
interface Hashable {
  to_hash(): number
}
```

`HashSet`s and `HashMap`s require their internal items to implement this interface.

This package has implementations for `Hashable` for both `string` and `number` so that they can be easily used in these collections, but you have to opt into them by importing those extensions.

```ts
// @ts-std/collections/dist/impl.Hashable.string
import xxhashjs from 'xxhashjs'

import { Hashable } from './common'
declare global {
  interface String extends Hashable {}
}
String.prototype.to_hash = function to_hash(): number {
  return xxhashjs.h32(this, 0).toNumber()
}

// @ts-std/collections/dist/impl.Hashable.number
import { Hashable } from './common'
declare global {
  interface Number extends Hashable {}
}
Number.prototype.to_hash = function to_hash(): number {
  return this.valueOf()
}

// your_main_file.ts
import '@ts-std/collections/dist/impl.Hashable.string'
import '@ts-std/collections/dist/impl.Hashable.number'

console.log('a'.to_hash())
console.log((1).to_hash())
```

If you have a class of your own, this is easy, just implement this interface.

```ts
class MyThing implements Hashable {
  constructor() { ... }
  to_hash(): number { ... }
}
```

If some `type` of yours has a string attribute in it, and that key is a good proxy for the identity of that object, you can proxy to that in the `Hasher` function described below.


### `function Hasher<T>(to_hash: (value: T) => number)`

This function creates a simple wrapper for any value that can be `Hashable`.

```ts
type Thing { size: number, name: string }
const Thing = Hasher((thing: Thing) => thing.name.to_hash())
const a = Thing({ size: 1, name: 'alice' })
```


## `HashSet<T extends Hashable>`

A collection where all items are unique.

### `constructor(...items: T[])`

```ts
const a = new HashSet('a', 'b', 'c', 'a')
// order is not guaranteed
a.values() === ['a', 'b', 'c']
```

### `static from<T extends Hashable>(items: T[]): HashSet<T>`

Creates a `HashSet` from an array of `Hashable` items.

```ts
const a = HashSet.from(['a', 'b', 'c', 'a'])
a.values() === ['a', 'b', 'c']
```

### `values()`

Returns a list of the internal values.

```ts
const a = HashSet.from(['a', 'b', 'c', 'a'])
a.values() === ['a', 'b', 'c']
```


### `has(item: T): boolean`

Says whether the set has a value.

```ts
const a = new HashSet('a', 'b')
a.has('a') === true
a.has('c') === false
```

### `add(item: T, ...rest: T[]): this`

Adds one or more items to a set.

```ts
const a = new HashSet()
a.add('a')
a.values() === ['a']
a.add('b', 'c')
a.values() === ['a', 'b', 'c']
```

### `size`

Size of the set.

```ts
const a = new HashSet()
b.size === 0

const b = new HashSet('a', 'b', 'c')
b.size === 3
```

### `delete(item: T, ...rest: T[]): this`

Removes one or more items from a set.

```ts
const a = new HashSet('a', 'b', 'c')
a.delete('a')
a.values() === ['b', 'c']
a.delete('b', 'c')
a.values() === []
```

### `clear(): this`

Removes all items from the set.

```ts
const a = new HashSet('a', 'b', 'c')
a.clear()
a.values() === []
```

### `set_items(items: T[]): this`

Overrides the items of the set.

```ts
const a = new HashSet('a', 'b', 'c')
a.values() === ['a', 'b', 'c']

a.set_items('d', 'e')
a.values() === ['d', 'e']
```

### `[Symbol.iterator]()`

`HashSet`s are iterable.

```ts
const a = new HashSet('a', 'b', 'c')
const v = []
for (const item of a) {
  v.push(item)
}
v === ['a', 'b', 'c']
```

### `mutate_union(other: HashSet<T>, ...rest: HashSet<T>[]): this`

Performs a set union with one or more sets, mutating `this`.

```ts
const a = new HashSet('a', 'b')
const b = new HashSet('b', 'c')
a.mutate_union(b)
a.values() === ['a', 'b', 'c']
b.values() === ['b', 'c']
```

### `union(other: HashSet<T>, ...rest: HashSet<T>[]): HashSet<T>`

Performs a set union with one or more sets.

```ts
const a = new HashSet('a', 'b')
const b = new HashSet('b', 'c')
const c = a.union(b)
a.values() === ['a', 'b']
b.values() === ['b', 'c']
c.values() === ['a', 'b', 'c']
```

### `mutate_intersection(other: HashSet<T>, ...rest: HashSet<T>[]): this`

Performs a set intersection with one or more sets, mutating `this`.

```ts
const a = new HashSet('a', 'b')
const b = new HashSet('b', 'c')
a.mutate_intersection(b)
a.values() === ['b']
b.values() === ['b', 'c']
```

### `intersection(other: HashSet<T>, ...rest: HashSet<T>[]): HashSet<T>`

Performs a set intersection with one or more sets.

```ts
const a = new HashSet('a', 'b')
const b = new HashSet('b', 'c')
const c = a.intersection(b)
a.values() === ['a', 'b']
b.values() === ['b', 'c']
c.values() === ['b']
```

### `mutate_difference(other: HashSet<T>, ...rest: HashSet<T>[]): this`

Performs a set difference with one or more sets, mutating `this`.

```ts
const a = new HashSet('a', 'b')
const b = new HashSet('b', 'c')
a.mutate_difference(b)
a.values() === ['a']
b.values() === ['b', 'c']
```

### `difference(other: HashSet<T>, ...rest: HashSet<T>[]): HashSet<T>`

Performs a set difference with one or more sets.

```ts
const a = new HashSet('a', 'b')
const b = new HashSet('b', 'c')
const c = a.difference(b)
a.values() === ['a', 'b']
b.values() === ['b', 'c']
c.values() === ['a']
```


## `HashMap<K extends Hashable, T>`

A collection that maps unique keys to values.

### `constructor(...items: [K, T][])`

```ts
const a = new HashMap(['a', true], ['b', false], ['c', true], ['a', false])
// order is not guaranteed
a.entries() === [['a', true], ['b', false], ['c', true]]
```

### `static from<K extends Hashable, T>(items: [K, T][]): HashMap<K, T>`

```ts
const a = HashMap.from([['a', true], ['b', false], ['c', true], ['a', false]])
a.entries() === [['a', true], ['b', false], ['c', true]]
```

### `entries()`

Gives an array of tuples of the maps key/value pairs.

```ts
const a = HashMap.from([['a', true], ['b', false], ['c', true], ['a', false]])
a.entries() === [['a', true], ['b', false], ['c', true]]
```

### `values()`

Gives an array of just the values.

```ts
const a = new HashMap(['a', true], ['b', false], ['c', true], ['a', false])
a.values() === [true, false, true]
```

### `keys()`

Gives an array of just the keys.

```ts
const a = new HashMap(['a', true], ['b', false], ['c', true], ['a', false])
a.keys() === ['a', 'b', 'c']
```

### `size`

The number of values.

```ts
const a = new HashMap(['a', true], ['b', false], ['c', true])
a.size === 3
```

### `has(key: K): boolean`

Says whether the set has a key.

```ts
const a = new HashMap(['a', true], ['b', false])
a.has('a') === true
a.has('c') === false
```

### `get(key: K): Maybe<T>`

Gets a `Maybe` of a key.

```ts
const a = new HashMap(['a', true], ['b', false])
a.get('a') === Some(true)
a.get('c') === None
```

### `set(key: K, item: T): this`

Sets the given key to have item.

```ts
const a = new HashMap()
a.set('a', false)
a.keys() === ['a']
a.set('c', true)
a.keys() === ['a', 'c']
```

### `delete(key: K, ...rest: K[]): this`

Removes one or more keys from the map.

```ts
const a = new HashMap(['a', true], ['b', false], ['c', true])
a.delete('a')
a.keys() === ['b', 'c']
a.delete('b', 'c')
a.keys() === []
```

### `clear(): this`

Removes all items from the map.

```ts
const a = new HashMap(['a', true], ['b', false], ['c', true])
a.clear()
a.keys() === []
```

### `set_items(items: [K, T][]): this`

Overrides the items of the map.

```ts
const a = new HashMap(['a', true], ['b', false], ['c', true])
a.keys() === ['a', 'b', 'c']

a.set_items(['d', true], ['e', false])
a.keys() === ['d', 'e']
```

### `[Symbol.iterator]()`

`HashMap`s are iterable.

```ts
const a = new HashMap(['a', true], ['b', false], ['c', true])
const v = []
for (const item of a) {
  v.push(item)
}
v === [['a', true], ['b', false], ['c', true]]
```

### `mutate_merge(other: HashMap<K, T>, ...rest: HashMap<K, T>[]): this`

Performs a merge with one or more maps, mutating `this`. Later maps take precedence.

```ts
const a = new HashMap(['a', true], ['b', true])
const b = new HashMap(['b', false], ['c', false])
a.mutate_merge(b)
a.entries() === [['a', true], ['b', false], ['c', false]]
b.entries() === [['b', false], ['c', false]]
```

### `merge(other: HashMap<K, T>, ...rest: HashMap<K, T>[]): HashMap<K, T>`

Performs a merge with one or more maps. Later maps take precedence.

```ts
const a = new HashMap(['a', true], ['b', true])
const b = new HashMap(['b', false], ['c', false])
const c = a.merge(b)
a.entries() === [['a', true], ['b', true]]
b.entries() === [['b', false], ['c', false]]
c.entries() === [['a', true], ['b', false], ['c', false]]
```

### `mutate_filter(other: HashMap<K, T>, ...rest: HashMap<K, T>[]): this`

Performs a filter from one or more maps, only leaving keys in the first map that are in all subsequent maps, mutating `this`.

```ts
const a = new HashMap(['a', true], ['b', true])
const b = new HashMap(['b', false], ['c', false])
a.mutate_filter(b)
a.entries() === [['b', true]]
b.entries() === [['b', false], ['c', false]]
```

### `filter(other: HashMap<K, T>, ...rest: HashMap<K, T>[]): HashMap<K, T>`

Performs a filter from one or more maps, only leaving keys in the first map that are in all subsequent maps.

```ts
const a = new HashMap(['a', true], ['b', true])
const b = new HashMap(['b', false], ['c', false])
const c = a.merge(b)
a.entries() === [['a', true], ['b', true]]
b.entries() === [['b', false], ['c', false]]
c.entries() === [['b', true]]
```

### `mutate_remove(other: HashMap<K, T>, ...rest: HashMap<K, T>[]): this`

Removes all keys from the original that are in any subsequent maps, mutating `this`.

```ts
const a = new HashMap(['a', true], ['b', true])
const b = new HashMap(['b', false], ['c', false])
a.mutate_filter(b)
a.entries() === [['a', true]]
b.entries() === [['b', false], ['c', false]]
```

### `remove(other: HashMap<K, T>, ...rest: HashMap<K, T>[]): HashMap<K, T>`

Removes all keys from the original that are in any subsequent maps.

```ts
const a = new HashMap(['a', true], ['b', true])
const b = new HashMap(['b', false], ['c', false])
const c = a.merge(b)
a.entries() === [['a', true], ['b', true]]
b.entries() === [['b', false], ['c', false]]
c.entries() === [['a', true]]
```

### `mutate_defaults(other: HashMap<K, T>, ...rest: HashMap<K, T>[]): this`

Adds defaults from subsequent maps, mutating `this`.

```ts
const a = new HashMap(['a', true], ['b', true])
const b = new HashMap(['b', false], ['c', false])
a.mutate_filter(b)
a.entries() === [['a', true], ['b', true], ['c', false]]
b.entries() === [['b', false], ['c', false]]
```

### `defaults(other: HashMap<K, T>, ...rest: HashMap<K, T>[]): HashMap<K, T>`

Adds defaults from subsequent maps.

```ts
const a = new HashMap(['a', true], ['b', true])
const b = new HashMap(['b', false], ['c', false])
const c = a.merge(b)
a.entries() === [['a', true], ['b', true]]
b.entries() === [['b', false], ['c', false]]
c.entries() === [['a', true], ['b', true], ['c', false]]
```
