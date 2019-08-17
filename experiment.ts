import { Result, Ok, Err } from './src/types/lib'

// const res: Result<number, Error> = Result.attempt(() => {
// 	throw new Error("stuff")
// 	return 3
// })
// const n = res.change_err(e => e.message) as Result<number>

const r = Ok(5)
	.change(n => n + 4)
	.and_then((n): Result<number> => Math.random() < 0.95 ? Ok(n + 5) : Err('bad'))
	.change(n => n - 5)

console.log(r)
