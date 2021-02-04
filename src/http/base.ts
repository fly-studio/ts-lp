/// <reference path="../lang.ts" />
/// <reference path="../response/message.ts" />
/// <reference path="../response/exception.ts" />
/// <reference path="../sec/encryptor.ts" />
/// <reference path="../tip/json.ts" />

namespace LP.http {

	export type TRequestConfig = {
		method: string,
		url: string,
		data: any,
		headers: Object,
	}

	export enum TIP_MASK {
		ALERT_RUNTIME_ERROR = 1,
		ALERT_SERVER_ERROR = 2,
		ALERT_SUCCESS = 4,
		ALERT_ERROR = ALERT_RUNTIME_ERROR | ALERT_SERVER_ERROR,
		ALERT_ALL = ALERT_RUNTIME_ERROR | ALERT_SERVER_ERROR | ALERT_SUCCESS,
	}

	export function objectToForm(data: Object): FormData {
		let formData: FormData;
		if (data instanceof FormData)
			formData = data;
		else {
			formData = new FormData();
			for (let k in data)
				formData.append(k, data[k]);
		}
		return formData;
	}


	export abstract class Base {
		protected commonHeaders: any;
		protected headers: any;
		protected config: any;
		protected tipMask: number = 0;
		protected encryptor: LP.sec.Encryptor;

		constructor()
		{
			this.encryptor = new LP.sec.Encryptor();
			this.commonHeaders = {
				'X-Requested-With': 'XMLHttpRequest',
				'X-CSRF-TOKEN': Base.getCSRF(),
				'X-RSA': encodeURIComponent(this.encryptor.getPublicKey()),
			};
			this.headers = {};
			this.tipMask = 0;
		}

		public alertMask(mask: number): this
		{
			this.tipMask |= mask;
			return this;
		}

		public alertAll(tip: boolean = true): this
		{
			this.tipMask = tip ? TIP_MASK.ALERT_ALL : 0;
			return this;
		}

		public alertRuntimeError(tip: boolean = true): this
		{
			if (tip)
				this.tipMask |= TIP_MASK.ALERT_RUNTIME_ERROR;
			else
				this.tipMask ^= TIP_MASK.ALERT_RUNTIME_ERROR;
			return this;
		}

		public alertServerError(tip: boolean = true): this
		{
			if (tip)
				this.tipMask |= TIP_MASK.ALERT_SERVER_ERROR;
			else
				this.tipMask ^= TIP_MASK.ALERT_SERVER_ERROR;
			return this;
		}

		public alertError(tip: boolean = true): this
		{
			if (tip)
				this.tipMask |= TIP_MASK.ALERT_ERROR;
			else
				this.tipMask ^= TIP_MASK.ALERT_ERROR;
			return this;
		}

		public alertSuccess(tip: boolean = true): this
		{
			if (tip)
				this.tipMask |= TIP_MASK.ALERT_SUCCESS;
			else
				this.tipMask ^= TIP_MASK.ALERT_SUCCESS;
			return this;
		}

		public static getCSRF(): string
		{
			let dom = document.querySelector('meta[name="csrf-token"]');
			return dom ? dom.getAttribute('content') as string : '';
		}

		public setHeader(kv: Object): this;
		public setHeader(key: string, value: string): this;
		public setHeader(key: string | Object, value?: string): this {
			if (value == null)
				this.headers = key;
			else
				this.headers[key.toString()] = value;

			return this;
		}

		public setConfig(key: string, value: any): this {
			let obj: any = this.config,
				keys = key.split('.');

			for (let i = 0; i < keys.length - 1; i++) {
				let k = keys[i];
				obj[k] = typeof obj[k] != 'undefined' ? obj[k] : {};
				obj = obj[k];
			}
			obj[keys[keys.length - 1]] = value;

			return this;
		}

		public request(method: string, url: string, data?: any): Promise<any>
		{
			if (this.encryptor.actived())
				this.decryptHandler();

			return this.requestHandler({
				method,
				url,
				data,
				headers: this.headers
			}, this.config).then(json => {
				if (json instanceof Object && typeof json.result != 'undefined')
				{
					if (json.result == 'success' || json.result == 'api')
					{
						if (this.tipMask & TIP_MASK.ALERT_SUCCESS)
							this.errorHandler(json);
						return json;
					}
					else
					{
						return promiseReject(new Exception(json));
					}
				}
				return json;
			}).catch(e => {
				if (e instanceof Exception)
				{
					if (e.exceptionType == ExceptionType.SERVER && (this.tipMask & TIP_MASK.ALERT_SERVER_ERROR))
						this.errorHandler(e);
					else if (e.exceptionType == ExceptionType.RUNTIME && (this.tipMask & TIP_MASK.ALERT_RUNTIME_ERROR))
						this.errorHandler(e);

					return promiseReject(e);
				}

				return promiseReject(new Exception(e));
			});
		}

		protected abstract requestHandler(config: TRequestConfig, extra: any): Promise<any>;
		protected abstract decryptHandler(): void;
		protected abstract errorHandler(e: Exception | TStringable | string | TJson): void;

		public get(url: string, data?: any): Promise<any> {
			return this.request('get', url, data);
		}

		public post(url: string, data: any): Promise<any> {
			return this.request('post', url, data);
		}

		public head(url: string, data?: any): Promise<any> {
			return this.request('head', url, data);
		}

		public options(url: string, data?: any): Promise<any> {
			return this.request('options', url, data);
		}

		public patch(url: string, data?: any): Promise<any> {
			return this.request('patch', url, data);
		}

		public put(url: string, data: any): Promise<any> {
			return this.request('put', url, data);
		}

		public delete(url: string, data?: any): Promise<any> {
			return this.request('delete', url, data);
		}

	}
}