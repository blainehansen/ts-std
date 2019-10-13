import { Hashable } from './common'
declare global {
	interface Number extends Hashable {}
}
Number.prototype.to_hash = function to_hash(): number {
	return this.valueOf()
}
