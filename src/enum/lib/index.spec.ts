import 'mocha'
import { expect } from 'chai'

import { Enum, empty, variant } from './index'
import { tuple as t, assert_type as assert } from '@ts-std/types'

describe('required Enum', () => {
	it('works', () => {
		const WebEvent = Enum({
			PageLoad: empty(),
			PageUnload: empty(),
			KeyPress: variant<number>(),
			Paste: variant<string>(),
			Click: variant<{ x: number, y: number }>(),
		})
		type WebEvent = Enum<typeof WebEvent>

		const page_load = WebEvent.PageLoad()
		expect(page_load.key).eql('PageLoad')
		assert.value<'PageLoad'>(page_load.key)
		expect(page_load.content).eql(undefined)
		assert.value<void>(page_load.content)

		const page_unload = WebEvent.PageUnload()
		expect(page_unload.key).eql('PageUnload')
		assert.value<'PageUnload'>(page_unload.key)
		expect(page_unload.content).eql(undefined)
		assert.value<void>(page_unload.content)

		const key_press = WebEvent.KeyPress(7)
		expect(key_press.key).eql('KeyPress')
		assert.value<'KeyPress'>(key_press.key)
		expect(key_press.content).eql(7)
		assert.value<number>(key_press.content)

		const paste = WebEvent.Paste('stuff')
		expect(paste.key).eql('Paste')
		assert.value<'Paste'>(paste.key)
		expect(paste.content).eql('stuff')
		assert.value<string>(paste.content)

		const click = WebEvent.Click({ x: 1, y: 2 })
		expect(click.key).eql('Click')
		assert.value<'Click'>(click.key)
		expect(click.content).eql({ x: 1, y: 2 })
		assert.value<{ x: number, y: number }>(click.content)

		let event = WebEvent.PageLoad() as WebEvent
		assert.value<WebEvent>(event)

		event = page_load
		expect(event.matches('PageLoad')).true
		assert.value<WebEvent>(event)
		if (event.matches('PageLoad'))
			assert.value<void>(page_load.content)

		event = page_unload
		expect(event.matches('PageUnload')).true
		assert.value<WebEvent>(event)
		if (event.matches('PageUnload'))
			assert.value<void>(page_unload.content)

		event = key_press
		expect(event.matches('KeyPress')).true
		assert.value<WebEvent>(event)
		if (event.matches('KeyPress'))
			assert.value<number>(key_press.content)

		event = paste
		expect(event.matches('Paste')).true
		assert.value<WebEvent>(event)
		if (event.matches('Paste'))
			assert.value<string>(paste.content)

		event = click
		expect(event.matches('Click')).true
		assert.value<WebEvent>(event)
		if (event.matches('Click'))
			assert.value<{ x: number, y: number }>(click.content)

		assert.values_callable(event.matches, '', false)
		assert.values_callable(event.matches, 'Click' as string, false)

		event = WebEvent.PageLoad()
		assert.value<WebEvent>(event)
		event = WebEvent.PageUnload()
		assert.value<WebEvent>(event)
		event = WebEvent.KeyPress(7)
		assert.value<WebEvent>(event)
		event = WebEvent.Paste('stuff')
		assert.value<WebEvent>(event)
		event = WebEvent.Click({ x: 1, y: 2 })
		assert.value<WebEvent>(event)

		expect(event.match({
			Click: () => true,
			_: () => false,
		})).true

		expect(event.match({
			Paste: () => false,
			_: () => true,
		})).true

		assert.values_callable(event.match, t({
			Paste: () => false,
			_: () => true,
		}), true)

		type A = {
			PageLoad: () => number,
			PageUnload: () => number,
			KeyPress: (n: number) => number,
			Paste: (s: string) => number,
		}
		assert.callable<typeof event.match, [A]>(false)

		// type B = {
		// 	PageLoad: () => number,
		// 	PageUnload: () => number,
		// 	KeyPress: (n: number) => number,
		// 	Paste: (s: string) => number,
		// 	Click: (o: { x: number, y: number }) => number,
		// 	Random: () => number,
		// }
		// assert.callable<typeof event.match, [B]>(false)

		type C = {
			PageLoad: () => number,
			PageUnload: () => number,
			KeyPress: (n: number) => number,
			Paste: (s: string) => number,
			_: (a: any) => number,
		}
		assert.callable<typeof event.match, [C]>(false)

		type D = {
			PageLoad: () => number,
			PageUnload: () => number,
			KeyPress: (n: boolean) => number,
			Paste: (s: string) => number,
			_: () => number,
		}
		assert.callable<typeof event.match, [D]>(false)

		assert.values_callable(event.match, t({
			Paste: (s: string) => 4,
			_: () => 5,
		}), true)

		const events = [
			t(page_load, 1),
			t(page_unload, 2),
			t(key_press, 3),
			t(paste, 4),
			t(click, 5),
		] as [WebEvent, number][]
		for (const [event, expected] of events) {
			const actual: number = event.match({
				PageLoad: () => 1,
				PageUnload: () => 2,
				KeyPress: (n: number) => 3,
				Paste: (s: string) => 4,
				Click: (o: { x: number, y: number }) => 5,
			})
			expect(actual).eql(expected)
		}

		assert.assignable<'default', keyof typeof WebEvent>(false)
		assert.assignable<'PageLoad', keyof typeof WebEvent>(true)
		assert.assignable<'PageUnload', keyof typeof WebEvent>(true)
		assert.assignable<'KeyPress', keyof typeof WebEvent>(true)
		assert.assignable<'Paste', keyof typeof WebEvent>(true)
		assert.assignable<'Click', keyof typeof WebEvent>(true)
	})

	// it('stupid bug fixed', () => {
	// 	const BufferState = Enum({
	// 		Holding: variant<string[]>(),
	// 		Ready: empty(),
	// 		Exhausted: empty(),
	// 	})
	// 	type BufferState = Enum<typeof BufferState>

	// 	function thing(buffer: BufferState): string {
	// 		if (buffer.matches('Exhausted'))
	// 			return ''
	// 		if (buffer.matches('Holding')) {
	// 			return buffer.content[0] || ''
	// 		}
	// 		return ''
	// 	}
	// })
})


