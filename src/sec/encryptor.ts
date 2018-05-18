/// <reference path="rsa.ts" />
/// <reference path="../response/message.ts" />
/// <reference path="../polyfill/serialize.ts" />

namespace LP.sec {

	let ssl = new RSAGenerator(window.sessionStorage);

	export class Encryptor {

		constructor() {

		}

		public actived(): boolean {
			return typeof window['JSEncrypt'] != 'undefined' && !!window.sessionStorage;
		}

		public getPublicKey(): string {
			return this.actived() ? ssl.rsa.public : '';
		}

		private jsonError(content: string): TJson {
			return { result: 'error', message: { title: QUERY_LANGUAGE.error, content }, data: null };
		}

		public decrypt(json: TJson): TJson {
			if (typeof json != 'undefined'
				&& json instanceof Object
				&& typeof json.result != 'undefined'
				&& json.result == 'api'
				&& typeof json.encrypted == 'string'
			) {
				let key: string, encrypted_json: any, encrypted: string,
					base64js = window['base64js'],
					aesjs = window['aesjs'];

				try {
					key = ssl.decrypt(json.encrypted);
				} catch (e) {
					console.log(e.stack);
					return this.jsonError(QUERY_LANGUAGE.encrypt_key + e.message);
				}
				encrypted = json.data;
				try {
					let s = base64js.toByteArray(encrypted);
					encrypted_json = JSON.parse(aesjs.util.convertBytesToString(s)); //json_decode()
				} catch (e) {
					console.log(e.stack);
					return this.jsonError(QUERY_LANGUAGE.encrypt_string + e.message);
				}
				try {
					//base64 decode
					let keyBytes = base64js.toByteArray(key),
						ivBytes = base64js.toByteArray(encrypted_json.iv),
						valueBytes = base64js.toByteArray(encrypted_json.value);
					//aes cbc
					let aesCbc = new aesjs.ModeOfOperation.cbc(keyBytes, ivBytes);
					let decryptedBytes = aesCbc.decrypt(valueBytes);
					let decypted = aesjs.util.convertBytesToString(decryptedBytes);
					//unserialize
					json.data = unserialize(decypted);
				} catch (e) {
					console.log(e.stack);
					return this.jsonError(QUERY_LANGUAGE.encrypt_unserialize + e.message);
				}
			}
			delete json.encrypted;
			return json;
		}
	}
}