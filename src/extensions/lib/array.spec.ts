import 'mocha'
import './array'
import { expect } from 'chai'

import { tuple as t } from '@ts-actually-safe/types'
import { Result, Ok, Err, Maybe, Some, None } from '@ts-actually-safe/monads'

type A = { a: number, b: string }
type B = [number, string]
const a_array = [{ a: 1, b: 'b' }, { a: 1, b: 'b' }]
const b_array = [t(1, 'a'), t(1, 'a')]

describe('sum', () => {
	it('array of numbers', () => {
		expect([].sum()).equal(0)
		expect([1].sum()).equal(1)
		expect([1, 1, 1].sum()).equal(3)
	})

	it('array of objects', () => {
		expect(([] as A[]).sum('a')).equal(0)
		expect(([] as A[]).sum(v => v.a)).equal(0)
		expect(a_array.sum('a')).equal(2)
		expect(a_array.sum(v => v.a)).equal(2)
	})

	it('array of tuples', () => {
		expect(([] as B[]).sum('0')).equal(0)
		expect(([] as B[]).sum(v => v[0])).equal(0)
		expect(b_array.sum('0')).equal(2)
		expect(b_array.sum(v => v[0])).equal(2)
	})
})

describe('filter_map', () => {
	const string_even = (n: number) => n % 2 === 0 ? `${n}` : undefined

	it('empty', () => {
		expect([].filter_map(string_even)).eql([])
	})

	it('works', () => {
		expect([1, 2, 3, 4].filter_map(string_even)).eql(['2', '4'])
	})
})

describe('maybe_find', () => {
	const finder = (n: number) => n === 3

	it('empty', () => {
		expect([].maybe_find(finder)).eql(None)
	})

	it('not there', () => {
		expect([1, 2, 4].maybe_find(finder)).eql(None)
	})

	it('there', () => {
		expect([1, 2, 3, 4].maybe_find(finder)).eql(Some(3))
	})

	it('duplicated', () => {
		expect([3, 1, 2, 3, 4].maybe_find(finder)).eql(Some(3))
	})
})

describe('index_by', () => {
	it('empty', () => {
		expect(([] as A[]).index_by('a')).eql({})
		expect(([] as A[]).index_by('b')).eql({})
		expect(([] as A[]).index_by(v => v.a)).eql({})
		expect(([] as A[]).index_by(v => v.b)).eql({})

		expect(([] as B[]).index_by('0')).eql({})
		expect(([] as B[]).index_by('1')).eql({})
		expect(([] as B[]).index_by(v => v[0])).eql({})
		expect(([] as B[]).index_by(v => v[1])).eql({})
	})

	it('not', () => {
		expect(a_array.index_by('a')).eql({ 1: { a: 1, b: 'b' } })
		expect(a_array.index_by('b')).eql({ b: { a: 1, b: 'b' } })
		expect(a_array.index_by(v => v.a)).eql({ 1: { a: 1, b: 'b' } })
		expect(a_array.index_by(v => v.b)).eql({ b: { a: 1, b: 'b' } })

		expect(b_array.index_by('0')).eql({ 1: t(1, 'a') })
		expect(b_array.index_by('1')).eql({ a: t(1, 'a') })
		expect(b_array.index_by(v => v[0])).eql({ 1: t(1, 'a') })
		expect(b_array.index_by(v => v[1])).eql({ a: t(1, 'a') })
	})
})

