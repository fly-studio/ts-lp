namespace LP.sec {

	export interface IRSAKey {
		public: string;
		private: string;
	}

	//ssl
	export class RSAGenerator {
		public rsa: IRSAKey;

		constructor(cacheDriver: any = window.sessionStorage) {
			this.rsa = this.getRSAKeys(cacheDriver);
		}

		private getRSAKeys(cacheDriver: any): IRSAKey {
			let rsa_str: string | null = cacheDriver.getItem('l+rsa');
			let rsa: IRSAKey = rsa_str ? JSON.parse(rsa_str) : null;
			if (!rsa) {
				if (window['JSEncrypt'])
				{
					let crypt = new window['JSEncrypt']({ default_key_size: 1024 });
					let key = crypt.getKey();

					rsa = {
						private: key.getPrivateKey(),
						public: key.getPublicKey(),
					};

					cacheDriver.setItem('l+rsa', JSON.stringify(rsa));
				} else {
					rsa = {
						public: '',
						private: ''
					}
				}
			}
			return rsa;
		}

		public encrypt(text: string): string
		{
			if (!window['JSEncrypt']) return text;

			let crypt = new window['JSEncrypt']();
			crypt.setKey(this.rsa.public);
			return crypt.encrypt(text);
		}

		public decrypt(text: string): string
		{
			if (!window['JSEncrypt']) return text;

			let crypt = new window['JSEncrypt']();
			crypt.setKey(this.rsa.private);
			return crypt.decrypt(text);
		}
	}

}