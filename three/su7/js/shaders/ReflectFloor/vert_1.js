
export const vertexShader = `
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

varying vec2 vUv_;
varying vec4 vWorldPosition;
varying vec3 vViewPosition;
varying vec3 vNormal;

void main(){
    vec3 p=position;
    vUv_=uv;
    vNormal=normal;
    vViewPosition=position;
    // gl_Position=modelMatrix*vec4(p,1);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`
