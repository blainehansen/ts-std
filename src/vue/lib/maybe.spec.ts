import 'mocha'
import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import { Maybe, Some, None } from '@ts-std/monads'
import { expect_console } from './utils.spec'

import maybe_component from './maybe'

function mount({ maybe, tag, scoped_default, def, none }: any) {
	const propsData = {} as any
	if (maybe !== undefined) propsData.maybe = maybe
	if (tag !== undefined) propsData.tag = tag
	const scopedSlots = {} as any
	if (scoped_default !== undefined) scopedSlots.default = scoped_default
	const slots = {} as any
	if (def !== undefined) slots.default = def
	if (none !== undefined) slots.none = none

	return shallowMount(maybe_component, { propsData, scopedSlots, slots })
}

describe('maybe', () => {
	it('works', () => {
		expect(mount({
			maybe: Some(true),
			def: '<br>',
		}).html()).eql('<div><br></div>')

		expect(mount({
			maybe: Some(true),
			scoped_default: '<br>',
		}).html()).eql('<div><br></div>')

		expect(mount({
			maybe: Some(true),
			scoped_default: '<p>{{ props }}</p>',
		}).html()).eql('<div><p>true</p></div>')

		expect(mount({
			maybe: Some(true),
			none: '<br>',
		}).html()).eql('<div></div>')


		expect(mount({
			maybe: None,
			def: '<br>',
		}).html()).eql('<div></div>')

		expect(mount({
			maybe: None,
			scoped_default: '<br>',
		}).html()).eql('<div></div>')

		expect(mount({
			maybe: None,
			scoped_default: '<p>{{ props }}</p>',
		}).html()).eql('<div></div>')

		expect(mount({
			maybe: None,
			none: '<br>',
		}).html()).eql('<div><br></div>')


		expect(mount({
			maybe: Some(true),
			def: '<br>',
			none: '<img>'
		}).html()).eql('<div><br></div>')

		expect(mount({
			maybe: Some(true),
			scoped_default: '<br>',
			none: '<img>'
		}).html()).eql('<div><br></div>')

		expect(mount({
			maybe: Some(true),
			scoped_default: '<p>{{ props }}</p>',
			none: '<img>'
		}).html()).eql('<div><p>true</p></div>')


		expect(mount({
			maybe: None,
			def: '<br>',
			none: '<img>'
		}).html()).eql('<div><img></div>')

		expect(mount({
			maybe: None,
			scoped_default: '<br>',
			none: '<img>'
		}).html()).eql('<div><img></div>')

		expect(mount({
			maybe: None,
			scoped_default: '<p>{{ props }}</p>',
			none: '<img>'
		}).html()).eql('<div><img></div>')


		expect(mount({
			tag: 'span',
			maybe: Some(true),
			scoped_default: '<p>{{ props }}</p>',
			none: '<img>'
		}).html()).eql('<span><p>true</p></span>')

		expect(mount({
			tag: 'span',
			maybe: None,
			def: '<br>',
			none: '<img>'
		}).html()).eql('<span><img></span>')


		expect_console(() => mount({
			maybe: 'a',
			scoped_default: '<br>',
		}))
	})
})
