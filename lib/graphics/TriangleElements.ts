import AttributesBuffer				= require("awayjs-core/lib/attributes/AttributesBuffer");
import AttributesView				= require("awayjs-core/lib/attributes/AttributesView");
import Float4Attributes				= require("awayjs-core/lib/attributes/Float4Attributes");
import Float3Attributes				= require("awayjs-core/lib/attributes/Float3Attributes");
import Float2Attributes				= require("awayjs-core/lib/attributes/Float2Attributes");
import Float1Attributes				= require("awayjs-core/lib/attributes/Float1Attributes");
import Short3Attributes				= require("awayjs-core/lib/attributes/Short3Attributes");
import Box							= require("awayjs-core/lib/geom/Box");
import Sphere						= require("awayjs-core/lib/geom/Sphere");
import Matrix3D						= require("awayjs-core/lib/geom/Matrix3D");
import Vector3D						= require("awayjs-core/lib/geom/Vector3D");

import ElementsBase					= require("awayjs-display/lib/graphics/ElementsBase");
import MaterialBase					= require("awayjs-display/lib/materials/MaterialBase");
import ElementsUtils				= require("awayjs-display/lib/utils/ElementsUtils");
import IPickingCollider				= require("awayjs-display/lib/pick/IPickingCollider");
import PickingCollisionVO			= require("awayjs-display/lib/pick/PickingCollisionVO");

/**
 * @class away.base.TriangleElements
 */
class TriangleElements extends ElementsBase
{
	public static assetType:string = "[asset TriangleElements]";

	private _numVertices:number = 0;
	private _faceNormalsDirty:boolean = true;
	private _faceTangentsDirty:boolean = true;

	private _positions:AttributesView;
	private _normals:Float3Attributes;
	private _tangents:Float3Attributes;
	private _uvs:AttributesView;
	private _jointIndices:AttributesView;
	private _jointWeights:AttributesView;

	private _useCondensedIndices:boolean;
	private _condensedIndexLookUp:Array<number>;

	private _jointsPerVertex:number;

	private _autoDeriveNormals:boolean = true;
	private _autoDeriveTangents:boolean = true;

	private _faceNormals:Float4Attributes;
	private _faceTangents:Float3Attributes;

	//used for hittesting geometry
	public cells:Array<Array<number>> = new Array<Array<number>>();
	public lastCollisionIndex:number = - 1;
	public divisions:number;

	public get assetType():string
	{
		return TriangleElements.assetType;
	}


	public get numVertices():number
	{
		return this._numVertices;
	}

	/**
	 * Offers the option of enabling GPU accelerated animation on skeletons larger than 32 joints
	 * by condensing the number of joint index values required per sprite. Only applicable to
	 * skeleton animations that utilise more than one sprite object. Defaults to false.
	 */
	public get useCondensedIndices():boolean
	{
		return this._useCondensedIndices;
	}

	public set useCondensedIndices(value:boolean)
	{
		if (this._useCondensedIndices == value)
			return;

		this._useCondensedIndices = value;
	}

	/**
	 *
	 */
	public get jointsPerVertex():number
	{
		return this._jointsPerVertex;
	}

	public set jointsPerVertex(value:number)
	{
		if (this._jointsPerVertex == value)
			return;

		this._jointsPerVertex = value;

		if (this._jointIndices)
			this._jointIndices.dimensions = this._jointsPerVertex;

		if (this._jointWeights)
			this._jointWeights.dimensions = this._jointsPerVertex;
	}

	/**
	 * True if the vertex normals should be derived from the geometry, false if the vertex normals are set
	 * explicitly.
	 */
	public get autoDeriveNormals():boolean
	{
		return this._autoDeriveNormals;
	}

	public set autoDeriveNormals(value:boolean)
	{
		if (this._autoDeriveNormals == value)
			return;

		this._autoDeriveNormals = value;
	}

	/**
	 * True if the vertex tangents should be derived from the geometry, false if the vertex normals are set
	 * explicitly.
	 */
	public get autoDeriveTangents():boolean
	{
		return this._autoDeriveTangents;
	}

	public set autoDeriveTangents(value:boolean)
	{
		if (this._autoDeriveTangents == value)
			return;

		this._autoDeriveTangents = value;
	}

