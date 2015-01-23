import AssetType				= require("awayjs-core/lib/library/AssetType");
import ISubMesh					= require("awayjs-display/lib/base/ISubMesh");
import SubMeshBase				= require("awayjs-display/lib/base/SubMeshBase");
import TriangleSubGeometry		= require("awayjs-display/lib/base/TriangleSubGeometry");

import IRendererPool			= require("awayjs-display/lib/pool/IRendererPool");
import Mesh						= require("awayjs-display/lib/entities/Mesh");
import MaterialBase				= require("awayjs-display/lib/materials/MaterialBase");

/**
 * TriangleSubMesh wraps a TriangleSubGeometry as a scene graph instantiation. A TriangleSubMesh is owned by a Mesh object.
 *
 *
 * @see away.base.TriangleSubGeometry
 * @see away.entities.Mesh
 *
 * @class away.base.TriangleSubMesh
 */
class TriangleSubMesh extends SubMeshBase implements ISubMesh
{
	private _subGeometry:TriangleSubGeometry;

	/**
	 *
	 */
	public get assetType():string
	{
		return AssetType.TRIANGLE_SUB_MESH;
	}

	/**
	 * The TriangleSubGeometry object which provides the geometry data for this TriangleSubMesh.
	 */
	public get subGeometry():TriangleSubGeometry
	{
		return this._subGeometry;
	}

	/**
	 * Creates a new TriangleSubMesh object
	 * @param subGeometry The TriangleSubGeometry object which provides the geometry data for this TriangleSubMesh.
	 * @param parentMesh The Mesh object to which this TriangleSubMesh belongs.
	 * @param material An optional material used to render this TriangleSubMesh.
	 */
	constructor(subGeometry:TriangleSubGeometry, parentMesh:Mesh, material:MaterialBase = null)
	{
		super();

		this._pParentMesh = parentMesh;
		this._subGeometry = subGeometry;
		this.material = material;
	}

	/**
	 *
	 */
	public dispose()
	{
		super.dispose();
	}

	public _iCollectRenderable(rendererPool:IRendererPool)
	{
		rendererPool.applyTriangleSubMesh(this);
	}
}

export = TriangleSubMesh;