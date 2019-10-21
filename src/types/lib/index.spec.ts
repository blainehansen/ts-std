import 'mocha'
import { expect } from 'chai'

import {
	assert_boolean_type, assert_is_type, assert_is_never, assert_type, assert_value_types,
	Unshift, KeysOfType, PickOfType, Head, Tail, HasTail, Last, OnlyOne, SingleParameter, FoldingFunctions,
	tuple,
} from './index'

describe('Just going to be various type assertions. They should all compile', () => {
	it('assert_boolean_type', () => {
		assert_boolean_type<true>(true)
		assert_boolean_type<false>(false)
		assert_boolean_type<boolean>(false)

		type E<T, U> = T extends U ? true : false
		assert_boolean_type<E<string | boolean, boolean>>(true)
		assert_boolean_type<E<boolean, string | boolean>>(false)
	})
	it('assert_is_type', () => {
		assert_is_type()
	})
	it('assert_is_never', () => {
		assert_is_never()
	})
	it('assert_type', () => {
		assert_type()
	})
	it('assert_value_types', () => {
		assert_value_types()
	})
	it('assert_assignable', () => {
		assert_assignable()
	})
	it('assert_values_assignable', () => {
		assert_values_assignable()
	})
	it('assert_callable', () => {
		assert_callable()
	})
	it('assert_values_callable', () => {
		assert_values_callable()
	})
	it('assert_returnable', () => {
		assert_returnable()
	})
	it('assert_values_returnable', () => {
		assert_values_returnable()
	})


	it('Unshift', () => {
		assert_is_type< Unshift<number, [string, boolean]>, [number, string, boolean] >(true)
		assert_is_type< Unshift<number, []>, [number] >(true)
		assert_is_type< Unshift<number, [string, string]>, [number, [string, string]] >(false)
	})

	it('KeysOfType', () => {
		assert_is_type< KeysOfType<{ a: number, b: boolean }, number>, 'a' >(true)
		assert_is_type< KeysOfType<{ a: number, b: boolean, c: number }, number>, 'a' | 'c' >(true)
		assert_is_type< KeysOfType<{ a: number, b: boolean, c: string }, number | string>, 'a' | 'c' >(true)
	})
	it('PickOfType', () => {
		assert_is_type< PickOfType<{ a: number, b: boolean, c: string }, number>, { a: number } >(true)
		assert_is_type< PickOfType<{ a: number, b: boolean, c: string }, number | string>, { a: number, c: string } >(true)
	})

	it('Head', () => {
		assert_is_type< Head<[number, boolean, string]>, number >(true)
		assert_is_type< Head<[number]>, number >(true)
		assert_is_never< Head<[]> >(true)
	})
	it('Tail', () => {
		assert_is_type< Tail<[number, boolean, string]>, [boolean, string] >(true)
		assert_is_type< Tail<[number]>, [] >(true)
		assert_is_type< Tail<[]>, [] >(true)
	})
	it('HasTail', () => {
		assert_boolean_type< HasTail<[number, boolean, string]> >(true)
		assert_boolean_type< HasTail<[number]> >(false)
		assert_boolean_type< HasTail<[]> >(false)
	})
	it('Last', () => {
		assert_is_type< Last<[number, boolean, string]>, string >(true)
		assert_is_type< Last<[string]>, string >(true)
		assert_is_never< Last<[]> >(true)
	})
	it('OnlyOne', () => {
		assert_boolean_type< OnlyOne<[number, boolean, string]> >(false)
		assert_boolean_type< OnlyOne<[number]> >(true)
		assert_boolean_type< OnlyOne<[]> >(false)
	})


	it('SingleParameter', () => {
		assert_is_type< SingleParameter<(a: number) => boolean>, number >(true)
		assert_is_type< SingleParameter<(a: number) => boolean>, boolean >(false)

		// assert_is_never< SingleParameter<() => boolean> >(true)
	})
	it('FoldingFunctions', () => {
		assert_is_type< FoldingFunctions<[() => number, (a: number) => string, (a: string) => boolean]>, boolean >(true)
		assert_is_type< FoldingFunctions<[() => number]>, number >(true)
		assert_is_type< FoldingFunctions<[() => number]>, string >(false)

		assert_is_never< FoldingFunctions<[() => number, () => string]> >(true)
		assert_is_never< FoldingFunctions<[]> >(true)
		assert_is_never< FoldingFunctions<[() => number, (a: string) => string]> >(true)
	})

	it('tuple', () => {
		assert_type<[]>(tuple())
		assert_type<[number]>(tuple(1))
		assert_type<[number, string]>(tuple(1, 'a'))
		assert_type<[number, string, boolean]>(tuple(1, 'a', true))
		assert_type<[number, string, boolean, number[]]>(tuple(1, 'a', true, [1, 2, 3]))
		assert_type<[number, string, boolean, [number, number, number]]>(tuple(1, 'a', true, tuple(1, 2, 3)))

		assert_value_types(tuple(1, 2, 3), [1, 2, 3], false)
		assert_value_types(tuple(1, 2, 3), [1, 2, 3] as [number, number, number], true)

		expect(tuple()).eql([])
		expect(tuple(1, 2, 3)).eql([1, 2, 3])
	})
})