	/**
	 *
	 */
	public get positions():AttributesView
	{
		if (!this._positions)
			this.setPositions(new Float3Attributes(this._concatenatedBuffer));

		return this._positions;
	}

	/**
	 *
	 */
	public get normals():Float3Attributes
	{
		if (!this._normals || this._verticesDirty[this._normals.id])
			this.setNormals(this._normals);

		return this._normals;
	}

	/**
	 *
	 */
	public get tangents():Float3Attributes
	{
		if (!this._tangents || this._verticesDirty[this._tangents.id])
			this.setTangents(this._tangents);

		return this._tangents;
	}

	/**
	 * The raw data of the face normals, in the same order as the faces are listed in the index list.
	 */
	public get faceNormals():Float4Attributes
	{
		if (this._faceNormalsDirty)
			this.updateFaceNormals();

		return this._faceNormals;
	}

	/**
	 * The raw data of the face tangets, in the same order as the faces are listed in the index list.
	 */
	public get faceTangents():Float3Attributes
	{
		if (this._faceTangentsDirty)
			this.updateFaceTangents();

		return this._faceTangents;
	}

	/**
	 *
	 */
	public get uvs():AttributesView
	{
		return this._uvs;
	}

	/**
	 *
	 */
	public get jointIndices():AttributesView
	{
		return this._jointIndices;
	}

	/**
	 *
	 */
	public get jointWeights():AttributesView
	{
		return this._jointWeights;
	}

	public get condensedIndexLookUp():Array<number>
	{
		return this._condensedIndexLookUp;
	}

	public getBoxBounds(target:Box = null):Box
	{
		return ElementsUtils.getTriangleGraphicsBoxBounds(this.positions, target, this._numVertices);
	}

	public getSphereBounds(center:Vector3D, target:Sphere = null):Sphere
	{
		return ElementsUtils.getTriangleGraphicsSphereBounds(this.positions, center, target, this._numVertices);
	}

	public hitTestPoint(x:number, y:number, z:number):boolean
	{
		return true;
	}

	/**
	 *
	 */
	public setPositions(array:Array<number>, offset?:number);
	public setPositions(arrayBufferView:ArrayBufferView, offset?:number);
	public setPositions(attributesView:AttributesView, offset?:number);
	public setPositions(values:any, offset:number = 0)
	{
		if (values == this._positions)
			return;

		if (values instanceof AttributesView) {
			this.clearVertices(this._positions);
			this._positions = <AttributesView> values;
		} else if (values) {
			if (!this._positions)
				this._positions = new Float3Attributes(this._concatenatedBuffer);

			this._positions.set(values, offset);
		} else {
			this.clearVertices(this._positions);
			this._positions = new Float3Attributes(this._concatenatedBuffer); //positions cannot be null
		}

		this._numVertices = this._positions.count;

		if (this._autoDeriveNormals)
			this.invalidateVertices(this._normals);

		if (this._autoDeriveTangents)
			this.invalidateVertices(this._tangents);

		this.invalidateVertices(this._positions);

		this._verticesDirty[this._positions.id] = false;
	}

	/**
	 * Updates the vertex normals based on the geometry.
	 */
	public setNormals(array:Array<number>, offset?:number);
	public setNormals(float32Array:Float32Array, offset?:number);
	public setNormals(float3Attributes:Float3Attributes, offset?:number);
	public setNormals(values:any, offset:number = 0)
	{
		if (!this._autoDeriveNormals) {
			if (values == this._normals)
				return;

			if (values instanceof Float3Attributes) {
				this.clearVertices(this._normals);
				this._normals = <Float3Attributes> values;
			} else if (values) {
				if (!this._normals)
					this._normals = new Float3Attributes(this._concatenatedBuffer);

				this._normals.set(values, offset);
			} else if (this._normals) {
				this.clearVertices(this._normals);
				this._normals = null;
				return;
			}
		} else {
			this._normals = ElementsUtils.generateNormals(this.indices, this.faceNormals, this._normals, this._concatenatedBuffer);
		}

		this.invalidateVertices(this._normals);

		this._verticesDirty[this._normals.id] = false;
	}

