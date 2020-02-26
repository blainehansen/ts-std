import 'mocha'
import { expect } from 'chai'

import {
	assert_type as assert,
	UnionToIntersection, TupleIntersection,
	Unshift, KeysOfType, PickOfType, UnionKeys, OmitVariants, PickVariants,
	Head, Tail, HasTail, Last, OnlyOne, SingleParameter, FoldingFunctions,
	tuple,
} from './index'

const t = tuple

describe('Just going to be various type assertions. They should all compile', () => {
	it('assert.boolean', () => {
		assert.boolean<true>(true)
		assert.boolean<false>(false)
		assert.boolean<boolean>(false)

		type E<A, B> = A extends B ? true : false
		assert.boolean<E<string | boolean, boolean>>(false)
		assert.boolean<E<boolean, string | boolean>>(true)
	})
	it('assert.value_boolean', () => {
		function b<T>(a: T): T extends any[] ? true : false { return true as any as T extends any[] ? true : false }
		assert.value_boolean(b([]), true)
		assert.value_boolean(b(undefined), false)
	})

	it('assert.same', () => {
		assert.same<number, number>(true)
		assert.same<number, boolean>(false)

		assert.same<string, 'a'>(false)
		assert.same<string, string>(true)

		assert.same<[], []>(true)
		assert.same<[], number[]>(false)
		assert.same<[number, string], [number, string]>(true)
		assert.same<[number, string], (number | string)[]>(false)

		assert.same<number | string, string | number>(true)
		assert.same<'a' | 1, 1 | 'a'>(true)
		assert.same<number | string, 1 | 'a'>(false)
	})
	it('assert.values_same', () => {
		assert.values_same(1, 1, true)
		assert.values_same(1, 3, true)
		assert.values_same(1 as const, 1, false)
		assert.values_same([], [] as number[], false)
		assert.values_same([], [], true)
		assert.values_same({ a: 'a' }, { a: 'b' }, true)
		assert.values_same({ a: 'a' as const }, { a: 'b' as const }, false)
	})

	it('assert.never', () => {
		assert.never<never>(true)
		assert.never<[]>(false)
		assert.never<string>(false)
		assert.never<string | never>(false)
	})
	it('assert.value_never', () => {
		assert.value_never({} as never, true)
		assert.value_never({} as [], false)
		assert.value_never({} as string, false)
		assert.value_never({} as string | never, false)
	})

	it('assert.value', () => {
		assert.value<{}>({})
		assert.value<[]>([])
		assert.value<number[]>([] as number[])
		assert.value<number[]>({} as [number, number])
		assert.value<string>({} as string)
		assert.value<string | boolean>({} as string)
		assert.value<number | string>({} as string | number)
	})

	it('assert.assignable', () => {
		assert.assignable<[], []>(true)
		assert.assignable<number[], []>(true)
		assert.assignable<[], any[]>(false)
		assert.assignable<[number, number], number[]>(false)
		assert.assignable<number[], number[]>(true)
		assert.assignable<string, string>(true)
		assert.assignable<string, string | boolean>(false)
		assert.assignable<string | boolean, string>(true)
		assert.assignable<string | never, never | string>(true)
	})
	it('assert.values_assignable', () => {
		assert.values_assignable({} as [], {} as [], true)
		assert.values_assignable({} as number[], {} as [], true)
		assert.values_assignable({} as [], {} as any[], false)
		assert.values_assignable({} as [number, number], {} as number[], false)
		assert.values_assignable({} as number[], {} as number[], true)
		assert.values_assignable({} as string, {} as string, true)
		assert.values_assignable({} as string, {} as string | boolean, false)
		assert.values_assignable({} as string | boolean, {} as string, true)
		assert.values_assignable({} as string | never, {} as never | string, true)
	})

	it('assert.callable', () => {
		assert.callable<() => any, []>(true)
		assert.callable<() => any, [number]>(false)

		assert.callable<(...args: number[]) => any, number[]>(true)
		assert.callable<(...args: number[]) => any, []>(true)
		assert.callable<(...args: number[]) => any, [number]>(true)
		assert.callable<(...args: number[]) => any, [number, number]>(true)
		assert.callable<(...args: number[]) => any, string[]>(false)
		assert.callable<(...args: number[]) => any, [string]>(false)

		assert.callable<(...args: (number | string)[]) => any, []>(true)
		assert.callable<(...args: (number | string)[]) => any, [string]>(true)
		assert.callable<(...args: (number | string)[]) => any, [number, string]>(true)
		assert.callable<(...args: (number | string)[]) => any, [string, number]>(true)
		assert.callable<(...args: (number | string)[]) => any, [string, number, boolean]>(false)
		assert.callable<(...args: (number | string)[]) => any, string[]>(true)
		assert.callable<(...args: (number | string)[]) => any, number[]>(true)
		assert.callable<(...args: (number | string)[]) => any, (number | string)[]>(true)
		assert.callable<(...args: (number | string)[]) => any, (string | number)[]>(true)
		assert.callable<(...args: (number | string)[]) => any, (number | boolean)[]>(false)

		assert.callable<(a: number, b: boolean) => any, [number, boolean]>(true)
		assert.callable<(a: number, b: boolean) => any, [boolean, number]>(false)

		assert.callable<(a: number, b?: boolean) => any, [number, boolean]>(true)
		assert.callable<(a: number, b?: boolean) => any, [number, undefined]>(true)
		assert.callable<(a: number, b?: boolean) => any, [number, null]>(false)
		assert.callable<(a: number, b?: boolean) => any, [number]>(true)
		assert.callable<(a: number, b?: boolean) => any, []>(false)

		assert.callable<(a?: number, b?: boolean) => any, [number, boolean]>(true)
		assert.callable<(a?: number, b?: boolean) => any, [number]>(true)
		assert.callable<(a?: number, b?: boolean) => any, []>(true)
		assert.callable<(a?: number, b?: boolean) => any, [boolean, number]>(false)

		assert.callable<(a: { x: number, y: string }) => any, [{ x: number, y: string }]>(true)
		assert.callable<(a: { x: number, y: string }) => any, []>(false)
		assert.callable<(a: { x: number, y: string }) => any, [{ y: string }]>(false)
		assert.callable<(a: { x: number, y: string }) => any, [{ x: number }]>(false)
		assert.callable<(a: { x: number, y?: string }) => any, [{ x: number }]>(true)

		assert.callable<(a?: { x: number, y?: string }) => any, [{ x: number }]>(true)
		assert.callable<(a?: { x: number, y?: string }) => any, [{ x: number, r: string }]>(true)
		assert.callable<(a?: { x: number, y?: string }) => any, [{ z: number, r: string }]>(false)
		assert.callable<(a?: { x: number, y?: string }) => any, []>(true)
	})
	it('assert.values_callable', () => {
		assert.values_callable(() => {}, t(), true)
		assert.values_callable(() => {}, t(1), false)
		assert.values_callable((...args: number[]) => {}, [1, 2], true)
		assert.values_callable((...args: number[]) => {}, [], true)
		assert.values_callable((...args: number[]) => {}, t(1), true)
		assert.values_callable((...args: number[]) => {}, t(1, 2), true)
		assert.values_callable((...args: number[]) => {}, ['a', 'b'], false)
		assert.values_callable((...args: number[]) => {}, t('a'), false)
		assert.values_callable((...args: (number | string)[]) => {}, [], true)
		assert.values_callable((...args: (number | string)[]) => {}, t('a'), true)
		assert.values_callable((...args: (number | string)[]) => {}, t(1, 'a'), true)
		assert.values_callable((...args: (number | string)[]) => {}, t('a', 1), true)
		assert.values_callable((...args: (number | string)[]) => {}, t('a', 1, true), false)
		assert.values_callable((...args: (number | string)[]) => {}, ['a', 'b'], true)
		assert.values_callable((...args: (number | string)[]) => {}, [1, 2], true)
		assert.values_callable((...args: (number | string)[]) => {}, [1, 'a'], true)
		assert.values_callable((...args: (number | string)[]) => {}, ['a', 1], true)
		assert.values_callable((...args: (number | string)[]) => {}, [1, true], false)
		assert.values_callable((a: number, b: boolean) => {}, t(1, true), true)
		assert.values_callable((a: number, b: boolean) => {}, t(true, 1), false)
		assert.values_callable((a: number, b?: boolean) => {}, t(1, true), true)
		assert.values_callable((a: number, b?: boolean) => {}, t(1, undefined), true)
		assert.values_callable((a: number, b?: boolean) => {}, t(1, null), false)
		assert.values_callable((a: number, b?: boolean) => {}, t(1), true)
		assert.values_callable((a: number, b?: boolean) => {}, [], false)
		assert.values_callable((a?: number, b?: boolean) => {}, t(1, true), true)
		assert.values_callable((a?: number, b?: boolean) => {}, t(1), true)
		assert.values_callable((a?: number, b?: boolean) => {}, t(), true)
		assert.values_callable((a?: number, b?: boolean) => {}, t(true, 1), false)
		assert.values_callable((a: { x: number, y: string }) => {}, t({ x: 1, y: 'a' }), true)
		assert.values_callable((a: { x: number, y: string }) => {}, [], false)
		assert.values_callable((a: { x: number, y: string }) => {}, t({ y: 'a' }), false)
		assert.values_callable((a: { x: number, y: string }) => {}, t({ x: 1 }), false)
		assert.values_callable((a: { x: number, y?: string }) => {}, t({ x: 1 }), true)
		assert.values_callable((a?: { x: number, y?: string }) => {}, t({ x: 1 }), true)
		assert.values_callable((a?: { x: number, y?: string }) => {}, t({ x: 1, r: 'a' }), true)
		assert.values_callable((a?: { x: number, y?: string }) => {}, t({ z: 1, r: 'a' }), false)
		assert.values_callable((a?: { x: number, y?: string }) => {}, t(), true)
	})

	it('assert.returnable', () => {
		assert.returnable<never, () => never>(true)
		assert.returnable<[], () => []>(true)
		assert.returnable<number[], () => []>(true)
		assert.returnable<[], () => any[]>(false)
		assert.returnable<[number, number], () => number[]>(false)
		assert.returnable<number[], () => number[]>(true)
		assert.returnable<string, () => string>(true)
		assert.returnable<string, () => string | boolean>(false)
		assert.returnable<string | boolean, () => string>(true)
		assert.returnable<string | never, () => never | string>(true)
	})
	it('assert.values_returnable', () => {
		assert.values_returnable({} as never, () => ({} as never), true)
		assert.values_returnable([], () => [], true)
		assert.values_returnable([1, 2], () => [], true)
		assert.values_returnable(t(), () => [], false)
		assert.values_returnable(t(1, 2), () => [1, 2], false)
		assert.values_returnable([1, 2], () => [1, 2], true)
		assert.values_returnable('a', () => 'a', true)
		assert.values_returnable('a', () => ('a' as string | boolean), false)
		assert.values_returnable('a' as string | boolean, () => 'a', true)
		assert.values_returnable('a' as string | never, () => ('a' as never | string), true)
	})


	it('UnionToIntersection', () => {
		assert.same< UnionToIntersection<number>, number >(true)
		assert.same< UnionToIntersection<number>, never >(false)
		assert.same< UnionToIntersection<number | boolean>, number & true & false >(true)
		assert.same< UnionToIntersection<number | boolean>, number & boolean >(true)
		assert.same< UnionToIntersection<number | boolean>, boolean & number >(true)
		assert.same< UnionToIntersection<number | boolean>, number | boolean >(false)
		assert.same< UnionToIntersection<number | boolean>, boolean | number >(false)

		assert.same< UnionToIntersection<{ a: number } | { b: number }>, { a: number } & { b: number } >(true)
		assert.same< UnionToIntersection<Partial<{ a: number }> | { b: number }>, Partial<{ a: number }> & { b: number } >(true)
		assert.same< UnionToIntersection<Partial<{ a: number }> | { b: number }>, Partial<{ a: number }> & Partial<{ b: number }> >(false)

		assert.same< UnionToIntersection<[{ a: number }, { b: number }][number]>, { a: number } & { b: number } >(true)
		assert.same< UnionToIntersection<[{ a: number }, { b: number }][number]>, [{ a: number }, { b: number }] >(false)
	})

	it('TupleIntersection', () => {
		assert.same< TupleIntersection<[]>, unknown >(true)
		assert.same< TupleIntersection<[]>, [] >(false)
		assert.same< TupleIntersection<[string]>, string >(true)
		assert.same< TupleIntersection<[string, number]>, string & number>(true)
		assert.same< TupleIntersection<[string, number]>, string | number >(false)
		assert.same< TupleIntersection<[string, number]>, [string, number] >(false)
		assert.same< TupleIntersection<[{ a: number }, { b: number }]>, { a: number } & { b: number } >(true)
		assert.same< TupleIntersection<[{ a: number }, { b: number }]>, [{ a: number } | { b: number }] >(false)
	})

	it('Unshift', () => {
		assert.same< Unshift<number, [string, boolean]>, [number, string, boolean] >(true)
		assert.same< Unshift<number, []>, [number] >(true)
		assert.same< Unshift<number, [string, string]>, [number, [string, string]] >(false)
	})

	it('KeysOfType', () => {
		assert.same< KeysOfType<{ a: number, b: boolean }, number>, 'a' >(true)
		assert.same< KeysOfType<{ a: number, b: boolean, c: number }, number>, 'a' | 'c' >(true)
		assert.same< KeysOfType<{ a: number, b: boolean, c: string }, number | string>, 'a' | 'c' >(true)
	})
	it('PickOfType', () => {
		assert.same< PickOfType<{ a: number, b: boolean, c: string }, number>, { a: number } >(true)
		assert.same< PickOfType<{ a: number, b: boolean, c: string }, number | string>, { a: number, c: string } >(true)
	})

	it('UnionKeys', () => {
		assert.same< UnionKeys<{ a: void, b: void }>, 'a' | 'b' >(true)
		assert.same< UnionKeys<{ a: void, b: void } | { c: void, d: void }>, 'a' | 'b' | 'c' | 'd' >(true)
	})
	it('OmitVariants', () => {
		assert.same< OmitVariants<U, 'type', 'b' | 'c'>, { type: 'a', a: number } >(true)
		assert.same< OmitVariants<U, 'type', 'b'>, { type: 'a', a: number } | { type: 'c', c: boolean } >(true)

		assert.same< OmitVariants<O, 'discriminant', 'b' | 'c'>, { discriminant: 'a', a: number } >(true)
		assert.same< OmitVariants<O, 'discriminant', 'b'>, { discriminant: 'a', a: number } | { discriminant: 'c', c: boolean } >(true)

		assert.same< OmitVariants<U, 'type', 'b'>, { type: 'a' | 'c', a: number, c: boolean } >(false)

		type U = { type: 'a', a: number } | { type: 'b', b: string } | { type: 'c', c: boolean }
		type O = { discriminant: 'a', a: number } | { discriminant: 'b', b: string } | { discriminant: 'c', c: boolean }
	})
	it('PickVariants', () => {
		assert.same< PickVariants<U, 'type', 'a' | 'c'>, { type: 'a', a: number } | { type: 'c', c: boolean } >(true)
		assert.same< PickVariants<U, 'type', 'b'>, { type: 'b', b: string } >(true)

		assert.same< PickVariants<O, 'discriminant', 'a' | 'c'>, { discriminant: 'a', a: number } | { discriminant: 'c', c: boolean } >(true)
		assert.same< PickVariants<O, 'discriminant', 'b'>, { discriminant: 'b', b: string } >(true)

		assert.same< PickVariants<U, 'type', 'a' | 'c'>, { type: 'a' | 'c', a: number, c: boolean } >(false)

		type U = { type: 'a', a: number } | { type: 'b', b: string } | { type: 'c', c: boolean }
		type O = { discriminant: 'a', a: number } | { discriminant: 'b', b: string } | { discriminant: 'c', c: boolean }
	})

	it('Head', () => {
		assert.same< Head<[number, boolean, string]>, number >(true)
		assert.same< Head<[number]>, number >(true)
		assert.never< Head<[]> >(true)
	})
	it('Tail', () => {
		assert.same< Tail<[number, boolean, string]>, [boolean, string] >(true)
		assert.same< Tail<[number]>, [] >(true)
		assert.same< Tail<[]>, [] >(true)
	})
	it('HasTail', () => {
		assert.boolean< HasTail<[number, boolean, string]> >(true)
		assert.boolean< HasTail<[number]> >(false)
		assert.boolean< HasTail<[]> >(false)
	})
	it('Last', () => {
		assert.same< Last<[number, boolean, string]>, string >(true)
		assert.same< Last<[string]>, string >(true)
		assert.never< Last<[]> >(true)
	})
	it('OnlyOne', () => {
		assert.boolean< OnlyOne<[number, boolean, string]> >(false)
		assert.boolean< OnlyOne<[number]> >(true)
		assert.boolean< OnlyOne<[]> >(false)
	})


	it('SingleParameter', () => {
		assert.same< SingleParameter<(a: number) => boolean>, number >(true)
		assert.same< SingleParameter<(a: number) => boolean>, boolean >(false)

		// assert.never< SingleParameter<() => boolean> >(true)
	})
	it('FoldingFunctions', () => {
		assert.same< FoldingFunctions<[() => number, (a: number) => string, (a: string) => boolean]>, boolean >(true)
		assert.same< FoldingFunctions<[() => number]>, number >(true)
		assert.same< FoldingFunctions<[() => number]>, string >(false)

		assert.never< FoldingFunctions<[() => number, () => string]> >(true)
		assert.never< FoldingFunctions<[]> >(true)
		assert.never< FoldingFunctions<[() => number, (a: string) => string]> >(true)
	})

	it('tuple', () => {
		assert.value<[]>(tuple())
		assert.value<[number]>(tuple(1))
		assert.value<[number, string]>(tuple(1, 'a'))
		assert.value<[number, string, boolean]>(tuple(1, 'a', true))
		assert.value<[number, string, boolean, number[]]>(tuple(1, 'a', true, [1, 2, 3]))
		assert.value<[number, string, boolean, [number, number, number]]>(tuple(1, 'a', true, tuple(1, 2, 3)))

		assert.values_same(tuple(1, 2, 3), [1, 2, 3], false)
		assert.values_same(tuple(1, 2, 3), [1, 2, 3] as [number, number, number], true)

		expect(tuple()).eql([])
		expect(tuple(1, 2, 3)).eql([1, 2, 3])
	})
})
