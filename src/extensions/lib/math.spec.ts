import 'mocha'
import './math'
import { expect } from 'chai'

describe('try_div', () => it('works', () => {
	expect(Math.try_div(0, 1).unwrap()).equal(0)
	expect(Math.try_div(2, 1).unwrap()).equal(2)

	expect(Math.try_div(0, 0).unwrap_err()).equal('division by zero')
	expect(Math.try_div(1, 0).unwrap_err()).equal('division by zero')
	expect(Math.try_div(-1, 0).unwrap_err()).equal('division by zero')
}))
