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
String.prototype.noHTML = function (): string {
	return this.replace(/<script[^>]*?>.*?<\/script>/ig, '').replace(/<[\/\!]*?[^<>]*?>/g, '').replace(/<style[^>]*?>.*?<\/style>/ig, '').replace(/<![\s\S]*?--[ \t\n\r]*>/, '').replace(/([\r\n])[\s]+/, '').replace(/&(quot|#34|amp|#38|lt|#60|gt|#62|nbsp|#160)/i, '');
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
 * var str = " 空格\n第\t二行".toPre();
 * 返回 '&nbsp;空格<br />第&nbsp;&nbsp;&nbsp;&nbsp;二行'
 *
 * @return {String}
 */
String.prototype.toPre = function () {
	return this.replace(/\040/g, '&nbsp;').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
};
}