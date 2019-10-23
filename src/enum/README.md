# `@ts-std/enum`

> A library that brings ergonomic, matchable, tagged unions to typescript.

[Tagged unions](https://en.wikipedia.org/wiki/Tagged_union) are an extremely convenient way to handle types that may be in one of many "states" or variants. While typescript already has a version of this with [discriminated unions](https://basarat.gitbooks.io/typescript/docs/types/discriminated-unions.html), they leave a certain amount to be desired:

- They're fairly verbose to define and to instantiate.
- You only get exhaustiveness checks if there's some ambient quality of the code that requires it. For example if you perform a `switch` in a `void` function then you have to add your own exhaustiveness check with some `never` typed function or variable.

The `Enum` function and type remove both of these problems:

```ts
import { Enum, empty, variant } from '@ts-std/enum'

// defining the shape/types of the enum...
const WebEvent = Enum({
  PageLoad: empty(),
  PageUnload: empty(),
  KeyPress: variant<number>(),
  Paste: variant<string>(),
  Click: variant<{ x: number, y: number }>(),
})
// ... makes it convenient to define the type
type WebEvent = Enum<typeof WebEvent>

let event = WebEvent.PageLoad() as WebEvent

event = WebEvent.PageLoad()
event = WebEvent.PageUnload()
event = WebEvent.KeyPress(7)
event = WebEvent.Paste('stuff')
event = WebEvent.Click({ x: 1, y: 2 })

// won't compile!! yay!!
event = 7

let keypress_count = 0

// even though these are all void functions,
// we still get exhaustiveness checks
event.match({
  PageUnload: () => { keypress_count = 0 },
  KeyPress: _code => { keypress_count += 1 },
  // use _ as the default case
  // if you remove this case, this function call won't compile!
  _: () => {}
})

// there's also the `matches` method when you only care to check one case
if (event.matches('Paste')) {
  // `matches` is a guard, so you can safely access the `content` of the variant
  console.log(event.content.toLowerCase())
}

// and of course, invalid key names aren't accepted
// so this won't compile
event.match({
  Invalid: () => 1,
  _: () => 0,
})
// nor will this
event.matches('Invalid')
```

## API

### `Enum(variant_manifest: VariantManifest, [initial_key?: keyof variant_manifest, initial_variant: content])`

The function to create an `Enum`. It has two overloads.

The first, and likely more common one, simply defines a map of variant names to their type descriptors.

```ts
function Enum(
  variant_manifest: VariantManifest,
): RequiredEnum { ... }

const State = Enum({
  Loading: empty(),
  Done: variant<number>(),
})
```

The second, that may be convenient in some cases, gives a "default" key and content that can be used to initialize a variable of the Enum's type.


```ts
function Enum(
  variant_manifest: VariantManifest,
  initial_key: keyof variant_manifest,
  initial_variant: contentof initial_key,
): DefaultableEnum { ... }

// here `State` now has a `default` method that will return a `Loading` variant
// since `Loading` is `empty`, no content has to be provided
const State = Enum({
  Loading: empty(),
  Done: variant<number>(),
}, 'Loading')

let state = State.default()
state.matches('Loading') === true

// if you provide a non-empty default variant, you have to provide initial content
const State = Enum({
  Loading: empty(),
  Done: variant<number>(),
}, 'Done', 0)

let state = State.default()
state.matches('Done') === true
state.content === 0
```

### `type Enum<E extends RequiredEnum>`

The helper type that extracts the union of all variants from an Enum.

```ts
const State = Enum({
  Loading: empty(),
  Done: variant<number>(),
})
// State === Variant<'Loading', []> | Variant<'Done', [number]>
type State = Enum<typeof State>
// now that type can be used
// this union type is automatically the return of `default` for `DefaultableEnum`s
let state = State.Loading() as State
state = State.Done()
```

### `variant<T>(): VariantDescriptor<[T]> {`

Creates a non-empty variant.

### `empty(): VariantDescriptor<[]>`

Creates an empty variant.

### `type Match<T, M extends VariantManifest> =`

The input type to `match`. It requires that either all keys of the `Enum` are covered, or that there is a `_` case for the default.

It also is generic over `T` the return type of all the case functions.


## Known Issues and Future Work

At this point, it isn't possible to create an `Enum` that contains generic variants.


