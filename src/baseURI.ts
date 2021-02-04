/// <reference path="polyfill/deferredPromise.ts" />

namespace LP {
	//base uri
	let thiscript = window.document.currentScript;
	if (!thiscript) {
		let scripts = window.document.getElementsByTagName("script");
		thiscript = scripts[scripts.length - 1];
	}
	let src = thiscript['src'] ? thiscript['src'] : thiscript.getAttribute('src');
	let _baseuri = src.toString().match(/[^\/:](\/.*)static\/js\/lp(\.min)?\.js/i) ? src.toString().match(/[^\/:](\/.*)static\/js\/lp(\.min)?\.js/i)[1] : src.toString().replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '') + '/';
	if (!_baseuri) _baseuri = '/';

	export let baseuri = _baseuri;

	if (typeof jQuery != 'undefined') jQuery['baseuri'] = _baseuri;
}