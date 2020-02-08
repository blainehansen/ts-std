import 'mocha'
import './array'
import { expect } from 'chai'

import { tuple as t } from '@ts-std/types'
import { Result, Ok, Err, Maybe, Some, None } from '@ts-std/monads'

type A = { a: number, b: string }
type B = [number, string]
type E = [string, number]
const a_array = [{ a: 1, b: 'b' }, { a: 1, b: 'b' }]
const b_array = [t(1, 'a'), t(1, 'a')]
const e_array = [t('a', 1), t('b', 2)]

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

describe('push_all', () => {
	it('works', () => {
		const a = [] as number[]
		expect(a.length).equal(0)
		a.push_all([1])
		expect(a.length).equal(1)
		a.push_all([2, 3])
		expect(a.length).equal(3)
		a.push_all([4, 5, 6], [7, 8, 9], [10])
		expect(a.length).equal(10)
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
describe('flat_map', () => {
	const string_fn = (n: number) => n % 3 === 0 ? [] : n % 3 === 1 ? ['a'] : ['b', 'c']
	it('empty', () => {
		expect([].flat_map(string_fn)).eql([])
	})

	it('works', () => {
		expect([0, 1, 2, 3, 4].flat_map(string_fn)).eql(['a', 'b', 'c', 'a'])
	})
})
describe('try_map', () => {
	const string_fn = (n: number) => n % 2 === 0 ? Ok(true) : Err('not even')
	it('empty', () => {
		expect([].try_map(string_fn)).eql(Ok([]))
	})

	it('works', () => {
		expect([0, 2, 4].try_map(string_fn)).eql(Ok([true, true, true]))
		expect([1].try_map(string_fn)).eql(Err('not even'))
		expect([0, 1].try_map(string_fn)).eql(Err('not even'))
		expect([0, 1, 2].try_map(string_fn)).eql(Err('not even'))
	})
})
describe('maybe_map', () => {
	const string_fn = (n: number) => n % 2 === 0 ? Some(true) : None
	it('empty', () => {
		expect([].maybe_map(string_fn)).eql(Some([]))
	})

	it('works', () => {
		expect([0, 2, 4].maybe_map(string_fn)).eql(Some([true, true, true]))
		expect([1].maybe_map(string_fn)).eql(None)
		expect([0, 1].maybe_map(string_fn)).eql(None)
		expect([0, 1, 2].maybe_map(string_fn)).eql(None)
	})
})
describe('index_map', () => {
	const string_fn = (n: number) => t(n % 3, `${n}`)
	it('empty', () => {
		expect([].index_map(string_fn)).eql({})
	})

	it('works', () => {
		expect([0, 1, 2].index_map(string_fn)).eql({ 0: '0', 1: '1', 2: '2' })
		expect([0, 1, 2, 3].index_map(string_fn)).eql({ 0: '3', 1: '1', 2: '2' })
	})
})
describe('unique_index_map', () => {
	const string_fn = (n: number) => t(n % 3, `${n}`)
	it('empty', () => {
		expect([].unique_index_map(string_fn)).eql(Ok({}))
	})

	it('works', () => {
		expect([0, 1, 2].unique_index_map(string_fn)).eql(Ok({ 0: '0', 1: '1', 2: '2' }))
		expect([0, 1, 2, 3].unique_index_map(string_fn)).eql(Err(t('0', '0', '3')))
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

describe('maybe_get', () => {
	it('works', () => {
		expect([].maybe_get(0)).eql(None)
		expect([].maybe_get(1)).eql(None)
		expect([].maybe_get(-1)).eql(None)

		expect([1, 2, 3].maybe_get(0)).eql(Some(1))
		expect([1, 2, 3].maybe_get(1)).eql(Some(2))
		expect([1, 2, 3].maybe_get(2)).eql(Some(3))
		expect([1, 2, 3].maybe_get(3)).eql(None)

		expect([1, 2, 3].maybe_get(-1)).eql(Some(3))
		expect([1, 2, 3].maybe_get(-2)).eql(Some(2))
		expect([1, 2, 3].maybe_get(-3)).eql(Some(1))
		expect([1, 2, 3].maybe_get(-4)).eql(None)
	})
})

describe('wrapping_get', () => {
	it('works', () => {
		expect([].wrapping_get(0)).eql(None)
		expect([].wrapping_get(1)).eql(None)
		expect([].wrapping_get(-1)).eql(None)

		expect([1, 2, 3].wrapping_get(0)).eql(Some(1))
		expect([1, 2, 3].wrapping_get(1)).eql(Some(2))
		expect([1, 2, 3].wrapping_get(2)).eql(Some(3))
		expect([1, 2, 3].wrapping_get(3)).eql(Some(1))
		expect([1, 2, 3].wrapping_get(4)).eql(Some(2))
		expect([1, 2, 3].wrapping_get(5)).eql(Some(3))

		expect([1, 2, 3].wrapping_get(-1)).eql(Some(3))
		expect([1, 2, 3].wrapping_get(-2)).eql(Some(2))
		expect([1, 2, 3].wrapping_get(-3)).eql(Some(1))
		expect([1, 2, 3].wrapping_get(-4)).eql(Some(3))
		expect([1, 2, 3].wrapping_get(-5)).eql(Some(2))
		expect([1, 2, 3].wrapping_get(-6)).eql(Some(1))
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

describe('group_by', () => {
	it('works', () => {
		expect(([] as A[]).group_by('a')).eql({})

		const a: { [key: string]: A[] } = a_array.group_by('a')
		expect(a).eql({ 1: a_array })
		expect(a_array.group_by('b')).eql({ b: a_array })

		expect(e_array.group_by('0')).eql({ a: [t('a', 1)], b: [t('b', 2)] })
		expect(e_array.group_by('1')).eql({ 1: [t('a', 1)], 2: [t('b', 2)] })

		expect(e_array.group_by(e => e[0])).eql({ a: [t('a', 1)], b: [t('b', 2)] })
		expect(e_array.group_by(e => e[1])).eql({ 1: [t('a', 1)], 2: [t('b', 2)] })
	})
})

describe('group_by_map', () => it('works', () => {
	expect(([] as string[]).group_by_map(s => [s[0], s.length])).eql({})

	expect(['a', 'ab', 'bc', 'eesd', 'es'].group_by_map(s => [s[0], s.length])).eql({
		a: [1, 2], b: [2], e: [4, 2],
	})

	expect(
		[{ name: 'a', count: 1 }, { name: 'b', count: 1 }, { name: 'c', count: 1 }].group_by_map(a => [a.name, a.count])
	).eql({ a: [1], b: [1], c: [1] })

	expect(
		[{ name: 'a', count: 1 }, { name: 'b', count: 1 }, { name: 'a', count: 1 }].group_by_map(a => [a.name, a.count])
	).eql({ a: [1, 1], b: [1] })
}))

describe('split_by', () => {
	it('works', () => {
		type T = { a: number, b: boolean }
		const arr = [{ a: 0, b: false }, { a: 0, b: true }, { a: 1, b: true }]

		expect(([] as T[]).split_by('b')).eql([[], []])

		const a: [T[], T[]] = arr.split_by(t => !!t.a)
		const b: [T[], T[]] = arr.split_by('b')
		expect(a).eql([[{ a: 1, b: true }], [{ a: 0, b: false }, { a: 0, b: true }]])
		expect(b).eql([[{ a: 0, b: true }, { a: 1, b: true }], [{ a: 0, b: false }]])

		expect(a_array.split_by(a => a.a === 0)).eql([[], a_array])

		expect(e_array.split_by(e => e[0] === 'a')).eql([[t('a', 1)], [t('b', 2)]])
		expect(e_array.split_by(e => e[1] === 1)).eql([[t('a', 1)], [t('b', 2)]])
	})
})

describe('split_by_map', () => it('works', () => {
	type T = { a: number, b: boolean }
	const arr = [{ a: 0, b: false }, { a: 0, b: true }, { a: 1, b: true }]

	expect(([] as T[]).split_by_map(a => [a.b, a.a])).eql([[], []])

	const a: [number[], number[]] = arr.split_by_map(t => [!!t.a, t.a])
	const b: [number[], number[]] = arr.split_by_map(a => [a.b, a.a])
	expect(a).eql([[1], [0, 0]])
	expect(b).eql([[0, 1], [0]])
}))

describe('entries_to_dict', () => {
	it('empty', () => {
		expect(([] as E[]).entries_to_dict()).eql({})
	})

	it('not', () => {
		expect(e_array.entries_to_dict()).eql({ a: 1, b: 2 })
	})
})

describe('unique_entries_to_dict', () => {
	it('empty', () => {
		expect(([] as E[]).unique_entries_to_dict()).eql(Ok({}))
	})

	it('not unique', () => {
		const e_array = [t('a', 1), t('a', 2)]
		expect(e_array.unique_entries_to_dict()).eql(Err(t('a', 2, 1)))
	})

	it('unique', () => {
		expect(e_array.unique_entries_to_dict()).eql(Ok({ a: 1, b: 2 }))
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

// describe('unzip_by', () => {
// 	it('empty', () => {
// 		const a = [] as { a: string, b: number }[]
// 		const u: [string[], number[], { v: boolean }[]] = a.unzip_by('a', 'b', a => ({ v: a.b === 0 }))
// 		const e = [[], [], []]
// 		expect(u).eql(e)
// 	})

// 	it('tuple', () => {
// 		const a = [t('1', 0), t('2', 1)]
// 		const u: [string[], number[], { v: boolean }[]] = a.unzip_by('0', '1', a => ({ v: a[1] === 0 }))
// 		const e = [['1', '2'], [0, 1], [true, false]]
// 		expect(u).eql(e)
// 	})

// 	it('object', () => {
// 		const a = [{ a: '1', b: 0 }, { a: '2', b: 1 }]
// 		const u: [string[], number[], { v: boolean }[]] = a.unzip_by('a', 'b', a => ({ v: a.b === 0 }))
// 		const e = [['1', '2'], [0, 1], [true, false]]
// 		expect(u).eql(e)
// 	})
// })


describe('sort_by', () => {
	it('empty', () => {
		expect(([] as A[]).sort_by('a')).eql([])
		expect(([] as A[]).sort_by(a => a.b.toLowerCase())).eql([])
	})

	it('asc', () => {
		const a = [{ a: 5 }, { a: 3 }, { a: 9 }, { a: 2 }]
		expect(a.sort_by('a')).eql([{ a: 2 }, { a: 3 }, { a: 5 }, { a: 9 }])
		expect(a).eql([{ a: 5 }, { a: 3 }, { a: 9 }, { a: 2 }])

		expect(a.sort_by('a', 'asc')).eql([{ a: 2 }, { a: 3 }, { a: 5 }, { a: 9 }])
		expect(a.sort_by(v => v.a + 1)).eql([{ a: 2 }, { a: 3 }, { a: 5 }, { a: 9 }])

		const b = [{ name: 'b' }, { name: 'y' }, { name: 'a' }, { name: 'h' }]
		expect(b.sort_by('name')).eql([{ name: 'a' }, { name: 'b' }, { name: 'h' }, { name: 'y' }])
		expect(b).eql([{ name: 'b' }, { name: 'y' }, { name: 'a' }, { name: 'h' }])
	})

	it('desc', () => {
		const a = [{ a: 5 }, { a: 3 }, { a: 9 }, { a: 2 }]
		expect(a.sort_by('a', 'desc')).eql([{ a: 9 }, { a: 5 }, { a: 3 }, { a: 2 }])
		expect(a).eql([{ a: 5 }, { a: 3 }, { a: 9 }, { a: 2 }])

		expect(a.sort_by('a', 'desc')).eql([{ a: 9 }, { a: 5 }, { a: 3 }, { a: 2 }])
		expect(a.sort_by(v => v.a + 1)).eql([{ a: 2 }, { a: 3 }, { a: 5 }, { a: 9 }])

		const b = [{ name: 'b' }, { name: 'y' }, { name: 'a' }, { name: 'h' }]
		expect(b.sort_by('name', 'desc')).eql([{ name: 'y' }, { name: 'h' }, { name: 'b' }, { name: 'a' }])
		expect(b).eql([{ name: 'b' }, { name: 'y' }, { name: 'a' }, { name: 'h' }])
	})
})

describe('mutate_sort_by', () => {
	it('empty', () => {
		expect(([] as A[]).mutate_sort_by('a')).eql([])
		expect(([] as A[]).mutate_sort_by(a => a.b.toLowerCase())).eql([])
	})

	it('asc', () => {
		const a = [{ a: 5 }, { a: 3 }, { a: 9 }, { a: 2 }]
		expect(a.mutate_sort_by('a')).eql([{ a: 2 }, { a: 3 }, { a: 5 }, { a: 9 }])
		expect(a).eql([{ a: 2 }, { a: 3 }, { a: 5 }, { a: 9 }])

		expect(a.mutate_sort_by('a', 'asc')).eql([{ a: 2 }, { a: 3 }, { a: 5 }, { a: 9 }])
		expect(a.mutate_sort_by(v => v.a + 1)).eql([{ a: 2 }, { a: 3 }, { a: 5 }, { a: 9 }])

		const b = [{ name: 'b' }, { name: 'y' }, { name: 'a' }, { name: 'h' }]
		expect(b.mutate_sort_by('name')).eql([{ name: 'a' }, { name: 'b' }, { name: 'h' }, { name: 'y' }])
		expect(b).eql([{ name: 'a' }, { name: 'b' }, { name: 'h' }, { name: 'y' }])
	})

	it('desc', () => {
		const a = [{ a: 5 }, { a: 3 }, { a: 9 }, { a: 2 }]
		expect(a.mutate_sort_by('a', 'desc')).eql([{ a: 9 }, { a: 5 }, { a: 3 }, { a: 2 }])
		expect(a).eql([{ a: 9 }, { a: 5 }, { a: 3 }, { a: 2 }])

		expect(a.mutate_sort_by('a', 'desc')).eql([{ a: 9 }, { a: 5 }, { a: 3 }, { a: 2 }])
		expect(a.mutate_sort_by(v => v.a + 1)).eql([{ a: 2 }, { a: 3 }, { a: 5 }, { a: 9 }])

		const b = [{ name: 'b' }, { name: 'y' }, { name: 'a' }, { name: 'h' }]
		expect(b.mutate_sort_by('name', 'desc')).eql([{ name: 'y' }, { name: 'h' }, { name: 'b' }, { name: 'a' }])
		expect(b).eql([{ name: 'y' }, { name: 'h' }, { name: 'b' }, { name: 'a' }])
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
