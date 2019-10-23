# `@ts-std/codec`

> A convenient and highly type-safe typescript decoder library.

This library makes it simple to create decoders/validators for unknown input. Various decoders and combinators are exposed, that allow you to construct arbitrarily complex types.

```ts
import * as c from '@ts-std/codec'
import { Result, Ok, Err } from '@/ts-std/monads'

const Person = c.object('Person', {
  name: c.string,
  hobbies: c.array(c.object('Hobby', {
    name: c.string,
    years: c.optional(c.number)
  }))
})
type Person = c.TypeOf<typeof Person>

const ok: Result<Person> = Person.decode({
  name: 'Alice',
  hobbies: [{
    name: 'Hiking',
    years: 3,
  }, {
    name: 'Piano',
  }]
})
ok === Ok(...)

const err: Result<Person> = Person.decode({})
err === Err("expected object Person, got {}")
```

This library is most useful when decoding unknown things from the outside world, such as files, environment variables, or incoming http request bodies.

```ts
const password: string =
  Result.from_nillable(process.env.CONFIG_JSON, 'CONFIG_JSON is unset')
  .try_change(env => Result.attempt(() => JSON.parse(env)))
  .change_err(e => e.message)
  .try_change((json: unknown) => c.string.decode(json))
  .expect('invalid CONFIG_JSON')
```

## Common Types

### `abstract class Decoder<T>`

This abstract class defines the interface for all decoders.

```ts
abstract class Decoder<T> {
  abstract readonly name: string
  abstract decode(input: unknown): Result<T>

  // this has a default implementation
  guard(input: unknown): input is T
}
```

### `type TypeOf<D extends Decoder<unknown>> = D extends Decoder<infer T> ? T : never`

Extracts the type of the decoder. Useful when you would like to construct a decoder first, and use the type it defines.

```ts
type A = c.TypeOf<typeof c.string> // === string
const NumberOrBoolean = c.union(c.number, c.boolean)
type NumberOrBoolean = c.TypeOf<typeof NumberOrBoolean> // === number | boolean
const = ''
```

<!-- ### `type DecoderTuple<L extends unknown[]>` -->

## Static Decoders

<!-- ### `const always = new WrapDecoder(` -->
<!-- ### `const never = new WrapDecoder(` -->

### `string: Decoder<string>`

Decodes strings.

```ts
c.string.decode('a') === Ok('a')
```

### `boolean: Decoder<boolean>`

Decodes booleans.

```ts
c.string.decode(true) === Ok(true)
```

### `number: Decoder<number>`

Decodes numbers. Doesn't allow any form of `NaN` or `Infinity`.

```ts
c.string.decode(1.1) === Ok(1.1)
```

### `loose_number: Decoder<number>`

Decodes numbers. Does allow any form of `NaN` or `Infinity`.

```ts
c.string.decode(NaN) === Ok(NaN)
```

### `int: Decoder<number>`

Decodes numbers if they have no decimal component.

```ts
c.int.decode(-1) === Ok(-1)
```

### `uint: Decoder<number>`

Decodes numbers if they have no decimal component and are positive.

```ts
c.int.decode(1) === Ok(1)
```

### `undefined_literal: Decoder<undefined>`

Decodes undefined.

```ts
c.string.decode(undefined) === Ok(undefined)
```

### `null_literal: Decoder<null>`

Decodes null.

```ts
c.string.decode(null) === Ok(null)
```


## Decoder Combinators

### `wrap<T>(name: string, decoder_func: (input: unknown) => Result<T>): Decoder<T>`

The most general combinator. Takes a function that converts from `unknown` to `Result<T>`.

```ts
const OnlyEven = c.wrap('OnlyEven', input => {
  return c.number.decode(input)
    .try_change(n => n % 2 === 0 ? Ok(n) : Err('number must be even'))
})
```

### `array<T>(decoder: Decoder<T>): Decoder<T[]>`

Creates an array decoder from an internal decoder.

```ts
const NumberArray = c.array(c.number)
```

