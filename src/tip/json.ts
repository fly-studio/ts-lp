/// <reference path="../polyfill/string.ts" />
/// <reference path="../lang.ts" />
/// <reference path="./base.ts" />

namespace LP.tip {

	export let diy_interface: TInterface | null = null;

	function diy(message: http.TMessage | string, result: string, tipType: http.TTipType): Promise<any>
	{
		let _message = formatMessage(message);

		return promiseWrap(() => {
			if (typeof diy_interface == 'function')
				return diy_interface(_message, result, tipType);
			else
				return window.alert(_message.content.noHTML());
		});
	}

	export function json(result: string, message: string | http.TMessage, tipType: http.TTipType): void
	{
		if (typeof message == 'undefined' || typeof tipType != 'object') return;
		else if (typeof message == 'string') message = { content: message };

		diy(message, result, tipType);

		switch (tipType.type) {
			case 'redirect':
				setTimeout(function () {
					self.location.href = tipType.url as string;
				}, tipType.timeout);
				break;
			case 'refresh':
				setTimeout(function () {
					self.location.reload();
					self.location.href = self.location.href;
				}, tipType.timeout);
				break;
			case 'back':
			case 'toast':
				break;
		}
	}
}