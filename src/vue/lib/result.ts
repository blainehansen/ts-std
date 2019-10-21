import Vue, { PropOptions, VNode } from 'vue'
import { Result } from '@ts-std/monads'

export default Vue.extend({
	name: 'result',

	functional: true,

	props: {
		result: {
			type: Object,
			validator: Result.is_result,
			required: true,
		} as PropOptions<Result<unknown, unknown>>,

		tag: {
			type: String,
			validator(tag: string) {
				return tag !== ''
			},
			default: 'div',
		} as PropOptions<string>,
	},

	render(el, context): VNode {
		const { slots, scopedSlots, props: { tag, result } } = context

		return el(
			tag,
			context.data,
			result.match({
				ok: value => scopedSlots.default ? scopedSlots.default(value) : slots().default,
				err: e => scopedSlots.err ? scopedSlots.err(e) : slots().err,
			}),
		)
	},
})
