/// <reference path="../polyfill/string.ts" />
/// <reference path="../http/base.ts" />
/// <reference path="../lang.ts" />

namespace LP.tip {

	export type TMessage = http.TMessage;

	export type TInterface = (message: TMessage, ...args: any[]) => Promise<any>;

	export let toast_interface: TInterface|null = null;
	export let alert_interface: TInterface|null = null;
	export let confirm_interface: TInterface|null = null;
	export let prompt_interface: TInterface|null = null;

	export function formatMessage(message: TMessage| string): TMessage
	{
		return !(message instanceof Object) ? { content: message } : message;
	}

	export function toast(message: TMessage|string, timeout: number = 1000): Promise<any>
	{
		let _message = formatMessage(message);

		return promiseWrap(() => {
			if (typeof toast_interface == 'function')
				return toast_interface(_message, timeout)
			else
				window.alert(_message.content.noHTML());
		});
	}

	export function alert(message: TMessage | string, confirm_callback?: Function): Promise<any>
	{
		let _message = formatMessage(message);

		return promiseWrap(() => {
			if (typeof alert_interface == 'function')
				return alert_interface(_message);
			else
				window.alert(_message.content.noHTML());
		}).then(() => {
			if (confirm_callback && typeof confirm_callback == 'function') confirm_callback.call(void 0);
		});
	}


	export function confirm(message: TMessage | string, confirm_callback?: Function, cancel_callback?: Function): Promise<any>
	{
		let _message = formatMessage(message);

		return promiseWrap(() => {
			if (typeof confirm_interface == 'function')
				return confirm_interface(_message);
			else
			{
				if (!window.confirm(_message.content.noHTML()))
					throw '';
			}
		}).then(() => {
			if (confirm_callback && typeof confirm_callback == 'function') confirm_callback.call(void 0);
		}, () => {
			if (cancel_callback && typeof cancel_callback == 'function') cancel_callback.call(void 0);
		});
	}


	export function prompt(message: TMessage | string, confirm_callback?: Function, cancel_callback?: Function): Promise<any>
	{
		let _message = formatMessage(message);

		return promiseWrap(() => {
			if (typeof prompt_interface == 'function')
				return prompt_interface(_message);
			else
			{
				let v: string | null = window.prompt(_message.content.noHTML());
				if (!v)
					throw '';
				else
					return v;
			}
		}).then(v => {
			if (confirm_callback && typeof confirm_callback == 'function') confirm_callback.call(void 0, v);
		}, () => {
			if (cancel_callback && typeof cancel_callback == 'function') cancel_callback.call(void 0);
		});
	}

}