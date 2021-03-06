
namespace LP.http {

	export class jQueryAjax extends Base {

		constructor(timeout: number = 20000)
		{
			super();

			jQuery.ajaxSetup({
				headers: this.commonHeaders,
				timeout
			});
		}

		public static getInstance(): jQueryAjax {
			return new this() as jQueryAjax;
		}

		protected requestHandler(config: TRequestConfig, extra: any): Promise<any>
		{
			let _headers: JQuery.PlainObject = config.headers,
				_data = config.data;

			if (typeof jQuery['deparam'] != 'undefined' && config.data && config.data instanceof String) _data = jQuery['deparam'](config.data);
			//使用POST模拟的PUT或者DELETE等
			if (_data && _data._method) {
				config.method = _data._method;
				_headers['X-HTTP-Method-Override'] = config.method;
			}
			if (_data && _data._token) //add csrf
				_headers['X-CSRF-TOKEN'] = _data._token;

			return new Promise((resolve, reject) => {
				let c: JQuery.AjaxSettings = {
					url: config.url,
					data: _data ? _data : null,
					async: true,
					cache: false,
					type: config.method.toUpperCase(),
					method: config.method.toUpperCase(),
					headers: _headers,
					processData: _data instanceof FormData ? false : true,
					dataType: /[\?&](jsonp|callback)=\?/i.test(config.url) ? 'jsonp' : 'json',
					success: function (json: TJson, textStatus: JQuery.Ajax.SuccessTextStatus, jqXHR: JQuery.jqXHR<any>) {
						resolve(json);
					},
					error: function (XMLHttpRequest: JQuery.jqXHR, textStatus: JQuery.Ajax.ErrorTextStatus, errorThrown: string) {
						if (textStatus == 'error' && XMLHttpRequest instanceof Object && typeof XMLHttpRequest.responseJSON != 'undefined') {
							reject(new Exception(XMLHttpRequest.responseJSON)); // json 结构，尝试去Exception解析
						} else {
							reject(new Exception({XMLHttpRequest, textStatus, errorThrown}));
						}
					}
				};

				let _c = extend(true, {}, c, extra);

				_c['beforeSend'] = function(xhr: XMLHttpRequest) {
					if (typeof _headers['Authorization'] != 'undefined')
						xhr.setRequestHeader('Authorization', _headers['Authorization']);
					if (_c.processData === false && xhr.overrideMimeType)
						xhr.overrideMimeType("multipart/form-data");
				}
				if (_c.processData === false)
				{
					_c['enctype'] = 'multipart/form-data';
					_c['contentType'] = false;
					_c['mimeType'] = 'multipart/form-data';
				}

				jQuery.ajax(_c);
			});
		}

		protected decryptHandler(): void
		{
			let t = this;
			jQuery.ajaxSetup({
				dataFilter(data: any, type: string) {

					if (type.toLowerCase() == 'json') {
						let json : any;
						try {
							json = jQuery.parseJSON(data);
							json = t.encryptor.decrypt(json);
							data = JSON.stringify(json);
							if (typeof json.debug != 'undefined' && !!json.debug) console.log(json);

						} catch (e) {
							console.log(e);
						}
					}

					return data;
				}
			});
		}

		protected errorHandler(e: Exception | TStringable | string | TJson): void
		{
			if (e instanceof Exception)
			{
				let data = e.getData();
				if (data && typeof data['XMLHttpRequest'] != 'undefined' && typeof data['textStatus'] != 'undefined'){
					let textStatus: JQuery.Ajax.ErrorTextStatus = data.textStatus;
					switch (textStatus) {
						case 'timeout':
							LP.tip.toast(QUERY_LANGUAGE.network_timeout);
							break;
						case 'parsererror':
							LP.tip.toast(QUERY_LANGUAGE.parser_error);
							break;
						//case 'notmodified':
						case 'error':
						case 'abort':
						default:
							LP.tip.toast(QUERY_LANGUAGE.server_error);
							break;
					}
				} else
					LP.tip.json(e.getResult(), e.getMessage(), e.getTipType()!);

			} else if (typeof e['result'] != 'undefined') {
				LP.tip.json(e['result'], e['message'], e['tipType']);
			} else if (typeof e['toString'] != 'undefined') {
				LP.tip.toast(e.toString());
			} else if (typeof e == 'string') {
				LP.tip.toast(e);
			}
		}

		public static get(url: string, data?: any): Promise<any> {
			let q: jQueryAjax = new jQueryAjax();
			return q.request('get', url, data);
		}

		public static post(url: string, data: any): Promise<any> {
			let q: jQueryAjax = new jQueryAjax();
			return q.request('post', url, data);
		}

		public static form(url: string, $form: JQuery): Promise<any> {
			let q: jQueryAjax = new jQueryAjax();
			let data: JQuery.NameValuePair[] | FormData = $form.serializeArray();
			let $files = jQuery('input[type="file"]:not([name=""])', $form); // all files
			if ($form.is('[enctype="multipart/form-data"]') || $files.length > 0) {
				let _formData = new FormData();
				data.forEach(v => _formData.append(v.name, v.value));
				$files.each(function () {
					jQuery.each((this as HTMLInputElement).files, (i, file) => _formData.append(jQuery(this).attr('name')!, file));
				});
				data = _formData;
			}
			return q.request($form.attr('method')!, $form.attr('action')!, data);
		}

		public static head(url: string, data?: any): Promise<any> {
			let q: jQueryAjax = new jQueryAjax();
			return q.request('head', url, data);
		}

		public static options(url: string, data?: any): Promise<any> {
			let q: jQueryAjax = new jQueryAjax();
			return q.request('options', url, data);
		}

		public static patch(url: string, data?: any): Promise<any> {
			let q: jQueryAjax = new jQueryAjax();
			return q.request('patch', url, data);
		}

		public static put(url: string, data: any): Promise<any> {
			let q: jQueryAjax = new jQueryAjax();
			return q.request('put', url, data);
		}

		public static delete(url: string, data?: any): Promise<any> {
			let q: jQueryAjax = new jQueryAjax();
			return q.request('delete', url, data);
		}
	}
}