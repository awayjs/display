import { TextField } from '../display/TextField';
import { TextFormat } from './TextFormat';
import { parse } from 'node-html-parser';

export class HTMLTextProcessor {
	private static instance: HTMLTextProcessor;
	public static get() {
		if (!HTMLTextProcessor.instance)
			HTMLTextProcessor.instance = new HTMLTextProcessor();
		return HTMLTextProcessor.instance;
	}

	constructor() {

	}

	public processHTML(target_tf: TextField, input: string): string {

		//console.log("html in", input);
		input = input.replace(new RegExp('&nbsp;', 'g'), ' ');
		input = input.replace(new RegExp('â', 'g'), String.fromCharCode(8730));
		input = input.replace(new RegExp('Ã', 'g'), String.fromCharCode(215));
		input = input.replace(new RegExp('<\\\\', 'g'), '</');
		input = input.replace(new RegExp('<br>', 'g'), '<br/>');
		input = input.replace(new RegExp('<BR>', 'g'), '<br/>');
		input = input.replace(new RegExp('<BR/>', 'g'), '<br/>');
		input = input.replace(new RegExp('<B', 'g'), '<b');
		input = input.replace(new RegExp('</B>', 'g'), '</b>');
		input = input.replace(new RegExp('<I', 'g'), '<i');
		input = input.replace(new RegExp('</I>', 'g'), '</i>');
		input = input.replace(new RegExp('<P', 'g'), '<p');
		input = input.replace(new RegExp('</P>', 'g'), '</p>');
		input = input.replace(new RegExp('<U', 'g'), '<u');
		input = input.replace(new RegExp('</U>', 'g'), '</u>');
		input = input.replace(new RegExp('<LI', 'g'), '<li');
		input = input.replace(new RegExp('</LI>', 'g'), '</li>');
		input = input.replace(new RegExp('<FONT', 'g'), '<font');
		input = input.replace(new RegExp('</FONT>', 'g'), '</font>');

		input = input.replace(new RegExp('& ', 'g'), '&amp; ');

		// 	some preprocessing to make sure that html-tags are closing
		// 	todo: this can probably be done better
		let cnt = 0;
		const openTags: any[] = [];
		const insertAt: number[] = [];
		const insert: any[] = [];
		while (cnt < input.length) {
			if (input[cnt] == '<') {
				if (input[cnt + 1] == 'p') {
					//console.log("html p");
					openTags[openTags.length] = 'p';
				} else if (input[cnt + 1] == 'b' && input[cnt + 2] != 'r') {
					//console.log("html b");
					openTags[openTags.length] = 'b';
				} else if (input[cnt + 1] == 'i') {
					//console.log("html i");
					openTags[openTags.length] = 'i';
				} else if (input[cnt + 1] == 'u') {
					//console.log("html i");
					openTags[openTags.length] = 'u';
				} else if (input[cnt + 1] == 'f' && input[cnt + 2] == 'o'
					&& input[cnt + 3] == 'n' && input[cnt + 4] == 't') {
					//console.log("html font");
					openTags[openTags.length] = 'font';
					cnt += 2;
				} else if (input[cnt + 1] == 'l' && input[cnt + 2] == 'i') {
					//console.log("html font");
					openTags[openTags.length] = 'li';
					cnt++;
				} else if (input[cnt + 1] == '/' && input[cnt + 2] == 'p') {
					let c: number = openTags.length;
					let lastOpenTag: number = -1;
					while (c > 0) {
						c--;
						if (openTags[c] == 'p') {
							lastOpenTag = c;
							break;
						}
					}
					if (lastOpenTag < 0) {
						insertAt[insertAt.length] = cnt;
						insert[insert.length] = 4;
					} else {
						c = openTags.length - 1;
						while (c > lastOpenTag) {
							insertAt[insertAt.length] = cnt;
							insert[insert.length] = '</' + openTags[c] + '>';
							openTags.pop();
							c--;
						}
						openTags.pop();
					}
				} else if (input[cnt + 1] == '/' && input[cnt + 2] == 'b') {
					let c: number = openTags.length;
					let lastOpenTag: number = -1;
					while (c > 0) {
						c--;
						if (openTags[c] == 'b') {
							lastOpenTag = c;
							break;
						}
					}
					if (lastOpenTag < 0) {
						insertAt[insertAt.length] = cnt;
						insert[insert.length] = 4;
					} else {
						c = openTags.length - 1;
						while (c > lastOpenTag) {
							insertAt[insertAt.length] = cnt;
							insert[insert.length] = '</' + openTags[c] + '>';
							openTags.pop();
							c--;
						}
						openTags.pop();
					}
				} else if (input[cnt + 1] == '/' && input[cnt + 2] == 'i') {
					let c: number = openTags.length;
					let lastOpenTag: number = -1;
					while (c > 0) {
						c--;
						if (openTags[c] == 'i') {
							lastOpenTag = c;
							break;
						}
					}
					if (lastOpenTag < 0) {
						insertAt[insertAt.length] = cnt;
						insert[insert.length] = 4;
					} else {
						c = openTags.length - 1;
						while (c > lastOpenTag) {
							insertAt[insertAt.length] = cnt;
							insert[insert.length] = '</' + openTags[c] + '>';
							openTags.pop();
							c--;
						}
						openTags.pop();
					}
				} else if (input[cnt + 1] == '/' && input[cnt + 2] == 'u') {
					let c: number = openTags.length;
					let lastOpenTag: number = -1;
					while (c > 0) {
						c--;
						if (openTags[c] == 'u') {
							lastOpenTag = c;
							break;
						}
					}
					if (lastOpenTag < 0) {
						insertAt[insertAt.length] = cnt;
						insert[insert.length] = 4;
					} else {
						c = openTags.length - 1;
						while (c > lastOpenTag) {
							insertAt[insertAt.length] = cnt;
							insert[insert.length] = '</' + openTags[c] + '>';
							openTags.pop();
							c--;
						}
						openTags.pop();
					}
				} else if (input[cnt + 1] == '/' && input[cnt + 2] == 'l' && input[cnt + 3] == 'i') {
					let c: number = openTags.length;
					let lastOpenTag: number = -1;
					while (c > 0) {
						c--;
						if (openTags[c] == 'li') {
							lastOpenTag = c;
							break;
						}
					}
					if (lastOpenTag < 0) {
						insertAt[insertAt.length] = cnt;
						insert[insert.length] = 7;
					} else {
						c = openTags.length - 1;
						while (c > lastOpenTag) {
							insertAt[insertAt.length] = cnt;
							insert[insert.length] = '</' + openTags[c] + '>';
							openTags.pop();
							c--;
						}
						openTags.pop();
					}
				} else if (input[cnt + 1] == '/' && input[cnt + 2] == 'f'
					&& input[cnt + 3] == 'o' && input[cnt + 4] == 'n' && input[cnt + 5] == 't') {
					let c: number = openTags.length;
					let lastOpenTag: number = -1;
					while (c > 0) {
						c--;
						if (openTags[c] == 'font') {
							lastOpenTag = c;
							break;
						}
					}
					if (lastOpenTag < 0) {
						insertAt[insertAt.length] = cnt;
						insert[insert.length] = 7;
					} else {
						c = openTags.length - 1;
						while (c > lastOpenTag) {
							insertAt[insertAt.length] = cnt;
							insert[insert.length] = '</' + openTags[c] + '>';
							openTags.pop();
							c--;
						}
						openTags.pop();
					}
				}
				cnt++;
			} else {
				cnt++;
			}
		}
		let c: number = openTags.length;
		while (c > 0) {
			c--;
			insertAt[insertAt.length] = cnt;
			insert[insert.length] = '</' + openTags[c] + '>';
		}
		let additional: number = 0;
		const len: number = insert.length;
		for (let i: number = 0; i < len;i++) {
			if (typeof insert[i] === 'number') {
				input = input.slice(0, insertAt[i] + additional) + input.slice(insertAt[i] + additional + insert[i]);
				additional -= insert[i];
			} else {
				input = input.slice(0, insertAt[i] + additional) + insert[i] + input.slice(insertAt[i] + additional);
				additional += insert[i].length;
			}
		}

		//console.log("html fixed",  input);
		const textProps: any = {
			text:''
			/*size:this.textFormat.size,
			color:this.textFormat.color,
			indent:this.le,
			leftMargin:symbol.tag.leftMargin/20,
			rightMargin:symbol.tag.rightMargin/20,
			variableName:symbol.tag.variableName,
			align:symbol.tag.align,
			multiline:false*/
		};

		target_tf._textFormat.italic = false;
		target_tf._textFormat.bold = false;
		//target_tf._textFormat.align=TextFormatAlign.LEFT;
		target_tf._textFormats = [target_tf._textFormat];
		//target_tf._textFormat.size=16;
		target_tf._textFormatsIdx = [0];
		const doc = parse(input);
		if (doc && doc.firstChild) {
			textProps.multiline = doc.firstChild.childNodes.length > 0;
			this.readHTMLTextPropertiesRecursive(target_tf, doc, textProps, target_tf._textFormat);
		}
		if (textProps.text != '' && ((textProps.text.charCodeAt(textProps.text.length - 1) == 13)
			|| (textProps.text.charCodeAt(textProps.text.length - 1) == 10))) {
			textProps.text = textProps.text.slice(0, textProps.text.length - 1);
		}
		if (textProps.text != '' && (textProps.text.length >= 2
			&& textProps.text[textProps.text.length - 1] == 'n' && textProps.text[textProps.text.length - 2] == '\\')) {
			textProps.text = textProps.text.slice(0, textProps.text.length - 2);
		}
		if (textProps.text != '' && (textProps.text.length >= 2
			&& textProps.text[textProps.text.length - 1] == 'n'
			&& textProps.text[textProps.text.length - 2] == '\\')) {
			textProps.text = textProps.text.slice(0, textProps.text.length - 2);
		}
		target_tf._textFormatsIdx[target_tf._textFormatsIdx.length - 1] =
			textProps.text.replace(/(\r\n|\n|\\n|\r)/gm,'').length;
		return textProps.text;
	}