	/**
	 * Updates the vertex tangents based on the geometry.
	 */
	public setTangents(array:Array<number>, offset?:number);
	public setTangents(float32Array:Float32Array, offset?:number);
	public setTangents(float3Attributes:Float3Attributes, offset?:number);
	public setTangents(values:any, offset:number = 0)
	{
		if (!this._autoDeriveTangents) {
			if (values == this._tangents)
				return;

			if (values instanceof Float3Attributes) {
				this.clearVertices(this._tangents);
				this._tangents = values;
			} else if (values) {
				if (!this._tangents)
					this._tangents = new Float3Attributes(this._concatenatedBuffer);

				this._tangents.set(values, offset);
			} else if (this._tangents) {
				this.clearVertices(this._tangents);
				this._tangents = null;
				return;
			}
		} else {
			this._tangents = ElementsUtils.generateTangents(this.indices, this.faceTangents, this.faceNormals, this._tangents, this._concatenatedBuffer);
		}

		this.invalidateVertices(this._tangents);

		this._verticesDirty[this._tangents.id] = false;
	}

	/**
	 * Updates the uvs based on the geometry.
	 */
	public setUVs(array:Array<number>, offset?:number);
	public setUVs(arrayBufferView:ArrayBufferView, offset?:number);
	public setUVs(attributesView:AttributesView, offset?:number);
	public setUVs(values:any, offset:number = 0)
	{
		if (values == this._uvs)
			return;

		if (values instanceof AttributesView) {
			this.clearVertices(this._uvs);
			this._uvs = values;
		} else if (values) {
			if (!this._uvs)
				this._uvs = new Float2Attributes(this._concatenatedBuffer);

			this._uvs.set(values, offset);
		} else if (this._uvs) {
			this.clearVertices(this._uvs);
			this._uvs = null;
			return;
		}

		this.invalidateVertices(this._uvs);

		this._verticesDirty[this._uvs.id] = false;
	}

	/**
	 * Updates the joint indices
	 */
	public setJointIndices(array:Array<number>, offset?:number);
	public setJointIndices(float32Array:Float32Array, offset?:number);
	public setJointIndices(attributesView:AttributesView, offset?:number);
	public setJointIndices(values:any, offset:number = 0)
	{
		if (values == this._jointIndices)
			return;

		if (values instanceof AttributesView) {
			this.clearVertices(this._jointIndices);
			this._jointIndices = values;
		} else if (values) {
			if (!this._jointIndices)
				this._jointIndices = new AttributesView(Float32Array, this._jointsPerVertex, this._concatenatedBuffer);

			if (this._useCondensedIndices) {
				var i:number = 0;
				var oldIndex:number;
				var newIndex:number = 0;
				var dic:Object = new Object();

				this._condensedIndexLookUp = new Array<number>();

				while (i < values.length) {
					oldIndex = values[i];

					// if we encounter a new index, assign it a new condensed index
					if (dic[oldIndex] == undefined) {
						dic[oldIndex] = newIndex;
						this._condensedIndexLookUp[newIndex++] = oldIndex;
					}

					//reset value to dictionary lookup
					values[i++] = dic[oldIndex];
				}
			}

			this._jointIndices.set(values, offset);

		} else if (this._jointIndices) {
			this.clearVertices(this._jointIndices);
			this._jointIndices = null;
			return;
		}

		this.invalidateVertices(this._jointIndices);

		this._verticesDirty[this._jointIndices.id] = false;
	}

	/**
	 * Updates the joint weights.
	 */
	public setJointWeights(array:Array<number>, offset?:number);
	public setJointWeights(float32Array:Float32Array, offset?:number);
	public setJointWeights(attributesView:AttributesView, offset?:number);
	public setJointWeights(values:any, offset:number = 0)
	{
		if (values == this._jointWeights)
			return;

		if (values instanceof AttributesView) {
			this.clearVertices(this._jointWeights);
			this._jointWeights = values;
		} else if (values) {
			if (!this._jointWeights)
				this._jointWeights = new AttributesView(Float32Array, this._jointsPerVertex, this._concatenatedBuffer);

			this._jointWeights.set(values, offset);

		} else if (this._jointWeights) {
			this.clearVertices(this._jointWeights);
			this._jointWeights = null;
			return;
		}

		this.invalidateVertices(this._jointWeights);

		this._verticesDirty[this._jointWeights.id] = false;
	}