describe('unique_index_by', () => {
	it('empty', () => {
		expect(([] as A[]).unique_index_by('a')).eql(Ok({}))
		expect(([] as A[]).unique_index_by('b')).eql(Ok({}))
		expect(([] as A[]).unique_index_by(v => v.a)).eql(Ok({}))
		expect(([] as A[]).unique_index_by(v => v.b)).eql(Ok({}))

		expect(([] as B[]).unique_index_by('0')).eql(Ok({}))
		expect(([] as B[]).unique_index_by('1')).eql(Ok({}))
		expect(([] as B[]).unique_index_by(v => v[0])).eql(Ok({}))
		expect(([] as B[]).unique_index_by(v => v[1])).eql(Ok({}))
	})

	it('not unique', () => {
		expect(a_array.unique_index_by('a')).eql(Err(t('1', { a: 1, b: 'b' }, { a: 1, b: 'b' })))
		expect(a_array.unique_index_by('b')).eql(Err(t('b', { a: 1, b: 'b' }, { a: 1, b: 'b' })))
		expect(a_array.unique_index_by(v => v.a)).eql(Err(t('1', { a: 1, b: 'b' }, { a: 1, b: 'b' })))
		expect(a_array.unique_index_by(v => v.b)).eql(Err(t('b', { a: 1, b: 'b' }, { a: 1, b: 'b' })))

		expect(b_array.unique_index_by('0')).eql(Err(t('1', t(1, 'a'), t(1, 'a'))))
		expect(b_array.unique_index_by('1')).eql(Err(t('a', t(1, 'a'), t(1, 'a'))))
		expect(b_array.unique_index_by(v => v[0])).eql(Err(t('1', t(1, 'a'), t(1, 'a'))))
		expect(b_array.unique_index_by(v => v[1])).eql(Err(t('a', t(1, 'a'), t(1, 'a'))))
	})

	it('unique', () => {
		const a_array = [{ a: 1, b: '1' }, { a: 2, b: '2' }]
		const b_array = [t(1, '1'), t(2, '2')]

		expect(a_array.unique_index_by('a')).eql(Ok({ 1: { a: 1, b: '1' }, 2: { a: 2, b: '2' } }))
		expect(a_array.unique_index_by('b')).eql(Ok({ '1': { a: 1, b: '1' }, '2': { a: 2, b: '2' } }))
		expect(a_array.unique_index_by(v => v.a)).eql(Ok({ 1: { a: 1, b: '1' }, 2: { a: 2, b: '2' } }))
		expect(a_array.unique_index_by(v => v.b)).eql(Ok({ '1': { a: 1, b: '1' }, '2': { a: 2, b: '2' } }))

		expect(b_array.unique_index_by('0')).eql(Ok({ 1: t(1, '1'), 2: t(2, '2') }))
		expect(b_array.unique_index_by('1')).eql(Ok({ '1': t(1, '1'), '2': t(2, '2') }))
		expect(b_array.unique_index_by(v => v[0])).eql(Ok({ 1: t(1, '1'), 2: t(2, '2') }))
		expect(b_array.unique_index_by(v => v[1])).eql(Ok({ '1': t(1, '1'), '2': t(2, '2') }))
	})
})

describe('unzip', () => {
	it('empty', () => {
		expect([].unzip()).eql(None)
	})

	it('not', () => {
		const a = [t(1, 'a', true), t(1, 'a', true)]
		const u: Maybe<[number[], string[], boolean[]]> = a.unzip()
		const e = Some([[1, 1], ['a', 'a'], [true, true]])
		expect(u).eql(e)
	})
})


describe('zip_lenient', () => {
	it('empty', () => {
		expect(Array.zip_lenient([], [], [])).eql([])
	})

	it('equal one', () => {
		const z: [number, boolean, string][] = Array.zip_lenient([1], [true], ['a'])
		expect(z).eql([t(1, true, 'a')])
	})

	it('equal two', () => {
		const z: [number, boolean, string][] = Array.zip_lenient([1, 2], [true, false], ['a', 'b'])
		expect(z).eql([t(1, true, 'a'), t(2, false, 'b')])
	})

	it('not equal', () => {
		const z = Array.zip_lenient([1, 2, 3], [true, false], ['a', 'b', 'c'])
		expect(z).eql([t(1, true, 'a'), t(2, false, 'b')])
	})

	it('shortest empty', () => {
		const z = Array.zip_lenient([] as number[], [true], ['a'])
		expect(z).eql([])
	})
})

describe('zip_equal', () => {
	it('empty', () => {
		expect(Array.zip_equal([], [], [])).eql(Ok([]))
	})

	it('equal one', () => {
		const z: Result<[number, boolean, string][], [number, number]> = Array.zip_equal([1], [true], ['a'])
		expect(z).eql(Ok([t(1, true, 'a')]))
	})

	it('equal two', () => {
		const z: Result<[number, boolean, string][], [number, number]> = Array.zip_equal([1, 2], [true, false], ['a', 'b'])
		expect(z).eql(Ok([t(1, true, 'a'), t(2, false, 'b')]))
	})

	it('not equal', () => {
		const z = Array.zip_equal([1, 2, 3], [true, false], ['a', 'b', 'c'])
		expect(z).eql(Err([3, 2]))
	})

	it('shortest empty', () => {
		const z = Array.zip_equal([] as number[], [true], ['a'])
		expect(z).eql(Err([0, 1]))
	})
})