### `dictionary<T>(decoder: Decoder<T>): Decoder<Dict<T>>`

Creates a decoder of `{ [key: string]: T }` from an internal decoder.

```ts
const NumberDict = c.dict(c.number)
```

### `tuple<L extends unknown[]>(...decoders: DecoderTuple<L>): Decoder<L>`

Creates a tuple decoder from some set of internal decoders.

```ts
const StrNumBool = c.tuple(c.string, c.number, c.boolean)
StrNumBool.decode(['a', 1, true]) === Ok(...)
```

### `object<O>(name: string, decoders: DecoderObject<O>): Decoder<O>`

Creates a decoder specified by the shape of the incoming object. Doesn't allow extra keys.

```ts
const Person = c.object('Person', { name: c.string, height: c.number })
Person.decode({ name: 'Alice', height: 6 }) === Ok(...)
Person.decode({ name: 'Alice', height: 6, weight: 120 }) === Err("...")
```

### `loose_object<O>(name: string, decoders: DecoderObject<O>): Decoder<O>`

Creates a decoder specified by the shape of the incoming object. Does allow extra keys, but both the output type and the output value won't include them

```ts
const Person = c.object('Person', { name: c.string, height: c.number })
Person.decode({ name: 'Alice', height: 6 }) === Ok(...)

const had_extra = Person.decode({ name: 'Alice', height: 6, weight: 120 }).expect("")
// won't compile
had_extra.weight
```

### `union(...decoders: DecoderTuple): Decoder<T | U | ...>`

Creates a decoder for the union type of all input decoders.

```ts
const NumOrBoolOrStr = c.union(c.number, c.boolean, c.string)
// number | boolean | string
type NumOrBoolOrStr = c.TypeOf<typeof NumOrBoolOrStr>
const
NumOrBoolOrStr.decode(1) === Ok(1)
NumOrBoolOrStr.decode(true) === Ok(true)
NumOrBoolOrStr.decode('a') === Ok('a')
```

### `literal<V extends Primitives>(value: V): Decoder<V>`

Creates a decoder for an exact value. Must be `string | boolean | number | null | undefined`.

```ts
const OnlyOne = c.literal(1)
// 1
type OnlyOne = c.TypeOf<typeof OnlyOne>
const ok = OnlyOne.decode(1)
const err = OnlyOne.decode(2)
```

### `literals<V extends Primitives>(...values: V[]): Decoder<V[0] | V[1] | ...>`

Creates a decoder for the union of several exact values. Must all be `string | boolean | number | null | undefined`.

```ts
const OneOrAOrTru = c.literals(1, 'a', true)
// 1 | 'a' | true
type OnlyOne = c.TypeOf<typeof OnlyOne>
const ok = OnlyOne.decode(1)
const ok = OnlyOne.decode('a')
const ok = OnlyOne.decode(true)
const err = OnlyOne.decode(2)
```


### `optional<T>(decoder: Decoder<T>): Decoder<T | undefined>`

Creates a decoder for the optional version of the input decoder.

```ts
c.optional(c.number)
```

### `nullable<T>(decoder: Decoder<T>): Decoder<T | null>`

Creates a decoder for the nullable version of the input decoder.

```ts
c.nullable(c.number)
```

### `nillable<T>(decoder: Decoder<T>): Decoder<T | null | undefined>`

Creates a decoder for the nillable version of the input decoder.

```ts
c.nillable(c.number)
```

### `maybe<T>(decoder: Decoder<T>): Decoder<Maybe<T>>`

Creates a decoder that can adapt `T | null | undefined` to `Maybe<T>`. This is mostly useful when nesting this decoder within other structures.

```ts
import { Maybe, Some, None } from '@ts-std/monads'
const MaybeNumber = c.maybe(c.number)
MaybeNumber.decode(1) === Ok(Some(1))
MaybeNumber.decode(null) === Ok(None)
MaybeNumber.decode(undefined) === Ok(None)

MaybeNumber.decode('a') === Err(...)

const Person = c.object({
  name: c.string,
  height: c.number,
  weight: MaybeNumber,
})

const ok = Person.decode({
  name: 'Alice',
  height: 2,
  weight: null,
})
ok === Ok({
  name: 'Alice',
  height: 2,
  weight: None,
})
```

