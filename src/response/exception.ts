namespace LP {
	export enum ExceptionType {
		SERVER = 'server',
		RUNTIME = 'runtime',
	}
	export class Exception /* extends Error */ {

		public exceptionType: ExceptionType = ExceptionType.RUNTIME;
		public $json: TJson;
		public stack: string = '';
		public fileName: string = '';
		public lineNumber: number = 0;
		public columnNumber: number = 0;

		constructor(json: TJson);
		constructor(result: string, message: TMessage | string, data?: any, tipType?: TTipType);
		constructor(exception: Exception);
		constructor(exception: Error);
		constructor(message: string);
		constructor(data: any);
		constructor(result: string | TJson | Error | Exception | Object, message?: TMessage | string, data?: any, tipType?: TTipType)
		{
			if (typeof result == 'string')
			{
				if (message == null) { // 后面没参数了
					this.$json = {
						result: 'error',
						message: formatMessage(result),
						data,
						tipType
					};
				} else {
					this.$json = {
						result: result,
						message: formatMessage(message),
						data,
						tipType
					};
				}
				this.exceptionType = ExceptionType.RUNTIME;
			} else if (typeof result == "object") {
				if (result instanceof Exception || typeof result['exceptionType'] != 'undefined') {
					let _result = result as Exception
					this.$json = _result.$json;
					this.stack = _result.stack;
					this.fileName = _result.fileName;
					this.lineNumber = _result.lineNumber;
					this.columnNumber = _result.columnNumber;
					this.exceptionType = _result.exceptionType;
				} else if (result instanceof Error || typeof result['stack'] != 'undefined') {
					let _result = result as Exception

					this.stack = _result.stack;
					this.fileName = _result.fileName;
					this.lineNumber = _result.lineNumber;
					this.columnNumber = _result.columnNumber;
					this.exceptionType = ExceptionType.RUNTIME;
					this.$json = {
						result: 'error',
						message: formatMessage(_result.message),
						data: _result.stack,
					};
				} else if (typeof result == 'object' && typeof result['result'] != 'undefined') {
					this.$json = result as TJson;
					this.exceptionType = ExceptionType.SERVER;
				} else {
					this.$json = {
						result: 'error',
						message: '',
						data: result
					};
					this.exceptionType = ExceptionType.RUNTIME;
				}
			} else {
				this.$json = {
					result: 'error',
					message: '',
					data: result
				};
				this.exceptionType = ExceptionType.RUNTIME;
			}
			if (!this.stack)
				this.stack = this.stacktrace()!;

		}

		private stacktrace(): string|undefined {
			let error = new Error();
			if (error.stack)
			{
				let arr = error.stack.split('\n');
				arr.splice(1, 2);
				return arr.join('\n');
			}
			return error.stack;
			/* function st(f: Function): Array<string> {
				return !f ? [] :
					st(f.caller)
						.concat([
							f.toString()
								.split('(')[0]
								.substring(9)
							+ '(' + [].concat(f.arguments).join(',') + ')'
						]);
			}
			return st(arguments.callee.caller); */
		}

		public get result(): string {
			return this.getResult();
		}

		public get data(): any {
			return this.getData();
		}

		public get message(): TMessage {
			return this.getData();
		}

		public get tipType(): TTipType|undefined {
			return this.getTipType();
		}

		public getResult(): string {
			return this.$json.result;
		}

		public getData(): any {
			return this.$json.data;
		}

		public toString(): string {
			return this.getMessage().content;
		}

		public getMessage(): TMessage {
			return formatMessage(this.$json.message);
		}

		public getTipType(): TTipType|undefined {
			return this.$json.tipType;
		}

	}
}
