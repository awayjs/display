import ImageBase					= require("awayjs-core/lib/image/ImageBase");
import SamplerBase					= require("awayjs-core/lib/image/SamplerBase");
import Sampler2D					= require("awayjs-core/lib/image/Sampler2D");
import Image2D						= require("awayjs-core/lib/image/Image2D");
import Rectangle					= require("awayjs-core/lib/geom/Rectangle");
import Matrix						= require("awayjs-core/lib/geom/Matrix");

import ITraverser					= require("awayjs-display/lib/ITraverser");
import IAnimator					= require("awayjs-display/lib/animators/IAnimator");
import DisplayObject				= require("awayjs-display/lib/display/DisplayObject");
import IRenderable					= require("awayjs-display/lib/base/IRenderable");
import BoundsType					= require("awayjs-display/lib/bounds/BoundsType");
import IEntity						= require("awayjs-display/lib/display/IEntity");
import RenderableEvent				= require("awayjs-display/lib/events/RenderableEvent");
import SurfaceEvent					= require("awayjs-display/lib/events/SurfaceEvent");
import DefaultMaterialManager		= require("awayjs-display/lib/managers/DefaultMaterialManager");
import MaterialBase					= require("awayjs-display/lib/materials/MaterialBase");
import TextureBase					= require("awayjs-display/lib/textures/TextureBase");
import Style						= require("awayjs-display/lib/base/Style");
import StyleEvent					= require("awayjs-display/lib/events/StyleEvent");

/**
 * The Billboard class represents display objects that represent bitmap images.
 * These can be images that you load with the <code>flash.Assets</code> or
 * <code>flash.display.Loader</code> classes, or they can be images that you
 * create with the <code>Billboard()</code> constructor.
 *
 * <p>The <code>Billboard()</code> constructor allows you to create a Billboard
 * object that contains a reference to a Image2D object. After you create a
 * Billboard object, use the <code>addChild()</code> or <code>addChildAt()</code>
 * method of the parent DisplayObjectContainer instance to place the bitmap on
 * the display list.</p>
 *
 * <p>A Billboard object can share its Image2D reference among several Billboard
 * objects, independent of translation or rotation properties. Because you can
 * create multiple Billboard objects that reference the same Image2D object,
 * multiple display objects can use the same complex Image2D object without
 * incurring the memory overhead of a Image2D object for each display
 * object instance.</p>
 *
 * <p>A Image2D object can be drawn to the screen by a Billboard object in one
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

class Billboard extends DisplayObject implements IEntity, IRenderable
{
	public static assetType:string = "[asset Billboard]";

	private _animator:IAnimator;
	private _billboardWidth:number;
	private _billboardHeight:number;
	private _billboardRect:Rectangle;
	private _material:MaterialBase;

	private _style:Style;
	private _onInvalidatePropertiesDelegate:(event:StyleEvent) => void;
	private onInvalidateTextureDelegate:(event:SurfaceEvent) => void;


	/**
	 * Defines the animator of the sprite. Act on the sprite's geometry. Defaults to null
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
		return Billboard.assetType;
	}

	/**
	 *
	 */
	public get billboardRect():Rectangle
	{
		return this._billboardRect;
	}

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
			this._material.removeEventListener(SurfaceEvent.INVALIDATE_TEXTURE, this.onInvalidateTextureDelegate);
		}


		this._material = value;

		if (this._material) {
			this._material.iAddOwner(this);
			this._material.addEventListener(SurfaceEvent.INVALIDATE_TEXTURE, this.onInvalidateTextureDelegate);
		}
	}

	constructor(material:MaterialBase, pixelSnapping:string = "auto", smoothing:boolean = false)
	{
		super();

		this._pIsEntity = true;

		this.onInvalidateTextureDelegate = (event:SurfaceEvent) => this.onInvalidateTexture(event);
		this._onInvalidatePropertiesDelegate = (event:StyleEvent) => this._onInvalidateProperties(event);

		this.material = material;

		this._updateDimensions();

		//default bounds type
		this._boundsType = BoundsType.AXIS_ALIGNED_BOX;
	}

	/**
	 * @protected
	 */
	public _pUpdateBoxBounds()
	{
		super._pUpdateBoxBounds();

		this._pBoxBounds.width = this._billboardRect.width;
		this._pBoxBounds.height = this._billboardRect.height;
	}

	public clone():DisplayObject
	{
		var clone:Billboard = new Billboard(this.material);
		return clone;
	}

	/**
	 * The style used to render the current Billboard. If set to null, the default style of the material will be used instead.
	 */
	public get style():Style
	{
		return this._style;
	}

	public set style(value:Style)
	{
		if (this._style == value)
			return;

		if (this._style)
			this._style.removeEventListener(StyleEvent.INVALIDATE_PROPERTIES, this._onInvalidatePropertiesDelegate);

		this._style = value;

		if (this._style)
			this._style.addEventListener(StyleEvent.INVALIDATE_PROPERTIES, this._onInvalidatePropertiesDelegate);

		this._onInvalidateProperties();
	}

	/**
	 * //TODO
	 *
	 * @param shortestCollisionDistance
	 * @returns {boolean}
	 *
	 * @internal
	 */
	public _iTestCollision(shortestCollisionDistance:number):boolean
	{
		return this._pPickingCollider.testBillboardCollision(this, this.material, this._pPickingCollisionVO, shortestCollisionDistance);
	}

	/**
	 * @private
	 */
	private onInvalidateTexture(event:SurfaceEvent)
	{
		this._updateDimensions();
	}

	public _acceptTraverser(traverser:ITraverser)
	{
		traverser.applyRenderable(this);
	}

	private _updateDimensions()
	{
		var texture:TextureBase = this.material.getTextureAt(0);

		var image:Image2D = texture? <Image2D> ((this._style? this._style.getImageAt(texture) : null) || (this.material.style? this.material.style.getImageAt(texture) : null) || texture.getImageAt(0)) : null;

		if (image) {
			var sampler:Sampler2D = <Sampler2D> ((this._style? this._style.getSamplerAt(texture) : null) || (this.material.style? this.material.style.getSamplerAt(texture) : null) || texture.getSamplerAt(0) || DefaultMaterialManager.getDefaultSampler());
			if (sampler.imageRect) {
				this._billboardWidth = sampler.imageRect.width*image.width;
				this._billboardHeight = sampler.imageRect.height*image.height;
			} else {
				this._billboardWidth = image.rect.width;
				this._billboardHeight = image.rect.height;
			}

			this._billboardRect = sampler.frameRect || new Rectangle(0, 0, this._billboardWidth, this._billboardHeight);
		} else {
			this._billboardWidth = 1;
			this._billboardHeight = 1;
			this._billboardRect = new Rectangle(0, 0, 1, 1);
		}

		this._pInvalidateBounds();

		this.dispatchEvent(new RenderableEvent(RenderableEvent.INVALIDATE_ELEMENTS, this));
	}


	public invalidateSurface()
	{
		this.dispatchEvent(new RenderableEvent(RenderableEvent.INVALIDATE_RENDER_OWNER, this));
	}

	private _onInvalidateProperties(event:StyleEvent = null)
	{
		this.invalidateSurface();

		this._updateDimensions();
	}
}

export = Billboard;