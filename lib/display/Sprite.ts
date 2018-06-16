﻿import {AssetEvent, Box, Point, Matrix3D, Vector3D, Sphere, ProjectionBase} from "@awayjs/core";

import {TraverserBase, IAnimator, IMaterial, Style, IRenderable} from "@awayjs/renderer";

import {Graphics, Shape} from "@awayjs/graphics";

import {DisplayObjectContainer} from "./DisplayObjectContainer";
import { DisplayObject } from './DisplayObject';

/**
 * Sprite is an instance of a Graphics, augmenting it with a presence in the scene graph, a material, and an animation
 * state. It consists out of Graphices, which in turn correspond to SubGeometries. Graphices allow different parts
 * of the graphics to be assigned different materials.
 */
export class Sprite extends DisplayObjectContainer
{
	private static _sprites:Array<Sprite> = new Array<Sprite>();

	public static assetType:string = "[asset Sprite]";

	public static getNewSprite(material:IMaterial = null):Sprite
	{
		if (Sprite._sprites.length) {
			var sprite:Sprite = Sprite._sprites.pop();
			sprite.material = material;
			return sprite;
		}

		return new Sprite(material);
	}

	private _center:Vector3D;
	public _graphics:Graphics;
	private _onGraphicsInvalidateDelegate:(event:AssetEvent) => void;

	/**
	 *
	 */
	public get assetType():string
	{
		return Sprite.assetType;
	}

    public getRenderableIndex(renderable:IRenderable):number
    {
        return this._graphics.getShapeIndex(<Shape> renderable);
    }

	/**
	 * Specifies the Graphics object belonging to this Sprite object, where
	 * drawing commands can occur.
	 */
	public get graphics():Graphics
	{
		if (this._iSourcePrefab)
			this._iSourcePrefab._iValidate();

		if(this.isSlice9ScaledSprite){
			//var comps:Array<Vector3D> = this.transform.concatenatedMatrix3D.decompose();

			this._graphics.updateSlice9(this.parent.scaleX, this.parent.scaleY);
		}

		return this._graphics;
	}
/*
	public set graphics(value:Graphics){
		value._entity=this;
		this._graphics=value;
		this.invalidateElements();
	}
	*/
	/**
	 * Defines the animator of the graphics object.  Default value is <code>null</code>.
	 */
	public get animator():IAnimator
	{
		return this._graphics.animator;
	}

	public set animator(value:IAnimator)
	{
		this._graphics.animator = value;
	}

	/**
	 * The material with which to render the Sprite.
	 */
	public get material():IMaterial
	{
		return this._graphics.material;
	}

	public set material(value:IMaterial)
	{
		this._graphics.material = value;
	}

	/**
	 *
	 */
	public get style():Style
	{
		return this._graphics.style;
	}

	public set style(value:Style)
	{
		this._graphics.style = value;
	}
	
	/**
	 * Create a new Sprite object.
	 *
	 * @param material    [optional]        The material with which to render the Sprite.
	 */
	constructor(material:IMaterial = null)
	{
		super();

		this._onGraphicsInvalidateDelegate = (event:AssetEvent) => this._onGraphicsInvalidate(event);

		this._graphics = Graphics.getGraphics(this); //unique graphics object for each Sprite
		this._graphics.addEventListener(AssetEvent.INVALIDATE, this._onGraphicsInvalidateDelegate);

		this.material = material;
	}

	/**
	 * @inheritDoc
	 */
	public dispose():void
	{
		this.disposeValues();

		Sprite._sprites.push(this);
	}

	/**
	 * @inheritDoc
	 */
	public disposeValues():void
	{
		super.disposeValues();

		this._graphics.dispose();
	}

	/**
	 * Clones this Sprite instance along with all it's children, while re-using the same
	 * material, graphics and animation set. The returned result will be a copy of this sprite,
	 * containing copies of all of it's children.
	 *
	 * Properties that are re-used (i.e. not cloned) by the new copy include name,
	 * graphics, and material. Properties that are cloned or created anew for the copy
	 * include subSpritees, children of the sprite, and the animator.
	 *
	 * If you want to copy just the sprite, reusing it's graphics and material while not
	 * cloning it's children, the simplest way is to create a new sprite manually:
	 *
	 * <code>
	 * var clone : Sprite = new Sprite(original.graphics, original.material);
	 * </code>
	 */
	public clone():Sprite
	{
		var newInstance:Sprite = (Sprite._sprites.length)? Sprite._sprites.pop() : new Sprite();

		this.copyTo(newInstance);

		return newInstance;
	}

	public copyTo(sprite:Sprite, cloneShapes:boolean = false):void
	{
		super.copyTo(sprite);

		this._graphics.copyTo(sprite.graphics, cloneShapes);
    }

	/**
	 * //TODO
	 *
	 * @protected
	 */
	public _getBoxBoundsInternal(matrix3D:Matrix3D, strokeFlag:boolean, fastFlag:boolean, cache:Box = null, target:Box = null):Box
	{
		target = this._graphics.getBoxBounds(matrix3D, strokeFlag, cache, target);

		return super._getBoxBoundsInternal(matrix3D, strokeFlag, fastFlag, cache, target);
	}


	public _getSphereBoundsInternal(matrix3D:Matrix3D, strokeFlag:boolean, cache:Sphere, target:Sphere = null):Sphere
	{
		var box:Box = this.getBoxBounds();

		if (box == null)
			return;

		if (!this._center)
			this._center = new Vector3D();

		this._center.x = box.x + box.width/2;
		this._center.y = box.y + box.height/2;
		this._center.z = box.z + box.depth/2;

		return this._graphics.getSphereBounds(this._center, matrix3D, strokeFlag, cache, target);
	}

	/**
	 *
	 */
	public _iInternalUpdate(projection:ProjectionBase):void
	{
		super._iInternalUpdate(projection);

		if(this.parent)
			this._graphics.updateScale(projection);
	}

	protected _isEntityInternal():boolean
	{
		return Boolean(this._graphics.count) || super._isEntityInternal();
	}

	/**
	 * //TODO
	 *
	 * @private
	 */
	private _onGraphicsInvalidate(event:AssetEvent):void
	{
		this._invalidateChildren();
	}

	/**
	 *
	 * @param renderer
	 *
	 * @internal
	 */
	public _acceptTraverser(traverser:TraverserBase):void
	{
		this.graphics.acceptTraverser(traverser);
	}

	public _hitTestPointInternal(x:number, y:number, shapeFlag:boolean, masksFlag:boolean):boolean
	{
		if(this._graphics.count) {
			//early out for non-shape tests
			if (!shapeFlag)
				return true;

			//ok do the graphics thing
			if (this._graphics._hitTestPointInternal(this._tempPoint.x, this._tempPoint.y))
				return true;
		}

		return super._hitTestPointInternal(x, y, shapeFlag, masksFlag);
	}

	public clear():void
	{
		super.clear();

		this._graphics.clearInternal();
	}

	/**
	 *
	 */
	public bakeTransformations():void
	{
		this._graphics.applyTransformation(this.transform.matrix3D);
		this.transform.clearMatrix3D();
	}
	
	public invalidateElements():void
	{
		this.graphics.invalidateElements();
	}

	public invalidateMaterial():void
	{
		this.graphics.invalidateMaterials();
	}


}