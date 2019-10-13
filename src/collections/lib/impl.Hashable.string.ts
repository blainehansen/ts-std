import xxhashjs from 'xxhashjs'

import { Hashable } from './common'
declare global {
	interface String extends Hashable {}
}
String.prototype.to_hash = function to_hash(): number {
	return xxhashjs.h32(this, 0).toNumber()
}
