import { Maybe, Some, None } from '@ts-std/monads'

import { Indexable } from './common'

declare global {
	interface ObjectConstructor {
		maybe_get<T>(obj: { [key: string]: T }, key: Indexable): Maybe<T>
	}
}

Object.maybe_get = function<T>(obj: { [key: string]: T }, key: Indexable): Maybe<T> {
	const final_key = '' + key
	return final_key in obj
		? Some(obj[final_key])
		: None
}
