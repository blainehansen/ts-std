import 'mocha'
import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import { Maybe, Some, None } from '@ts-actually-safe/monads'

import maybe_component from './maybe'

function mount({ maybe, tag, scoped_default, scoped_none, def, none }: any) {
	const propsData = {} as any
	if (maybe !== undefined) propsData.maybe = maybe
	if (tag !== undefined) propsData.tag = tag
	const scopedSlots = {} as any
	if (scoped_default !== undefined) scopedSlots.default = scoped_default
	if (scoped_none !== undefined) scopedSlots.none = scoped_none
	const slots = {} as any
	if (def !== undefined) slots.default = def
	if (none !== undefined) slots.none = none

	return shallowMount(maybe_component, { propsData, scopedSlots, slots })
}

describe('maybe', () => {
	it('works', () => {
		const a = mount({
			maybe: Some(true),
			scoped_default: '<p>ok</p>',
		})
		expect(a.html()).eql('<div><p>ok</p></div>')

		const b = mount({
			maybe: None,
			scoped_default: '<p>ok</p>',
		})
		expect(b.html()).eql('<div></div>')
	})
})
