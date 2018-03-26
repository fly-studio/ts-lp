/// <reference path="../lang.ts" />
/// <reference path="../sec/encryptor.ts" />
/// <reference path="../tip/json.ts" />

namespace LP.http {

	export type TMessage = {
		title?: string,
		content: string,
	};
	export type TTipType = {
		url: boolean | string,
		type: string,
		timeout?: number,
	}
	export type TJson = {
		result: string,
		message: string | TMessage,
		data: any,
		tipType?: TTipType,
		encrypted?: string,
	};

	export type TRequestConfig = {
		method: string,
		url: string,
		data: any,
		headers: Object,
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
		public autoTip: boolean = false;
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
		}

		public setAutoTip(autoTip: boolean): Base
		{
			this.autoTip = autoTip;
			return this;
		}

		public static getCSRF(): string
		{
			let dom = document.querySelector('meta[name="csrf-token"]');
			return dom ? dom.getAttribute('content') as string : '';
		}

		public setHeader(kv: Object): Base;
		public setHeader(key: string, value: string): Base;
		public setHeader(key: string | Object, value?: string): Base {
			if (value == null)
				this.headers = key;
			else
				this.headers[key.toString()] = value;

			return this;
		}

		public setConfig(key: string, value: string): Base {
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
						if (this.autoTip)
							this.errorHandler(json);
						return json;
					}
					else
					{
						throw json;
					}
				}
				return json;
			}).catch(e => {
				if (this.autoTip)
					this.errorHandler(e);
				throw e;
			});
		}

		protected abstract requestHandler(config: TRequestConfig, extra: any): Promise<any>;
		protected abstract decryptHandler(): void;
		protected abstract errorHandler(e: any): void;

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