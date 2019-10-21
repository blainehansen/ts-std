import 'mocha'
import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import { Result, Ok, Err } from '@ts-std/monads'
import { expect_console } from './utils.spec'

import result_component from './result'

function mount({ result, tag, scoped_default, def, scoped_err, err }: any) {
	const propsData = {} as any
	if (result !== undefined) propsData.result = result
	if (tag !== undefined) propsData.tag = tag
	const scopedSlots = {} as any
	if (scoped_default !== undefined) scopedSlots.default = scoped_default
	if (scoped_err !== undefined) scopedSlots.err = scoped_err
	const slots = {} as any
	if (def !== undefined) slots.default = def
	if (err !== undefined) slots.err = err

	return shallowMount(result_component, { propsData, scopedSlots, slots })
}

describe('result', () => {
	it('works', () => {
		expect(mount({
			result: Ok(true),
			def: '<br>',
		}).html()).eql('<div><br></div>')

		expect(mount({
			result: Ok(true),
			scoped_default: '<br>',
		}).html()).eql('<div><br></div>')

		expect(mount({
			result: Ok(true),
			scoped_default: '<p>{{ props }}</p>',
		}).html()).eql('<div><p>true</p></div>')

		expect(mount({
			result: Ok(true),
			err: '<br>',
		}).html()).eql('<div></div>')

		expect(mount({
			result: Ok(true),
			scoped_err: '<br>',
		}).html()).eql('<div></div>')

		expect(mount({
			result: Ok(true),
			scoped_err: '<p>{{ props }}</p>',
		}).html()).eql('<div></div>')


		expect(mount({
			result: Err('bad'),
			def: '<br>',
		}).html()).eql('<div></div>')

		expect(mount({
			result: Err('bad'),
			scoped_default: '<br>',
		}).html()).eql('<div></div>')

		expect(mount({
			result: Err('bad'),
			scoped_default: '<p>{{ props }}</p>',
		}).html()).eql('<div></div>')

		expect(mount({
			result: Err('bad'),
			err: '<br>',
		}).html()).eql('<div><br></div>')

		expect(mount({
			result: Err('bad'),
			scoped_err: '<br>',
		}).html()).eql('<div><br></div>')

		expect(mount({
			result: Err('bad'),
			scoped_err: '<p>{{ props }}</p>',
		}).html()).eql('<div><p>bad</p></div>')


		expect(mount({
			result: Ok(true),
			def: '<br>',
			err: '<img>'
		}).html()).eql('<div><br></div>')

		expect(mount({
			result: Ok(true),
			scoped_default: '<br>',
			err: '<img>'
		}).html()).eql('<div><br></div>')

		expect(mount({
			result: Ok(true),
			scoped_default: '<p>{{ props }}</p>',
			err: '<img>'
		}).html()).eql('<div><p>true</p></div>')

		expect(mount({
			result: Ok(true),
			scoped_default: '<p>{{ props }}</p>',
			scoped_err: '<img>'
		}).html()).eql('<div><p>true</p></div>')

		expect(mount({
			result: Ok(true),
			scoped_default: '<p>{{ props }}</p>',
			scoped_err: '<p>{{ props }}</p>'
		}).html()).eql('<div><p>true</p></div>')


		expect(mount({
			result: Err('bad'),
			def: '<br>',
			err: '<img>'
		}).html()).eql('<div><img></div>')

		expect(mount({
			result: Err('bad'),
			scoped_default: '<br>',
			err: '<img>'
		}).html()).eql('<div><img></div>')

		expect(mount({
			result: Err('bad'),
			scoped_default: '<p>{{ props }}</p>',
			err: '<img>'
		}).html()).eql('<div><img></div>')

		expect(mount({
			result: Err('bad'),
			scoped_default: '<p>{{ props }}</p>',
			scoped_err: '<img>'
		}).html()).eql('<div><img></div>')

		expect(mount({
			result: Err('bad'),
			scoped_default: '<p>{{ props }}</p>',
			scoped_err: '<p>{{ props }}</p>'
		}).html()).eql('<div><p>bad</p></div>')


		expect(mount({
			tag: 'span',
			result: Ok(true),
			scoped_default: '<p>{{ props }}</p>',
			err: '<img>'
		}).html()).eql('<span><p>true</p></span>')

		expect(mount({
			tag: 'span',
			result: Ok(true),
			scoped_default: '<p>{{ props }}</p>',
			scoped_err: '<p>{{ props }}</p>'
		}).html()).eql('<span><p>true</p></span>')

		expect(mount({
			tag: 'span',
			result: Err('bad'),
			def: '<br>',
			scoped_err: '<p>{{ props }}</p>'
		}).html()).eql('<span><p>bad</p></span>')

		expect(mount({
			tag: 'span',
			result: Err('bad'),
			scoped_default: '<p>{{ props }}</p>',
			scoped_err: '<p>{{ props }}</p>'
		}).html()).eql('<span><p>bad</p></span>')


		expect_console(() => mount({
			result: 'a',
			scoped_default: '<br>',
		}))
	})
})

