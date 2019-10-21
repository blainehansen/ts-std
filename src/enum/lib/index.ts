class Panic extends Error {}
const enum_invariant_message = "Enum library invariant broken!"

type VariantManifest = { [variant_key: string]: VariantDescriptor<PossibleArgs> }
type Variants<M extends VariantManifest> = ConcreteVariant<M, keyof M>

type ArgsOf<M extends VariantManifest, K extends keyof M> =
	M[K] extends VariantDescriptor<infer T> ? T : never

// type Initializer<T> = T | () => T

type PossibleArgs = [] | [any]
type VariantDescriptor<A extends PossibleArgs> = {}


export function empty(): VariantDescriptor<[]> {
	return {}
}

export function variant<T>(): VariantDescriptor<[T]> {
	return {}
}

type CompleteMatch<T, M extends VariantManifest> =
	{ [K in keyof M]: M[K] extends VariantDescriptor<infer I> ? (...arg: I) => T : never }

export type Match<T, M extends VariantManifest> =
	| CompleteMatch<T, M>
	| Partial<CompleteMatch<T, M>> & { _: () => T }


type Value<A extends PossibleArgs> = A extends [infer T] ? T : void

class ConcreteVariant<M extends VariantManifest, K extends keyof M> {
	readonly content: Value<ArgsOf<M, K>>
	constructor(readonly key: K, args: ArgsOf<M, K>) {
		const content = args[0]
		this.content = content !== undefined ? content : undefined as void
	}

	match<T>(match_manifest: Match<T, M>): T {
		const f = match_manifest[this.key]
		if (f)
			return this.content === undefined ? f() : f(this.content)

		const def = match_manifest._
		// DANGER: test to ensure type invariant holds
		if (def)
			return (def as unknown as () => T)()

		throw new Panic(enum_invariant_message)
	}
}


type RequiredEnum<M extends VariantManifest> =
	{ [K in keyof M]: (...variant: ArgsOf<M, K>) => ConcreteVariant<M, K> }

type DefaultableEnum<M extends VariantManifest, IK extends keyof M> =
	RequiredEnum<M>
	& { default(): Variants<M> }


type ManifestProducer<G extends unknown[], M extends VariantManifest> = <G, M = M>() => M
// const manifest = typeof variant_manifest === 'function' ? variant_manifest() : variant_manifest
// export type Enum<V extends RequiredEnum<VariantManifest>, G extends unknown[] = []> =

export function Enum<M extends VariantManifest, K extends keyof M> (
	variant_manifest: M,
	initial_key: K,
	...initial_variant: ArgsOf<M, K>
): DefaultableEnum<M, K>

export function Enum<M extends VariantManifest>(
	variant_manifest: M,
): RequiredEnum<M>

export function Enum<M extends VariantManifest, K extends keyof M>(
	variant_manifest: M,
	initial_key?: K, ...initial_variant: ArgsOf<M, K>
) {
	const base_enum = {} as RequiredEnum<M>
	for (const variant_key in variant_manifest) {
		base_enum[variant_key] = (...args) => new ConcreteVariant(variant_key, args)
	}

	if (initial_key !== undefined) {
		const defaultable_enum = base_enum as DefaultableEnum<M, K>
		defaultable_enum.default = () => new ConcreteVariant(initial_key, initial_variant) as Variants<M>
		return defaultable_enum
	}

	return base_enum
}

export type Enum<V extends RequiredEnum<VariantManifest>> =
	V extends RequiredEnum<infer M>
	? M extends VariantManifest ? Variants<M>
	: never
	: never
