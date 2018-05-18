/// <reference path="../polyfill/string.ts" />
/// <reference path="../lang.ts" />
/// <reference path="./base.ts" />

namespace LP.tip {

	export let diy_interface: TInterface | null = null;

	function diy(message: TMessage, result: string, tipType: TTipType): Promise<any>
	{
		return promiseWrap(() => {
			if (typeof diy_interface == 'function')
				return diy_interface(message, result, tipType);
			else
				return window.alert(message.content.noHTML());
		});
	}

	export function json(result: string, message: string | TMessage, tipType: TTipType): void
	{
		if (typeof message != 'undefined'){
			if (typeof message == 'string')
				message = formatMessage(message);

			diy(message, result, tipType);
		}

		if (typeof tipType != 'object') return;

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