	/**
	 *
	 */
	public dispose()
	{
		super.dispose();

		if (this._positions) {
			this._positions.dispose();
			this._positions = null;
		}

		if (this._normals) {
			this._normals.dispose();
			this._normals = null;
		}

		if (this._tangents) {
			this._tangents.dispose();
			this._tangents = null;
		}

		if (this._uvs) {
			this._uvs.dispose();
			this._uvs = null;
		}

		if (this._jointIndices) {
			this._jointIndices.dispose();
			this._jointIndices = null;
		}

		if (this._jointWeights) {
			this._jointWeights.dispose();
			this._jointWeights = null;
		}

		if (this._faceNormals) {
			this._faceNormals.dispose();
			this._faceNormals = null;
		}

		if (this._faceTangents) {
			this._faceTangents.dispose();
			this._faceTangents = null;
		}
	}

	/**
	 * Updates the face indices of the TriangleElements.
	 *
	 * @param indices The face indices to upload.
	 */
	public setIndices(array:Array<number>, offset?:number);
	public setIndices(uint16Array:Uint16Array, offset?:number);
	public setIndices(short3Attributes:Short3Attributes, offset?:number);
	public setIndices(values:any, offset:number = 0)
	{
		super.setIndices(values, offset);

		this._faceNormalsDirty = true;
		this._faceTangentsDirty = true;

		if (this._autoDeriveNormals)
			this.invalidateVertices(this._normals);

		if (this._autoDeriveTangents)
			this.invalidateVertices(this._tangents);
	}

	public copyTo(elements:TriangleElements)
	{
		super.copyTo(elements);

		//temp disable auto derives
		elements.autoDeriveNormals = false;
		elements.autoDeriveTangents = false;

		elements.setPositions(this.positions.clone());

		if (this.normals)
			elements.setNormals(this.normals.clone());

		if (this.tangents)
			elements.setTangents(this.tangents.clone());

		if (this.uvs)
			elements.setUVs(this.uvs.clone());

		elements.jointsPerVertex = this._jointsPerVertex;

		if (this.jointIndices)
			elements.setJointIndices(this.jointIndices.clone());

		if (this.jointWeights)
			elements.setJointWeights(this.jointWeights.clone());

		//return auto derives to cloned values
		elements.autoDeriveNormals = this._autoDeriveNormals;
		elements.autoDeriveTangents = this._autoDeriveTangents;
	}

	/**
	 * Clones the current object
	 * @return An exact duplicate of the current object.
	 */
	public clone():TriangleElements
	{
		var clone:TriangleElements = new TriangleElements(this._concatenatedBuffer? this._concatenatedBuffer.clone() : null);

		this.copyTo(clone);

		return clone;
	}

	public scaleUV(scaleU:number = 1, scaleV:number = 1)
	{
		if (this.uvs) // only scale if uvs exist
			ElementsUtils.scaleUVs(scaleU, scaleV, this.uvs, this._numVertices);
	}

	/**
	 * Scales the geometry.
	 * @param scale The amount by which to scale.
	 */
	public scale(scale:number)
	{
		ElementsUtils.scale(scale, this.positions, this._numVertices);
	}

	public applyTransformation(transform:Matrix3D)
	{
		ElementsUtils.applyTransformation(transform, this.positions, this.normals, this.tangents, this._numVertices);
	}

	/**
	 * Updates the tangents for each face.
	 */
	private updateFaceTangents()
	{
		this._faceTangents = ElementsUtils.generateFaceTangents(this.indices, this.positions, this.uvs || this.positions, this._faceTangents, this.numElements);

		this._faceTangentsDirty = false;
	}

	/**
	 * Updates the normals for each face.
	 */
	private updateFaceNormals()
	{
		this._faceNormals = ElementsUtils.generateFaceNormals(this.indices, this.positions, this._faceNormals, this.numElements);

		this._faceNormalsDirty = false;
	}

	public _iTestCollision(pickingCollider:IPickingCollider, material:MaterialBase, pickingCollisionVO:PickingCollisionVO, shortestCollisionDistance:number):boolean
	{
		return pickingCollider.testTriangleCollision(this, material, pickingCollisionVO, shortestCollisionDistance);
	}
}

export = TriangleElements;