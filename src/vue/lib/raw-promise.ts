import Vue, { PropOptions, VNode } from 'vue'

import { Result } from '@ts-actually-safe/types'

import { renderScopedIfPossible } from './utils'

export default Vue.extend({
	name: 'raw-promise',

	functional: true,

	props: {
		tag: {
			type: String,
			validator(tag: string) {
				return tag !== ''
			},
			default: 'div',
		} as PropOptions<string>,

		promise: {
			type: Object,
			validator: promise =>
				promise && typeof promise.then === 'function' && typeof promise.catch === 'function',
			required: true,
		} as PropOptions<Promise<any>>,
	},

	render(el, context): VNode {
		const { tag, result } = context.props

		return el(
			tag,
			context.data,
			result.is_ok()
				? context.scopedSlots.default(result.unwrap())
				:	context.scopedSlots.err(result.unwrap_err())

			// result.is_ok()
			// 	? renderScopedIfPossible('default', context.scopedSlots, context.slots, result.unwrap())
			// 	: renderScopedIfPossible('err', context.scopedSlots, context.slots, result.unwrap_err())
		)
	},
})
