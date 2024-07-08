const LoaderType ={
    Texture : 'Texture',
    GLTF : 'GLTF',
    RGBE : 'RGBE',
    MESH : 'Mesh',
}

export default [
    // { name: 'sceneLoad',  type: LoaderType.RGBE, path: '../img/sky.hdr' },
    { name: 'carLoad',  type: LoaderType.GLTF, path: './models/gltf/su7-car_edit.glb' },
    { name: 'tunnelLoader',  type: LoaderType.GLTF, path: './models/gltf/tunnel.glb' }
]
