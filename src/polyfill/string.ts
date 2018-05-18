declare interface String {
	noHTML(): string;
	toHTML(): string;
	toPre(): string;
}

if (!String.prototype.noHTML)
{
/**
 * 删除所有HTML标签
 *
 * let str = "<a href=''>我爱你</a>".toPre();
 * 返回 '我爱你'
 *
 * @return {String}
 */
String.prototype.noHTML = function(): string {
	return strip_tags(this + '');
	/* if (typeof window != 'undefined')
	{
		let tmp = document.createElement("DIV");
		tmp.innerHTML = this + "";
		return tmp.textContent || tmp.innerText || "";
	} */
};
}

if (!String.prototype.toHTML){
/**
 * 转义字符串的HTML字符，主要有 < > " ' &
 * let str = '<a href="xxx">'.toHTML();
 * 返回 '&lt;a href=&quot;xxx&quot;&gt;'
 *
 * @return {String}
 */
String.prototype.toHTML = function (): string {
	return this.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};
}

if (!String.prototype.toPre) {
/**
 * 转义字符串的空格、回车、制表符，也就是将textarea输入的文本可以原样显示到屏幕
 * 类似于<pre>标签
 *
 * let str = " 空格\n第\t二行".toPre();
 * 返回 '&nbsp;空格<br />第&nbsp;&nbsp;&nbsp;&nbsp;二行'
 *
 * @return {String}
 */
String.prototype.toPre = function () {
	return this.replace(/\040/g, '&nbsp;').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
};
}

function _phpCastString(value: any): string {
	// original by: Rafał Kukawski
	//   example 1: _phpCastString(true)
	//   returns 1: '1'
	//   example 2: _phpCastString(false)
	//   returns 2: ''
	//   example 3: _phpCastString('foo')
	//   returns 3: 'foo'
	//   example 4: _phpCastString(0/0)
	//   returns 4: 'NAN'
	//   example 5: _phpCastString(1/0)
	//   returns 5: 'INF'
	//   example 6: _phpCastString(-1/0)
	//   returns 6: '-INF'
	//   example 7: _phpCastString(null)
	//   returns 7: ''
	//   example 8: _phpCastString(undefined)
	//   returns 8: ''
	//   example 9: _phpCastString([])
	//   returns 9: 'Array'
	//   example 10: _phpCastString({})
	//   returns 10: 'Object'
	//   example 11: _phpCastString(0)
	//   returns 11: '0'
	//   example 12: _phpCastString(1)
	//   returns 12: '1'
	//   example 13: _phpCastString(3.14)
	//   returns 13: '3.14'

	var type = typeof value

	switch (type) {
		case 'boolean':
			return value ? '1' : ''
		case 'string':
			return value
		case 'number':
			if (isNaN(value)) {
				return 'NAN'
			}

			if (!isFinite(value)) {
				return (value < 0 ? '-' : '') + 'INF'
			}

			return value + ''
		case 'undefined':
			return ''
		case 'object':
			if (Array.isArray(value)) {
				return 'Array'
			}

			if (value !== null) {
				return 'Object'
			}

			return ''
		case 'function':
		// fall through
		default:
			throw new Error('Unsupported value type')
	}
}

function strip_tags(input: string, allowed?: string): string { // eslint-disable-line camelcase
	//  discuss at: http://locutus.io/php/strip_tags/
	// original by: Kevin van Zonneveld (http://kvz.io)
	// improved by: Luke Godfrey
	// improved by: Kevin van Zonneveld (http://kvz.io)
	//    input by: Pul
	//    input by: Alex
	//    input by: Marc Palau
	//    input by: Brett Zamir (http://brett-zamir.me)
	//    input by: Bobby Drake
	//    input by: Evertjan Garretsen
	// bugfixed by: Kevin van Zonneveld (http://kvz.io)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// bugfixed by: Kevin van Zonneveld (http://kvz.io)
	// bugfixed by: Kevin van Zonneveld (http://kvz.io)
	// bugfixed by: Eric Nagel
	// bugfixed by: Kevin van Zonneveld (http://kvz.io)
	// bugfixed by: Tomasz Wesolowski
	// bugfixed by: Tymon Sturgeon (https://scryptonite.com)
	// bugfixed by: Tim de Koning (https://www.kingsquare.nl)
	//  revised by: Rafał Kukawski (http://blog.kukawski.pl)
	//   example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>')
	//   returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
	//   example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>')
	//   returns 2: '<p>Kevin van Zonneveld</p>'
	//   example 3: strip_tags("<a href='http://kvz.io'>Kevin van Zonneveld</a>", "<a>")
	//   returns 3: "<a href='http://kvz.io'>Kevin van Zonneveld</a>"
	//   example 4: strip_tags('1 < 5 5 > 1')
	//   returns 4: '1 < 5 5 > 1'
	//   example 5: strip_tags('1 <br/> 1')
	//   returns 5: '1  1'
	//   example 6: strip_tags('1 <br/> 1', '<br>')
	//   returns 6: '1 <br/> 1'
	//   example 7: strip_tags('1 <br/> 1', '<br><br/>')
	//   returns 7: '1 <br/> 1'
	//   example 8: strip_tags('<i>hello</i> <<foo>script>world<</foo>/script>')
	//   returns 8: 'hello world'
	//   example 9: strip_tags(4)
	//   returns 9: '4'


	// making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');

	let tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
	let commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

	let after = _phpCastString(input);
	// recursively remove tags to ensure that the returned string doesn't contain forbidden tags after previous passes (e.g. '<<bait/>switch/>')
	while (true) {
		let before = after;
		after = before.replace(commentsAndPhpTags, '').replace(tags, function ($0: string, $1: string) {
			return allowed!.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
		})

		// return once no more tags are removed
		if (before === after) {
			return after;
		}
	}
}