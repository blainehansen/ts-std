import { Result, Ok, Err, Maybe } from '@ts-std/monads'

export class LockedValue<T> {
	constructor(readonly equality_fn: (a: T, b: T) => boolean) {}

	protected internal: T | undefined = undefined
	set(value: T): Result<void, T> {
		if (this.internal !== undefined) {
			if (!this.equality_fn(this.internal, value))
				return Err(value)
			return Ok(undefined as void)
		}
		this.internal = value
		return Ok(undefined as void)
	}
	get(): Maybe<T> {
		return Maybe.from_nillable(this.internal)
	}
}
