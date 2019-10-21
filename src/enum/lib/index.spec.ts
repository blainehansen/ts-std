import 'mocha'
import { expect } from 'chai'

import { Enum, empty, variant } from './index'
import { tuple as t, assert_type, assert_assignable, assert_callable, assert_values_callable } from '@ts-actually-safe/types'

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
		assert_type<'PageLoad'>(page_load.key)
		expect(page_load.content).eql(undefined)
		assert_type<void>(page_load.content)

		const page_unload = WebEvent.PageUnload()
		expect(page_unload.key).eql('PageUnload')
		assert_type<'PageUnload'>(page_unload.key)
		expect(page_unload.content).eql(undefined)
		assert_type<void>(page_unload.content)

		const key_press = WebEvent.KeyPress(7)
		expect(key_press.key).eql('KeyPress')
		assert_type<'KeyPress'>(key_press.key)
		expect(key_press.content).eql(7)
		assert_type<number>(key_press.content)

		const paste = WebEvent.Paste('stuff')
		expect(paste.key).eql('Paste')
		assert_type<'Paste'>(paste.key)
		expect(paste.content).eql('stuff')
		assert_type<string>(paste.content)

		const click = WebEvent.Click({ x: 1, y: 2 })
		expect(click.key).eql('Click')
		assert_type<'Click'>(click.key)
		expect(click.content).eql({ x: 1, y: 2 })
		assert_type<{ x: number, y: number }>(click.content)

		let event = WebEvent.PageLoad() as WebEvent
		assert_type<WebEvent>(event)
		event = page_load
		assert_type<WebEvent>(event)
		event = page_unload
		assert_type<WebEvent>(event)
		event = key_press
		assert_type<WebEvent>(event)
		event = paste
		assert_type<WebEvent>(event)
		event = click
		assert_type<WebEvent>(event)

		event = WebEvent.PageLoad()
		assert_type<WebEvent>(event)
		event = WebEvent.PageUnload()
		assert_type<WebEvent>(event)
		event = WebEvent.KeyPress(7)
		assert_type<WebEvent>(event)
		event = WebEvent.Paste('stuff')
		assert_type<WebEvent>(event)
		event = WebEvent.Click({ x: 1, y: 2 })
		assert_type<WebEvent>(event)

		expect(event.match({
			Click: () => true,
			_: () => false,
		})).true

		expect(event.match({
			Paste: () => false,
			_: () => true,
		})).true

		assert_values_callable(event.match, t({
			Paste: () => false,
			_: () => true,
		}), true)

		// assert_values_callable(event.match, t({
		// 	PageLoad: () => 1,
		// 	PageUnload: () => 2,
		// 	KeyPress: (n: number) => 3,
		// 	Paste: (s: string) => 4,
		// }), false)

		// assert_values_callable(event.match, t({
		// 	PageLoad: () => 1,
		// 	PageUnload: () => 2,
		// 	KeyPress: (n: number) => 3,
		// 	Paste: (s: string) => 4,
		// 	Click: (o: { x: number, y: number }) => 5,
		// 	Random: () => 2,
		// }), false)

		// assert_values_callable(event.match, t({
		// 	PageLoad: () => 1,
		// 	PageUnload: () => 2,
		// 	KeyPress: (n: number) => 3,
		// 	Paste: (s: string) => 4,
		// 	_: (a: any) => 5,
		// }), false)

		// assert_values_callable(event.match, t({
		// 	PageLoad: () => 1,
		// 	PageUnload: () => 2,
		// 	KeyPress: (n: boolean) => 3,
		// 	Paste: (s: string) => 4,
		// 	_: () => 5,
		// }), false)

		assert_values_callable(event.match, t({
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

		assert_assignable<'default', keyof typeof WebEvent>(false)
		assert_assignable<'PageLoad', keyof typeof WebEvent>(true)
		assert_assignable<'PageUnload', keyof typeof WebEvent>(true)
		assert_assignable<'KeyPress', keyof typeof WebEvent>(true)
		assert_assignable<'Paste', keyof typeof WebEvent>(true)
		assert_assignable<'Click', keyof typeof WebEvent>(true)
	})
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
		assert_type<WebEvent>(event)
		expect(event.key).eql('PageLoad')
		expect(event.content).eql(undefined)

		event = WebEvent.PageLoad()
		assert_type<WebEvent>(event)
		event = WebEvent.PageUnload()
		assert_type<WebEvent>(event)
		event = WebEvent.KeyPress(7)
		assert_type<WebEvent>(event)
		event = WebEvent.Paste('stuff')
		assert_type<WebEvent>(event)
		event = WebEvent.Click({ x: 1, y: 2 })
		assert_type<WebEvent>(event)

		assert_values_callable(WebEvent.default, t(), true)
		assert_values_callable(WebEvent.default, t(undefined), false)
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
		assert_type<WebEvent>(event)
		expect(event.key).eql('KeyPress')
		expect(event.content).eql(0)

		event = WebEvent.PageLoad()
		assert_type<WebEvent>(event)
		event = WebEvent.PageUnload()
		assert_type<WebEvent>(event)
		event = WebEvent.KeyPress(7)
		assert_type<WebEvent>(event)
		event = WebEvent.Paste('stuff')
		assert_type<WebEvent>(event)
		event = WebEvent.Click({ x: 1, y: 2 })
		assert_type<WebEvent>(event)

		assert_values_callable(WebEvent.default, t(), true)
		assert_values_callable(WebEvent.default, t(undefined), false)
	})
})
