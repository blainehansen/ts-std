import { expect } from 'chai'
import * as sinon from 'sinon'

export function expect_console(func: () => any, called_times = 1) {
	const stub = sinon.stub(console, 'error')
	try {
		func()
	}
	finally {
		expect((console.error as sinon.SinonSpy).callCount).eql(called_times)
		stub.restore()
	}
}


