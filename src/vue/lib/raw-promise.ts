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
			result.match({
				ok: value => context.scopedSlots.default(value),
				// renderScopedIfPossible('default', context.scopedSlots, context.slots, value),
				err: e => context.scopedSlots.err(e),
				// renderScopedIfPossible('err', context.scopedSlots, context.slots, e)
			}),
		)
	},
})
