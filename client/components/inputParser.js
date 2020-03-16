export default {encode, decode};

export function websocket(input) {
	if (input === undefined || (input + "").trim() === "") {
		return input;
	} else {
		return (input + "").trim().replace(/\s/g, "%20");
	}
}

export function encode(input) {
	if (input != null && (input + "").trim() !== "") {

		let newString = "";
		let regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*/

		for (let i = 0; i < input.length; i++) {
			let decimal = input.codePointAt(i);

			//36=$, $ can be used in file names (for serverside files) and urls (for websockets)
			if ((decimal < 48 || decimal > 57) && (decimal < 65 || decimal > 90) && (decimal < 97 || decimal > 122) && decimal !== 32) {
				let encoded = "$" + decimal + "$";
				newString+=encoded;

				if (regex.test(String.fromCodePoint(decimal))) {
					input = input.slice(0, i) + input.slice(i+1);
				}
			} else {
				newString+=input.charAt(i);
			}
		}

		return newString;
	} else return input;
}

export function decode(input) {
	if (input != null && (input + "").trim() !== "") {
		let result = "";
		for (let i = 0; i< input.length; i++) {
			if (input.charAt(i) === '$') {
				i+=1;
				let e = "";
				while (input.charAt(i) !== "$") {
					e+=input.charAt(i);
					i++;
					if (i > input.length) {
						return input;
					}
				}
				result+=String.fromCodePoint(parseInt(e));
			} else {
				result+=input.charAt(i);
			}
		}
		return result;
	} else {
		return input;
	}
}
