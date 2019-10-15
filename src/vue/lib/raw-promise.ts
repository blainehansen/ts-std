import Vue, { PropOptions, VNode } from 'vue'


export default Vue.extend({
	name: 'raw-promise',

	data: () => ({
		resolved: false,
		ok: null as unknown | null,
		err: null as Error | null,
	}),

	props: {
		promise: {
			type: Object,
			validator: p =>
				!p || (typeof p.then === 'function' && typeof p.catch === 'function'),
			default: null,
		} as PropOptions<Promise<unknown> | null>,

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
					.then(ok => {
						this.ok = ok
						this.resolved = true
					})
					.catch(err => {
						this.err = err
						this.resolved = true
					})
			},
			immediate: true,
		},
	},
})
