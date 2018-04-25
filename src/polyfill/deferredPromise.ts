class DeferredPromise {
	private _promise: Promise<any>;
	public resolve: (value?: any) => void;
	public reject: (reason?: any) => void;
	public then: any;
	public catch: any;
	constructor() {
		this.resolve = () => { };
		this.reject = () => { };
		this._promise = new Promise<any>((resolve: (value?: any) => void, reject: (reason?: any) => void) => {
			// assign the resolve and reject functions to `this`
			// making them usable on the class instance
			this.resolve = resolve;
			this.reject = reject;
		});
		// bind `then` and `catch` to implement the same interface as Promise
		this.then = this._promise.then.bind(this._promise);
		this.catch = this._promise.catch.bind(this._promise);
		this[Symbol.toStringTag] = 'Promise';
	}

	public promise(): Promise<any> {
		return this._promise;
	}
}
interface Promise<T> {
	done(onFulfilled: (value?: any) => any, onRejected: (reason?: any) => any): void;
	finally(callback: Function): Promise<T>;
}

if (!Promise.prototype.done)
{
	Promise.prototype.done = function (onFulfilled: (value?: any) => void, onRejected: (reason?: any) => void) {
		this.then(onFulfilled, onRejected)
			.catch(function (reason) {
				// 抛出一个全局错误
				setTimeout(() => { throw reason; }, 0);
			});
	};
}

if (!Promise.prototype.finally)
{
	Promise.prototype.finally = function (callback: Function) {
		let P = this.constructor as PromiseConstructor;
		return this.then(
			value => P.resolve(callback()).then(() => value),
			reason => P.resolve(callback()).then(() => { throw reason; })
		);
	};
}

function promiseWrap(callback: Function, ...args: any[]): Promise<any> {
	return Promise.resolve(callback.call(this, ...args));
}
/**
 * only one parameter
 * @param args
 */
function promiseReject(args?: any): Promise<any> {
	return Promise.reject(args);
}