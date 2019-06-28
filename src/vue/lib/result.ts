import Vue, { PropOptions, VNode } from 'vue'

import { Result } from '@ts-actually-safe/types'

export default Vue.extend({
	name: 'result',

	functional: true,

	props: {
		result: {
			type: Object,
			validator: Result.is_result,
			required: true,
		} as PropOptions<Result<any, any>>,

		tag: {
			type: String,
			validator(tag: string) {
				return tag !== ''
			},
			default: 'div',
		} as PropOptions<string>,
	},

	render(el, context): VNode {
		const { tag, result } = context.props

		// check for existence of other slots, perhaps they aren't scoped?

		return el(
			tag,
			context.data,
			result.is_ok()
				? context.scopedSlots.default(result.unwrap())
				:	context.scopedSlots.err(result.unwrap_err())
		)
	},
})
