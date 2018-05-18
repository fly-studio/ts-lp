namespace LP {
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

	export interface TStringable {
		toString(): string;
	}

	export function formatMessage(message: TMessage | string): TMessage {
		return typeof message != 'object' ? { content: message } : message;
	}
}