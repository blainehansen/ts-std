import Vue, { PropOptions, VNode } from 'vue'
import { Maybe } from '@ts-std/monads'

export default Vue.extend({
	name: 'maybe',

	functional: true,

	props: {
		maybe: {
			type: Object,
			validator(v) {
				return Maybe.is_maybe(v)
			},
			required: true,
		} as PropOptions<Maybe<unknown>>,

		tag: {
			type: String,
			validator(tag: string) {
				return tag !== ''
			},
			default: 'div',
		} as PropOptions<string>,
	},

	render(el, context): VNode {
		const { slots, scopedSlots, props: { tag, maybe } } = context

		return el(
			tag,
			context.data,
			maybe.match({
				some: value => scopedSlots.default ? scopedSlots.default(value) : slots().default,
				none: () => slots().none,
			}),
		)
	},
})
