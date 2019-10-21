import { VariantDescriptor } from './common'

type MachineManifest = { [state_key: string]: MachineStateDescriptor<any> }

type ContentOf<M extends MachineManifest, K extends keyof M> =
	M[K][] extends VariantDescriptor<infer T> ? T : never

const machine_invariant_message = "Machine library type invariant broken!"

type Change<T, M extends MachineManifest, K extends keyof M> =
	| ProvidingChange<T, M, K>
	| PresetChange<T, M, K>
type ProvidingChange<T, M, extends MachineManifest, K extends keyof M> = {
	sigil: 'change',
	value: T,
	go: K,
	with: ContentOf<M, K>,
}
type PresetChange<T, M extends MachineManifest, K extends keyof M> = {
	sigil: 'change',
	value: T,
	go: ValidTransitionKeys<M, K>,
}

function change<M extends MachineManifest, K extends keyof M>(go: ValidTransitionKeys<M, K>): Change<void, M, K>
function change<T = void, M extends MachineManifest, K extends keyof M>(go: ValidTransitionKeys<M, K>, value: T): Change<T, M, K>
function change<T = void, M extends MachineManifest, K extends keyof M>(go: ValidTransitionKeys<M, K>, value?: T) {
	return { value: value === undefined ? undefined as void : value, go }
}

type CompleteMatch<T, M extends MachineManifest> =
	{ [K in keyof M]: (input: ContentOf<M, K>) => T | Change<T, M, K> }

export type Match<T, M extends MachineManifest> =
	| CompleteMatch<T, M>
	| Partial<CompleteMatch<T, M>> & { _: () => T | Change<T, M, K> }

class ConcreteMachine<M extends MachineManifest> {
	constructor(
		// protected readonly machine_enum: MachineEnum<M>,
		readonly manifest: M,
		protected machine_state: { key: keyof M, state: MachineVariants<M> },
	) {}

	match<T>(match_manifest: Match<T, M>): T {
		const f = match_manifest[this.machine_state.key]
		if (f) {
			const change = f(this.content)
			if (change.sigil === 'change') {
				const { value, go: to_key } = change
				const state_descriptor = manifest[this.key]
				const transitor = state_descriptor.transitions.transitor
					|| state_descriptor.variant_descriptor.initializer
					|| () => undefined

				return [new ConcreteState(to_key, transitor(this.content)), value]
			}

			return [this, change]
		}

		const def = match_manifest._
		// DANGER: test to ensure type invariant holds
		if (def)
			return (def as unknown as () => T)()

		throw new Panic(machine_invariant_message)

		const [new_state, give] = this.machine_state.match(manifest, match_manifest)
		this.machine_state = new_state
		return give
	}
}

class StateMachine<M extends MachineManifest, IK extends keyof M> {
	protected readonly machine_enum: MachineEnum<M>
	constructor(
		readonly manifest: M,
		initial_key: I,
		initial_state: Initializer<ContentOf<M, IK>>,
	) {
		const variant_manifest = {} as MachineVariantManifest<M>
		for (const key in manifest) {
			variant_manifest[key] = manifest[key].variant_descriptor.variant
		}
		this.machine_enum = Enum(variant_manifest, initial_key, initial_state)
	}

	// start(initial_key?:, initial_state?:): ConcreteMachine<M>
	// start<K extends keyof M>(initial_key: K, initial_state?): ConcreteMachine<M>
	start(): ConcreteMachine<M> {
		// return new ConcreteMachine(this.manifest, this.initial_key, this.initial_state)
		return new ConcreteMachine(this.manifest, this.machine_enum.initialize())
	}
}

function Machine<M extends MachineManifest, I extends keyof M>(
	manifest: M,
	initial_key: I,
	initial_state: Initializer<ContentOf<M, IK>>,
) {
	return new StateMachine(manifest, initial_key, initial_state)
}


type MachineVariantDescriptor<T> =
	| InitializableVariantDescriptor<T>
	| RequiredVariantDescriptor<T>

type InitializableVariantDescriptor<T> = {
	variant: VariantDescriptor<T>,
	initializer: () => T,
}
type RequiredVariantDescriptor<T> = Omit<InitializableVariantDescriptor, 'initializer'>


type MachineStateDescriptor<S, M extends MachineManifest, R extends Transition<M, unknown, unknown>[]> = {
	variant_descriptor: MachineVariantDescriptor<S>,
	transitions: R,
}

function state<S, M extends MachineManifest, R extends Transition<M, unknown, unknown>[]>(
	variant_descriptor: MachineVariantDescriptor<S>,
	...transitions: R,
): MachineStateDescriptor<M> {
	return { variant_descriptor, transitions }
}

type Transition<M extends MachineManifest, F extends keyof M, T extends keyof M> = {
	to_key: T,
	transitor: (cur: ContentOf<M, F>) => ContentOf<M, T>
}

// entry_func: () => void, exit_func: (content: T) => void

function content<T>(init: Initializer<T>): InitializableVariantDescriptor<T>
function content<T = void>(): [T] extends [void] ? InitializableVariantDescriptor<T> : RequiredVariantDescriptor<T>
function content<T>(init?: Initializer<T>) {
	const variant = {} as VariantDescriptor<T>
	if (init === undefined)
		return { variant }

	const initializer = typeof init === 'function'
		? init
		: () => init
	return { variant, initializer } as InitializableVariantDescriptor<T>
}

type InitializableStateKeys<M extends MachineManifest> = {
	[K in keyof M]: M[K] extends InitializableVariantDescriptor<any> ? K : never
}[keyof M]

function transition<M extends MachineManifest, F extends keyof M, T extends InitializableStateKeys<M>>(
	to_key: T,
): Transition<M, F, T>

function transition<M extends MachineManifest, F extends keyof M, T extends keyof M>(
	to_key: T,
	transitor: (current: ContentOf<M, F>) => ContentOf<M, T>
): Transition<M, F, T>

function transition<M extends MachineManifest, F extends keyof M, T extends keyof M>(
	to_key: T,
	transitor?: (current: ContentOf<M, F>) => ContentOf<M, T>
) {
	// if (transitor === undefined) return { to_key, transitor: () => undefined as ContentOf<M, T> }
	return { to_key, transitor }
}


const Robot = Machine('inactive', {
	inactive: state(
		content(() => do_exit()),
		transition('active'),
	),
	active: state(
		// seconds running
		content(0),
		transition('inactive', cur => {
			return next
		}),
	),
})
type Robot = typeof Robot

const r = Robot.start()

const toggle = (robot: Robot) => robot.match({
	inactive: state => change('active'),
	active: state => {
		console.log(state / 60)
		return change('inactive')
	},
})
