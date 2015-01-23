import BitmapData				= require("awayjs-core/lib/base/BitmapData");
import Matrix3D					= require("awayjs-core/lib/geom/Matrix3D");
import UVTransform				= require("awayjs-core/lib/geom/UVTransform");
import AssetType				= require("awayjs-core/lib/library/AssetType");

import IAnimator				= require("awayjs-display/lib/animators/IAnimator");
import DisplayObject			= require("awayjs-display/lib/base/DisplayObject");
import IRenderableOwner			= require("awayjs-display/lib/base/IRenderableOwner");
import EntityNode				= require("awayjs-display/lib/partition/EntityNode");
import IRendererPool			= require("awayjs-display/lib/pool/IRendererPool");
import IEntity					= require("awayjs-display/lib/entities/IEntity");
import MaterialEvent			= require("awayjs-display/lib/events/MaterialEvent");
import MaterialBase				= require("awayjs-display/lib/materials/MaterialBase");

/**
 * The Billboard class represents display objects that represent bitmap images.
 * These can be images that you load with the <code>flash.Assets</code> or
 * <code>flash.display.Loader</code> classes, or they can be images that you
 * create with the <code>Billboard()</code> constructor.
 *
 * <p>The <code>Billboard()</code> constructor allows you to create a Billboard
 * object that contains a reference to a BitmapData object. After you create a
 * Billboard object, use the <code>addChild()</code> or <code>addChildAt()</code>
 * method of the parent DisplayObjectContainer instance to place the bitmap on
 * the display list.</p>
 *
 * <p>A Billboard object can share its BitmapData reference among several Billboard
 * objects, independent of translation or rotation properties. Because you can
 * create multiple Billboard objects that reference the same BitmapData object,
 * multiple display objects can use the same complex BitmapData object without
 * incurring the memory overhead of a BitmapData object for each display
 * object instance.</p>
 *
 * <p>A BitmapData object can be drawn to the screen by a Billboard object in one
 * of two ways: by using the default hardware renderer with a single hardware surface,
 * or by using the slower software renderer when 3D acceleration is not available.</p>
 *
 * <p>If you would prefer to perform a batch rendering command, rather than using a
 * single surface for each Billboard object, you can also draw to the screen using the
 * <code>drawTiles()</code> or <code>drawTriangles()</code> methods which are
 * available to <code>flash.display.Tilesheet</code> and <code>flash.display.Graphics
 * objects.</code></p>
 *
 * <p><b>Note:</b> The Billboard class is not a subclass of the InteractiveObject
 * class, so it cannot dispatch mouse events. However, you can use the
 * <code>addEventListener()</code> method of the display object container that
 * contains the Billboard object.</p>
 */

class Billboard extends DisplayObject implements IEntity, IRenderableOwner
{
	private _animator:IAnimator;
	private _billboardWidth:number;
	private _billboardHeight:number;
	private _material:MaterialBase;
	private _uvTransform:UVTransform;

	private onSizeChangedDelegate:(event:MaterialEvent) => void;

	/**
	 * Defines the animator of the mesh. Act on the mesh's geometry. Defaults to null
	 */
	public get animator():IAnimator
	{
		return this._animator;
	}

	/**
	 *
	 */
	public get assetType():string
	{
		return AssetType.BILLBOARD;
	}

	/**
	 * The BitmapData object being referenced.
	 */
	public bitmapData:BitmapData; //TODO

	/**
	 *
	 */
	public get billboardHeight():number
	{
		return this._billboardHeight;
	}

	/**
	 *
	 */
	public get billboardWidth():number
	{
		return this._billboardWidth;
	}

	/**
	 *
	 */
	public get material():MaterialBase
	{
		return this._material;
	}

	public set material(value:MaterialBase)
	{
		if (value == this._material)
			return;

		if (this._material) {
			this._material.iRemoveOwner(this);
			this._material.removeEventListener(MaterialEvent.SIZE_CHANGED, this.onSizeChangedDelegate);
		}


		this._material = value;

		if (this._material) {
			this._material.iAddOwner(this);
			this._material.addEventListener(MaterialEvent.SIZE_CHANGED, this.onSizeChangedDelegate);
		}
	}

	/**
	 * Controls whether or not the Billboard object is snapped to the nearest pixel.
	 * This value is ignored in the native and HTML5 targets.
	 * The PixelSnapping class includes possible values:
	 * <ul>
	 *   <li><code>PixelSnapping.NEVER</code> - No pixel snapping occurs.</li>
	 *   <li><code>PixelSnapping.ALWAYS</code> - The image is always snapped to
	 * the nearest pixel, independent of transformation.</li>
	 *   <li><code>PixelSnapping.AUTO</code> - The image is snapped to the
	 * nearest pixel if it is drawn with no rotation or skew and it is drawn at a
	 * scale factor of 99.9% to 100.1%. If these conditions are satisfied, the
	 * bitmap image is drawn at 100% scale, snapped to the nearest pixel.
	 * When targeting Flash Player, this value allows the image to be drawn as fast
	 * as possible using the internal vector renderer.</li>
	 * </ul>
	 */
	public pixelSnapping:string; //TODO

	/**
	 * Controls whether or not the bitmap is smoothed when scaled. If
	 * <code>true</code>, the bitmap is smoothed when scaled. If
	 * <code>false</code>, the bitmap is not smoothed when scaled.
	 */
	public smoothing:boolean; //TODO

	/**
	 *
	 */
	public get uvTransform():UVTransform
	{
		return this._uvTransform;
	}

	public set uvTransform(value:UVTransform)
	{
		this._uvTransform = value;
	}

	constructor(material:MaterialBase, pixelSnapping:string = "auto", smoothing:boolean = false)
	{
		super();

		this._pIsEntity = true;

		this.onSizeChangedDelegate = (event:MaterialEvent) => this.onSizeChanged(event);

		this.material = material;

		this._billboardWidth = material.width;
		this._billboardHeight = material.height;
	}

	/**
	 * @protected
	 */
	public pCreateEntityPartitionNode():EntityNode
	{
		return new EntityNode(this);
	}

	/**
	 * @protected
	 */
	public pUpdateBounds()
	{
		this._pBounds.fromExtremes(0, 0, 0, this._billboardWidth, this._billboardHeight, 0);

		super.pUpdateBounds();
	}

	/**
	 * //TODO
	 *
	 * @param shortestCollisionDistance
	 * @param findClosest
	 * @returns {boolean}
	 *
	 * @internal
	 */
	public _iTestCollision(shortestCollisionDistance:number, findClosest:boolean):boolean
	{
		return this._pPickingCollider.testBillboardCollision(this, this._pPickingCollisionVO, shortestCollisionDistance);
	}

	/**
	 * @private
	 */
	private onSizeChanged(event:MaterialEvent)
	{
		this._billboardWidth = this._material.width;
		this._billboardHeight = this._material.height;

		this._pBoundsInvalid = true;

		var len:number = this._pRenderables.length;
		for (var i:number = 0; i < len; i++)
			this._pRenderables[i].invalidateVertexData("vertices"); //TODO
	}

	public _iCollectRenderables(rendererPool:IRendererPool)
	{
		// Since this getter is invoked every iteration of the render loop, and
		// the prefab construct could affect the sub-meshes, the prefab is
		// validated here to give it a chance to rebuild.
		if (this._iSourcePrefab)
			this._iSourcePrefab._iValidate();

		this._iCollectRenderable(rendererPool);
	}

	public _iCollectRenderable(rendererPool:IRendererPool)
	{
		rendererPool.applyBillboard(this);
	}
}

export = Billboard;