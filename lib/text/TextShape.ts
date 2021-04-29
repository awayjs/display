import { TriangleElements } from '@awayjs/renderer';

import { Shape } from '@awayjs/graphics';

import { MaterialBase } from '@awayjs/materials';

import { TextFormat } from './TextFormat';

export class TextShape {

	public verts: Array<Float32Array> = [];
	public format: TextFormat;
	public shape: Shape;
	public fntMaterial: MaterialBase;
	public elements: TriangleElements;

	private _length: number = 0;
	public get length() {
		return this._length;
	}

	public set length(val: number) {
		if (val > this._length) {
			return;
		}

		if (val === 0) {
			this.verts.length = 0;
			return;
		}

		let index = 0;
		let size = val;

		for (index = 0; index < this.verts.length; index++) {
			if (this.verts[index].length > size) {
				break;
			}

			size -= this.verts[index].length;
		}

		// resize buffer
		this.verts[index] = this.verts[index].subarray(0, size);
		this.verts.length = index + 1;

		this._length = val;
	}

	constructor() {
		this.verts = [];
	}

	public addChunk(buffer: Float32Array) {
		this._length += buffer.length;
		this.verts.push(buffer);
	}

	public get tall() {
		return this.verts[this.verts.length - 1];
	}
}