describe('defaultable Enum', () => {
	it('empty variant works', () => {
		const WebEvent = Enum({
			PageLoad: empty(),
			PageUnload: empty(),
			KeyPress: variant<number>(),
			Paste: variant<string>(),
			Click: variant<{ x: number, y: number }>(),
		}, 'PageLoad')
		type WebEvent = Enum<typeof WebEvent>

		let event = WebEvent.default()
		assert.value<WebEvent>(event)
		expect(event.key).eql('PageLoad')
		expect(event.content).eql(undefined)

		event = WebEvent.PageLoad()
		assert.value<WebEvent>(event)
		event = WebEvent.PageUnload()
		assert.value<WebEvent>(event)
		event = WebEvent.KeyPress(7)
		assert.value<WebEvent>(event)
		event = WebEvent.Paste('stuff')
		assert.value<WebEvent>(event)
		event = WebEvent.Click({ x: 1, y: 2 })
		assert.value<WebEvent>(event)

		assert.values_callable(WebEvent.default, t(), true)
		assert.values_callable(WebEvent.default, t(undefined), false)
	})

	it('non-empty variant works', () => {
		const WebEvent = Enum({
			PageLoad: empty(),
			PageUnload: empty(),
			KeyPress: variant<number>(),
			Paste: variant<string>(),
			Click: variant<{ x: number, y: number }>(),
		}, 'KeyPress', 0)
		type WebEvent = Enum<typeof WebEvent>

		let event = WebEvent.default()
		assert.value<WebEvent>(event)
		expect(event.key).eql('KeyPress')
		expect(event.content).eql(0)

		event = WebEvent.PageLoad()
		assert.value<WebEvent>(event)
		event = WebEvent.PageUnload()
		assert.value<WebEvent>(event)
		event = WebEvent.KeyPress(7)
		assert.value<WebEvent>(event)
		event = WebEvent.Paste('stuff')
		assert.value<WebEvent>(event)
		event = WebEvent.Click({ x: 1, y: 2 })
		assert.value<WebEvent>(event)

		assert.values_callable(WebEvent.default, t(), true)
		assert.values_callable(WebEvent.default, t(undefined), false)
	})

	// it('generic works', () => {
	// 	let _WebEvent
	// 	function WebEvent<A, U>() {
	// 		if (_WebEvent) return _WebEvent
	// 		return _WebEvent = Enum({
	// 			PageLoad: empty(),
	// 			PageUnload: empty(),
	// 			KeyPress: variant<number>(),
	// 			Incoming: variant<A>(),
	// 			Request: variant<{ from: A, payload: U }>(),
	// 		})
	// 	}
	// 	type WebEvent<A, U> = Enum<ReturnType<typeof WebEvent<A, U>>>

	// 	let event = WebEvent.PageLoad() as WebEvent<Actor, number>
	// })
})
