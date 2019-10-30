import Vue, { PropOptions, VNode } from 'vue'
import { Result } from '@ts-std/monads'

export default Vue.extend({
	name: 'promise',

	data: () => ({
		resolved: false,
		ok: null as unknown | null,
		err: null as unknown | null,
	}),

	props: {
		promise: {
			type: Object,
			validator: p =>
				!p || (typeof p.then === 'function' && typeof p.catch === 'function'),
			default: null,
		} as PropOptions<Promise<Result<unknown, unknown>> | null>,

		tag: {
			type: String,
			validator(tag: string) {
				return tag !== ''
			},
			default: 'div',
		} as PropOptions<string>,
	},

	render(el): VNode {
		const { tag, $slots: slots, $scopedSlots: scopedSlots } = this

		if (scopedSlots.combined)
			return el(tag, scopedSlots.combined({
				loading: !this.resolved,
				ok: this.ok,
				err: this.err,
			}))

		if (this.err)
			return el(tag, scopedSlots.err ? scopedSlots.err(this.err) : slots.err)

		if (this.resolved)
			return el(tag, scopedSlots.default ? scopedSlots.default(this.ok) : slots.default)

		return el(tag, slots.loading)
	},

	watch: {
		promise: {
			handler(promise, oldPromise) {
				if (promise === oldPromise)
					return

				this.resolved = false
				this.err = null
				if (!promise) {
					this.ok = null
					return
				}
				promise
					.then(result => {
						result.match({
							ok: ok => { this.ok = ok },
							err: err => { this.err = err },
						})
						this.resolved = true
					})
			},
			immediate: true,
		},
	},
})
