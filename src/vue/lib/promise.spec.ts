import 'mocha'
import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import { Result, Ok, Err } from '@ts-std/monads'
import { expect_console } from './utils.spec'

import promise_component from './promise'

function mount({ promise, tag, combined, scoped_default, def, scoped_err, err }: any) {
	const propsData = {} as any
	if (promise !== undefined) propsData.promise = promise
	if (tag !== undefined) propsData.tag = tag
	const scopedSlots = {} as any
	if (combined !== undefined) scopedSlots.combined = combined
	if (scoped_default !== undefined) scopedSlots.default = scoped_default
	if (scoped_err !== undefined) scopedSlots.err = scoped_err
	const slots = {} as any
	if (def !== undefined) slots.default = def
	if (err !== undefined) slots.err = err

	return shallowMount(promise_component, { propsData, scopedSlots, slots })
}

describe('promise', () => {
	it('works', () => {
		expect(mount({
			promise: Promise.resolve(Ok(true)),
			def: '<br>',
		}).html()).eql('<div><br></div>')

		expect(mount({
			promise: Promise.resolve(Ok(true)),
			scoped_default: '<br>',
		}).html()).eql('<div><br></div>')

		expect(mount({
			promise: Promise.resolve(Ok(true)),
			scoped_default: '<p>{{ props }}</p>',
		}).html()).eql('<div><p>true</p></div>')

		expect(mount({
			promise: Promise.resolve(Ok(true)),
			err: '<br>',
		}).html()).eql('<div></div>')

		expect(mount({
			promise: Promise.resolve(Ok(true)),
			scoped_err: '<br>',
		}).html()).eql('<div></div>')

		expect(mount({
			promise: Promise.resolve(Ok(true)),
			scoped_err: '<p>{{ props }}</p>',
		}).html()).eql('<div></div>')


		expect(mount({
			promise: Promise.resolve(Err('bad')),
			def: '<br>',
		}).html()).eql('<div></div>')

		expect(mount({
			promise: Promise.resolve(Err('bad')),
			scoped_default: '<br>',
		}).html()).eql('<div></div>')

		expect(mount({
			promise: Promise.resolve(Err('bad')),
			scoped_default: '<p>{{ props }}</p>',
		}).html()).eql('<div></div>')

		expect(mount({
			promise: Promise.resolve(Err('bad')),
			err: '<br>',
		}).html()).eql('<div><br></div>')

		expect(mount({
			promise: Promise.resolve(Err('bad')),
			scoped_err: '<br>',
		}).html()).eql('<div><br></div>')

		expect(mount({
			promise: Promise.resolve(Err('bad')),
			scoped_err: '<p>{{ props }}</p>',
		}).html()).eql('<div><p>bad</p></div>')


		expect(mount({
			promise: Promise.resolve(Ok(true)),
			def: '<br>',
			err: '<img>'
		}).html()).eql('<div><br></div>')

		expect(mount({
			promise: Promise.resolve(Ok(true)),
			scoped_default: '<br>',
			err: '<img>'
		}).html()).eql('<div><br></div>')

		expect(mount({
			promise: Promise.resolve(Ok(true)),
			scoped_default: '<p>{{ props }}</p>',
			err: '<img>'
		}).html()).eql('<div><p>true</p></div>')

		expect(mount({
			promise: Promise.resolve(Ok(true)),
			scoped_default: '<p>{{ props }}</p>',
			scoped_err: '<img>'
		}).html()).eql('<div><p>true</p></div>')

		expect(mount({
			promise: Promise.resolve(Ok(true)),
			scoped_default: '<p>{{ props }}</p>',
			scoped_err: '<p>{{ props }}</p>'
		}).html()).eql('<div><p>true</p></div>')


		expect(mount({
			promise: Promise.resolve(Err('bad')),
			def: '<br>',
			err: '<img>'
		}).html()).eql('<div><img></div>')

		expect(mount({
			promise: Promise.resolve(Err('bad')),
			scoped_default: '<br>',
			err: '<img>'
		}).html()).eql('<div><img></div>')

		expect(mount({
			promise: Promise.resolve(Err('bad')),
			scoped_default: '<p>{{ props }}</p>',
			err: '<img>'
		}).html()).eql('<div><img></div>')

		expect(mount({
			promise: Promise.resolve(Err('bad')),
			scoped_default: '<p>{{ props }}</p>',
			scoped_err: '<img>'
		}).html()).eql('<div><img></div>')

		expect(mount({
			promise: Promise.resolve(Err('bad')),
			scoped_default: '<p>{{ props }}</p>',
			scoped_err: '<p>{{ props }}</p>'
		}).html()).eql('<div><p>bad</p></div>')


		expect(mount({
			tag: 'span',
			promise: Promise.resolve(Ok(true)),
			scoped_default: '<p>{{ props }}</p>',
			err: '<img>'
		}).html()).eql('<span><p>true</p></span>')

		expect(mount({
			tag: 'span',
			promise: Promise.resolve(Ok(true)),
			scoped_default: '<p>{{ props }}</p>',
			scoped_err: '<p>{{ props }}</p>'
		}).html()).eql('<span><p>true</p></span>')

		expect(mount({
			tag: 'span',
			promise: Promise.resolve(Err('bad')),
			def: '<br>',
			scoped_err: '<p>{{ props }}</p>'
		}).html()).eql('<span><p>bad</p></span>')

		expect(mount({
			tag: 'span',
			promise: Promise.resolve(Err('bad')),
			scoped_default: '<p>{{ props }}</p>',
			scoped_err: '<p>{{ props }}</p>'
		}).html()).eql('<span><p>bad</p></span>')


		expect_console(() => mount({
			promise: Promise.resolve('a'),
			scoped_default: '<br>',
		}))
	})
})

