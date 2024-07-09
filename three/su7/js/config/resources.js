const LoaderType ={
    Texture : 'Texture',
    GLTF : 'GLTF',
    RGBE : 'RGBE',
    MESH : 'Mesh',
}

export default [
    // { name: 'sceneLoad',  type: LoaderType.RGBE, path: './models/sky.hdr' },
    // { name: 'env_night',  type: LoaderType.RGBE, path: './models/t_env_night.hdr' },
    // { name: 'env_light',  type: LoaderType.RGBE, path: './models/t_env_light.hdr' },
    { name: 'carLoad',  type: LoaderType.GLTF, path: './models/gltf/su7-car_edit.glb' },
    { name: 'tunnelLoader',  type: LoaderType.GLTF, path: './models/gltf/tunnel.glb' }
]