	private readHTMLTextPropertiesRecursive(target_tf: TextField, myChild, textProps: any, currentFormat: TextFormat) {

		//console.log("textfied content xml node:",myChild);
		//console.log(myChild.tagName);
		const newProps_values: any[] = [];
		const newProps_names: string[] = [];
		if (myChild.attributes) {
			if ((<any>myChild.attributes).size || (<any>myChild.attributes).SIZE) {
				let value = (<any>myChild.attributes).size ?
					(<any>myChild.attributes).size : (<any>myChild.attributes).SIZE;
				value = value.replace(/[^0-9.]/g, '');
				newProps_values[newProps_values.length] = parseInt(value);
				newProps_names[newProps_names.length] = 'size';
			}
			if ((<any>myChild.attributes).color || (<any>myChild.attributes).COLOR) {
				let value = (<any>myChild.attributes).color ?
					(<any>myChild.attributes).color : (<any>myChild.attributes).COLOR;
				value = value.replace('#', '0x');
				newProps_values[newProps_values.length] = parseInt(value);
				newProps_names[newProps_names.length] = 'color';
			}
			if ((<any>myChild.attributes).indent || (<any>myChild.attributes).INDENT) {
				let value = (<any>myChild.attributes).indent ?
					(<any>myChild.attributes).indent : (<any>myChild.attributes).INDENT;
				value = value.replace(/[^0-9.]/g, '');
				newProps_values[newProps_values.length] = parseInt(value);
				newProps_names[newProps_names.length] = 'indent';
			}
			if ((<any>myChild.attributes).leftMargin || (<any>myChild.attributes).LEFTMARGIN) {
				let value = (<any>myChild.attributes).leftMargin ?
					(<any>myChild.attributes).leftMargin : (<any>myChild.attributes).LEFTMARGIN;
				value = value.replace(/[^0-9.]/g, '');
				newProps_values[newProps_values.length] = parseInt(value);
				newProps_names[newProps_names.length] = 'leftMargin';
			}
			if ((<any>myChild.attributes).rightMargin || (<any>myChild.attributes).RIGHTMARGIN) {
				let value = (<any>myChild.attributes).rightMargin ?
					(<any>myChild.attributes).rightMargin : (<any>myChild.attributes).RIGHTMARGIN;
				value = value.replace(/[^0-9.]/g, '');
				newProps_values[newProps_values.length] = parseInt(value);
				newProps_names[newProps_names.length] = 'rightMargin';
			}
			if ((<any>myChild.attributes).align || (<any>myChild.attributes).ALIGN) {
				const value = (<any>myChild.attributes).align ?
					(<any>myChild.attributes).align : (<any>myChild.attributes).ALIGN;
				newProps_values[newProps_values.length] = value;
				newProps_names[newProps_names.length] = 'align';
			}
			if ((<any>myChild.attributes).face || (<any>myChild.attributes).FACE) {
				const value = (<any>myChild.attributes).face ?
					(<any>myChild.attributes).face : (<any>myChild.attributes).FACE;
				newProps_values[newProps_values.length] = value;
				newProps_names[newProps_names.length] = 'font';
			}
		}
		let i = newProps_values.length;
		let cloneFormat = false;
		while (i > 0) {
			i--;
			if (currentFormat[newProps_names[i]] != newProps_values[i]) {
				cloneFormat = true;
				break;
			}
		}
		/*if(target_tf._textFormats[target_tf._textFormats.length-1]!=currentFormat){
			target_tf._textFormats.push(currentFormat);
			target_tf._textFormatsIdx.push(textProps.text.length);

		}*/

		// check if this is a paragraph. if it is, we want to add a linebreak in case there is text already present
		// we also check if there is already a linebreak in the text, and do not add another if there is
		/*
		if (myChild.tagName == 'p') {
			if(textProps.text!="" && !(textProps.text.length>2 && textProps.text[textProps.text.length-1]=="n"
				&& textProps.text[textProps.text.length-2]=="\\")){

				textProps.text+="\\n";
			}
		}
		*/
		if (myChild.tagName == 'b') {
			if (!currentFormat.bold) {
				cloneFormat = true;
				newProps_values[newProps_values.length] = true;
				newProps_names[newProps_names.length] = 'bold';
			}
		} else if (myChild.tagName == 'i') {
			if (!currentFormat.italic) {
				cloneFormat = true;
				newProps_values[newProps_values.length] = true;
				newProps_names[newProps_names.length] = 'italic';
			}
		} else if (myChild.tagName == 'u') {
			if (!currentFormat.underline) {
				cloneFormat = true;
				newProps_values[newProps_values.length] = true;
				newProps_names[newProps_names.length] = 'underline';
			}
		} else if (myChild.tagName == 'font') {
			// todo
			cloneFormat = true;
		} else if (myChild.tagName == 'li') {
		/*	if(textProps.text!="" && !(textProps.text.length>2 && textProps.text[textProps.text.length-1]=="n"
			&& textProps.text[textProps.text.length-2]=="\\")){
				textProps.text+="\\n";
			}*/
			textProps.text += '    ●    ';
		} else if (myChild.tagName == 'br' && target_tf.multiline) {
			textProps.text += '\n';
		}

		let childFormat: TextFormat = currentFormat;
		if (cloneFormat) {
			childFormat = currentFormat.clone();//(FontStyleName.BOLD);
			i = newProps_values.length;
			while (i > 0) {
				i--;
				childFormat[newProps_names[i]] = newProps_values[i];
			}
			target_tf._textFormats.push(childFormat);
			target_tf._textFormatsIdx[target_tf._textFormatsIdx.length - 1] =
				textProps.text.replace(/(\r\n|\n|\\n|\r)/gm,'').length;
			target_tf._textFormatsIdx.push(textProps.text.replace(/(\r\n|\n|\\n|\r)/gm,'').length);
		}

		// if the node has children, we just traverse children, and do not consider adding the nodeValue as text
		// todo: double check if above behavior is true for html text
		if (myChild.childNodes && myChild.childNodes.length > 0) {
			for (let k = 0; k < myChild.childNodes.length;k++) {
				if (target_tf._textFormats[target_tf._textFormats.length - 1] != childFormat) {

					target_tf._textFormats.push(childFormat);
					target_tf._textFormatsIdx[target_tf._textFormatsIdx.length - 1] =
						textProps.text.replace(/(\r\n|\n|\\n|\r)/gm,'').length;
					target_tf._textFormatsIdx.push(textProps.text.replace(/(\r\n|\n|\\n|\r)/gm,'').length);
				}
				this.readHTMLTextPropertiesRecursive(target_tf, myChild.childNodes[k], textProps, childFormat);
			}
		} else {
			// if a nodes content contains only line-breaks or whitespace, flash seem to ignore it
			const testContent: string = (<any>myChild).text.replace(/[\s\r\n]/gi, '');
			if (testContent != '') {
				textProps.text += (<any>myChild).text;
			}
		}
		if (myChild.tagName == 'li' || myChild.tagName == 'p') {
			//if(textProps.text!="" && !(textProps.text.length>=2 && textProps.text[textProps.text.length-1]=="n"
			//&& textProps.text[textProps.text.length-2]=="\\")){
			textProps.text += '\n';
			//}
		}
	}
}