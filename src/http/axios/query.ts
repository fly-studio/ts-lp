namespace LP.http {
	export class axiosAjax extends Base {

		protected instance: AxiosInstance;

		constructor(baseURL?: string, timeout: number = 20000)
		{
			super();

			this.instance = axios.create({
				baseURL: baseURL == null ? '' : baseURL,
				timeout: timeout,
				headers: this.commonHeaders,
				responseType: 'json',
				xsrfHeaderName: 'X-CSRF-TOKEN',
				xsrfCookieName: 'XSRF-TOKEN', // read from cookie
				// `transformRequest` allows changes to the request data before it is sent to the server
				// This is only applicable for request methods 'PUT', 'POST', and 'PATCH'
				// The last function in the array must return a string or an instance of Buffer, ArrayBuffer,
				// FormData or Stream
				// You may modify the headers object.
				transformRequest: [(data, headers) => {
					// Do whatever you want to transform the data
					return data;
				}],
				// `transformResponse` allows changes to the response data to be made before
				// it is passed to then/catch
				transformResponse: [function (data) {
					// Do whatever you want to transform the data

					return data;
				}],
			});
		}

		protected requestHandler(config: TRequestConfig, extra: any): AxiosPromise<any>
		{
			let params = config.method.toLowerCase() == 'get' ? config.data : {};
			if (config.method.toLowerCase() == 'get')
				config.data = null;
			let c: AxiosRequestConfig = {
				method: config.method.toLowerCase(),
				url: config.url,
				params: params,
				data: config.data,
				headers: config.headers
			};

			let _c = extend(true, {}, c, extra);

			return this.instance.request(_c);
		}

		protected decryptHandler(): void
		{
			let t = this;
			this.instance.defaults.transformResponse = [
				function (data) {

					let json = data;
					try {

						json = t.encryptor.decrypt(json);
						data = json;

					} catch (e) {
						console.log(e);
					}
					return data;
				}
			];
		}

		protected errorHandler(e: any): void {
			if (e instanceof Error) {

			} else if (e instanceof Object && typeof e.result != 'undefined') {
				LP.tip.json(e.result, e.message, e.tipType);
			}
		}

		public static get(url: string, data?: any): Promise<any> {
			let q: axiosAjax = new axiosAjax();
			return q.request('get', url, data);
		}

		public static post(url: string, data: any): Promise<any> {
			let q: axiosAjax = new axiosAjax();
			return q.request('post', url, data);
		}

		public static form(url: string, data: Object): Promise<any> {
			let q: axiosAjax = new axiosAjax();
			return q.request('post', url, objectToForm(data));
		}

		public static head(url: string, data?: any): Promise<any> {
			let q: axiosAjax = new axiosAjax();
			return q.request('head', url, data);
		}

		public static options(url: string, data?: any): Promise<any> {
			let q: axiosAjax = new axiosAjax();
			return q.request('options', url, data);
		}

		public static patch(url: string, data?: any): Promise<any> {
			let q: axiosAjax = new axiosAjax();
			return q.request('patch', url, data);
		}

		public static put(url: string, data: any): Promise<any> {
			let q: axiosAjax = new axiosAjax();
			return q.request('put', url, data);
		}

		public static delete(url: string, data?: any): Promise<any> {
			let q: axiosAjax = new axiosAjax();
			return q.request('delete', url, data);
		}
	}
}