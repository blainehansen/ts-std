import { Result, Ok, Err, Maybe } from '@ts-std/monads'

export class UniqueValue<T> {
	protected internal: T | undefined = undefined
	set(value: T): Result<void, [T, T]> {
		if (this.internal !== undefined)
			return Err([this.internal, value])
		this.internal = value
		return Ok(undefined as void)
	}
	get(): Maybe<T> {
		return Maybe.from_nillable(this.internal)
	}
}
