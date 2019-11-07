import { Dict } from '@ts-std/types'
import { Result, Ok, Err, Maybe, Some, None } from '@ts-std/monads'
import { SpecialDict } from './common'

export class UniqueDict<T> extends SpecialDict<T> {
	get(key: string): Maybe<T> {
		if (key in this.items)
			return Some(this.items[key])
		else
			return None
	}

	set(key: string, value: T): Result<void, [string, T, T]> {
		if (key in this.items)
			return Err([key, this.items[key], value])

		this.items[key] = value
		return Ok(undefined as void)
	}
}
