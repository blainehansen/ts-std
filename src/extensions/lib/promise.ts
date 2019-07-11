type PromiseExecutor<T> =
	(resolve: (value?: T) => void, reject?: (reason?: any) => void) => void


class MyPromise<T> extends Promise<T> {
	constructor(executor: PromiseExecutor<T>) {
		super((resolve, reject) => executor(resolve, reject))
	}

	// then(onFulfilled, onRejected) {
	//     // before
	//     const returnValue = super.then(onFulfilled, onRejected);
	//     // after
	//     return returnValue;
	// }
}
