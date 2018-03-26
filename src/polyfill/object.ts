/**
 * 将一个Array或者Object按树形结构alert出来、或返回
 *
 * @param  {Objbect/Array} array      传入的数组或者对象
 * @param  {Boolean} return_val 是否返回，默认是alert出
 * @return {String}             树形结构
 */
function print_r(array: any, return_val: boolean = true): string {
	let output = '',
		pad_char = ' ',
		pad_val = 4,
		getFuncName = function (fn: any) {
			let name = (/\W*function\s+([\w\$]+)\s*\(/).exec(fn);
			if (!name) return '(Anonymous)';
			return name[1];
		};
	let repeat_char = function (len: number, pad_char: string) {
		let str = '';
		for (let i = 0; i < len; i++)
			str += pad_char;
		return str;
	};
	let formatArray = function (obj: any, cur_depth: number, pad_val: number, pad_char: string) {
		if (cur_depth > 0)
			cur_depth++;

		let base_pad = repeat_char(pad_val * cur_depth, pad_char);
		let thick_pad = repeat_char(pad_val * (cur_depth + 1), pad_char);
		let str = '';

		if (typeof obj === 'object' && obj !== null && obj.constructor && getFuncName(obj.constructor) !== 'PHPJS_Resource') {
			str += 'Array\n' + base_pad + '(\n';
			for (let key in obj) {
				if (Object.prototype.toString.call(obj[key]) === '[object Array]')
					str += thick_pad + '[' + key + '] => ' + formatArray(obj[key], cur_depth + 1, pad_val, pad_char);
				else
					str += thick_pad + '[' + key + '] => ' + obj[key] + '\n';
			}
			str += base_pad + ')\n';
		} else if (obj === null || obj === undefined)
			str = '';
		else // for our "resource" class
			str = obj.toString();
		return str;
	};

	output = formatArray(array, 0, pad_val, pad_char);
	if (return_val !== true) {
		alert(output);
		return output;
	}
	return output;
}

/**
 * Extends the object in the first argument using the object in the second argument.
 * @method extend
 * @param {boolean} deep
 * @param {} obj
 * @return {} obj extended
 */
function extend(deep: any, obj: any, ...args: any[]) {
	let argsStart: number,
		deepClone: boolean,
		firstArg: any;

	if (typeof deep === 'boolean') {
		argsStart = 2;
		deepClone = deep;
		firstArg = obj;
	} else {
		argsStart = 1;
		firstArg = deep;
		deepClone = true;
	}

	for (let i = argsStart; i < arguments.length; i++) {
		let source = arguments[i];

		if (source) {
			for (let prop in source) {
				if (deepClone && source[prop] && source[prop].constructor === Object) {
					if (!firstArg[prop] || firstArg[prop].constructor === Object) {
						firstArg[prop] = firstArg[prop] || {};
						extend(firstArg[prop], deepClone, source[prop]);
					} else {
						firstArg[prop] = source[prop];
					}
				} else {
					firstArg[prop] = source[prop];
				}
			}
		}
	}

	return firstArg;
}