import Vue, { PropOptions, VNode } from 'vue'
import { Variant } from '@ts-std/enum'

export default Vue.extend({
	name: 'match',

	functional: true,

	props: {
		enum: {
			type: Object,
			validator: v => v instanceof Variant,
			required: true,
		} as PropOptions<Variant<unknown, string>>,

		tag: {
			type: String,
			validator(tag: string) {
				return tag !== ''
			},
			default: 'div',
		} as PropOptions<string>,
	},

	render(el, context): VNode {
		const { slots, scopedSlots, props: { tag, enum } } = context

		const variant_key = enum.key

		return el(
			tag,
			context.data,
			() => {
				if (variant_key in scopedSlots)
					return scopedSlots[variant_key](enum.content)

				const s = slots()
				if (variant_key in s)
					return s[variant_key]

				if ('_' in s)
					return s._

				throw new Error(`match failed with variant key ${variant_key}`)
			}(),
		)
	},
})
