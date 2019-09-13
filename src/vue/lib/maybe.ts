import Vue, { PropOptions, VNode } from 'vue'

import { Maybe } from '@ts-actually-safe/types'

export default Vue.extend({
	name: 'maybe',

	functional: true,

	props: {
		maybe: {
			type: Object,
			validator: Maybe.is_maybe,
			required: true,
		} as PropOptions<Maybe<any, any>>,

		tag: {
			type: String,
			validator(tag: string) {
				return tag !== ''
			},
			default: 'div',
		} as PropOptions<string>,
	},

	render(el, context): VNode {
		const { tag, maybe } = context.props

		// check for existence of other slots, perhaps they aren't scoped?

		return el(
			tag,
			context.data,
			maybe.match({
				some: value => context.scopedSlots.default(value),
				// renderScopedIfPossible('default', context.scopedSlots, context.slots, value),
				none: () => context.scopedSlots.none(),
				// renderScopedIfPossible('none', context.scopedSlots, context.slots)
			}),
		)
	},
})