If you find yourself in a situation where you'd like to decode a simple value to a `Maybe`, instead of trying to flatten or extract the maybe from the result, just decode and use the `ok_maybe` method of `Result`, which converts `Ok` to `Some` and `Err` to `None`.

```ts
c.number
  .decode(process.env.CONFIG_NUMBER)
  .ok_maybe()
  .match({
    some: n => console.log('Yay got a valid number!'),
    none: () => console.error('Boo number was invalid or not present!'),
  })
```

## Serializable Classes

All the decoders here are for "static" types, or things that simply describe their shape. What happens when you want a custom class to be decodable?

One way is to just have your class extend `Decoder`:

```ts
class A { constructor(readonly name: string, height: ) }
```

However, with the `Codec` interface and the `cls` combinator, you can easily produce a class that is easy to encode and decode using the normal constructor for your class.

```ts
class A implements c.Codec {
  constructor(readonly x: number, readonly y: string) {}
  static decode = c.tuple(c.number, c.string)
  encode() {
    return t(this.x, this.y)
  }

  static decoder: c.Decoder<A> = c.cls(A)
}

const original = new A(1, 2)

const json = JSON.stringify(original.encode())
const decoded =
  Result.attempt(() => JSON.parse(json))
  .try_change(json => A.decoder.decode(json))

decoded === Ok(original)
```

### `cls<T extends Codec>(cn: CodecConstructor<T>): Decoder<T>`

Creates a decoder from a class that implements `Codec`.

### `interface Codec`

```ts
interface Codec<L extends unknown[] = unknown[]> {
  // new (...args: L): T
  static decoder: Decoder<L>
  encode(): L
}
```


## Adaptation/Conversion

Often we don't need input to be in exactly the form we expect, but can work with many different types. These adaptation helpers can create decoders that are lenient and try multiple ways of producing the same thing.

### `adapt(decoder: Decoder<T>, ...adaptors: AdaptorTuple<T>)`

Produce an adapting decoder from a base decoder and some set of adaptors. Adaptors are functions that can convert to our goal of `T` through some other type `U`.

Adaptors can be both "safe", so never fail to convert from `T` to `U`; or they can be fallible, so they sometimes will fail and produce `Result<T>` instead.

When creating adaptors, we also have to provide `U`'s base decoder, so we can attempt to go from `unknown` to `U`.

```ts
const LenientBool = c.adapt(
  c.boolean,
  // we can always get a boolean from a number
  c.adaptor(c.number, n => n === 0),
  // we can sometimes get a boolean from a string
  c.try_adaptor(c.string, s => {
    if (s === 'true') return Ok(true)
    if (s === 'false') return Ok(false)
    return Err("couldn't convert from string to boolean")
  }),
)

LenientBool.decode(true) === Ok(true)
LenientBool.decode(false) === Ok(false)
LenientBool.decode(1) === Ok(true)
LenientBool.decode(0) === Ok(false)
LenientBool.decode('true') === Ok(true)
LenientBool.decode('false') === Ok(false)

LenientBool.decode('whatup') === Err(...)
```

### `adaptor<U, T>(decoder: Decoder<U>, func: (input: U) => T): SafeAdaptor<U, T>`

Creates an adaptor from `U` to `T` that never fails.

```ts
c.adaptor(c.number, n => n === 0)
```

### `try_adaptor<U, T>(decoder: Decoder<U>, func: (input: U) => Result<T>): FallibleAdaptor<U, T>`

Creates an adaptor from `U` to `T` that sometimes fails.

```ts
c.try_adaptor(c.string, s => {
  if (s === 'true') return Ok(true)
  if (s === 'false') return Ok(false)
  return Err("couldn't convert from string to boolean")
})
```

<!-- ## Generic Serialization -->

<!-- ### `abstract class Serializer` -->
<!-- ### `class JsonSerializer extends Serializer` -->
