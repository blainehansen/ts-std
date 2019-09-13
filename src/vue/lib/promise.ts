import Vue, { PropOptions, VNode } from 'vue'

import { Result } from '@ts-actually-safe/types'

export default Vue.extend({
	name: 'result',

	data() {
		return {
			loading: false,
		}
	},

	props: {
		result: {
			type: Object,
			validator: p =>
        p && typeof p.then === 'function' && typeof p.catch === 'function',
			required: true,
		} as PropOptions<Promise<Result<any, any>>>,

		tag: {
			type: String,
			validator(tag: string) {
				return tag !== ''
			},
			default: 'div',
		} as PropOptions<string>,
	},

	watch: {

	},

	render(el): VNode {
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
