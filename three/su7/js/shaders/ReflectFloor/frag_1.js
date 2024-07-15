
export const fragmentShader = `
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

varying vec2 vUv_;
varying vec4 vWorldPosition;
varying vec3 vViewPosition;

uniform vec3 uColor;
uniform float uSpeed;
uniform mat4 uReflectMatrix;
uniform sampler2D uReflectTexture;
uniform sampler2D normalMap;
uniform sampler2D roughnessMap;
uniform float uReflectIntensity;
uniform vec2 uMipmapTextureSize;
varying vec3 vNormal;

//=========================== sampleBicubic ===========================
    vec4 sampleBicubic(float v) {
        vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
        vec4 s = n * n * n;
        vec4 o;
        o.x = s.x;
        o.y = s.y - 4.0 * s.x;
        o.z = s.z - 4.0 * s.y + 6.0 * s.x;
        o.w = 6.0 - o.x - o.y - o.z;
        return o;
    }
    
    vec4 sampleBicubic(sampler2D tex, vec2 st, vec2 texResolution) {
        #ifndef SAMPLER_FNC
        #if __VERSION__ >= 300
        #define SAMPLER_FNC(TEX, UV) texture(TEX, UV)
        #else
        #define SAMPLER_FNC(TEX, UV) texture2D(TEX, UV)
        #endif
        #endif
    
    
        vec2 pixel = 1.0 / texResolution;
        st = st * texResolution - 0.5;
    
        vec2 fxy = fract(st);
        st -= fxy;
    
        vec4 xcubic = sampleBicubic(fxy.x);
        vec4 ycubic = sampleBicubic(fxy.y);
    
        vec4 c = st.xxyy + vec2 (-0.5, 1.5).xyxy;
    
        vec4 s = vec4(xcubic.xz + xcubic.yw, ycubic.xz + ycubic.yw);
        vec4 offset = c + vec4 (xcubic.yw, ycubic.yw) / s;
    
        offset *= pixel.xxyy;
    
        vec4 sample0 = SAMPLER_FNC(tex, offset.xz);
        vec4 sample1 = SAMPLER_FNC(tex, offset.yz);
        vec4 sample2 = SAMPLER_FNC(tex, offset.xw);
        vec4 sample3 = SAMPLER_FNC(tex, offset.yw);
    
        float sx = s.x / (s.x + s.y);
        float sy = s.z / (s.z + s.w);
    
        return mix( mix(sample3, sample2, sx), 
                    mix(sample1, sample0, sx), 
                    sy);
    }
    
    //=========================== packedTexture2DLOD ===========================
    vec4 packedTexture2DLOD(sampler2D tex,vec2 uv,int level,vec2 originalPixelSize){
        float floatLevel=float(level);
        vec2 atlasSize;
        atlasSize.x=floor(originalPixelSize.x*1.5);
        atlasSize.y=originalPixelSize.y;
        // we stop making mip maps when one dimension == 1
        float maxLevel=min(floor(log2(originalPixelSize.x)),floor(log2(originalPixelSize.y)));
        floatLevel=min(floatLevel,maxLevel);
        // use inverse pow of 2 to simulate right bit shift operator
        vec2 currentPixelDimensions=floor(originalPixelSize/pow(2.,floatLevel));
        vec2 pixelOffset=vec2(
            floatLevel>0.?originalPixelSize.x:0.,
            floatLevel>0.?currentPixelDimensions.y:0.
        );
        // "minPixel / atlasSize" samples the top left piece of the first pixel
        // "maxPixel / atlasSize" samples the bottom right piece of the last pixel
        vec2 minPixel=pixelOffset;
        vec2 maxPixel=pixelOffset+currentPixelDimensions;
        vec2 samplePoint=mix(minPixel,maxPixel,uv);
        samplePoint/=atlasSize;
        vec2 halfPixelSize=1./(2.*atlasSize);
        samplePoint=min(samplePoint,maxPixel/atlasSize-halfPixelSize);
        samplePoint=max(samplePoint,minPixel/atlasSize+halfPixelSize);
        return sampleBicubic(tex,samplePoint,originalPixelSize);
    }
    
    vec4 packedTexture2DLOD(sampler2D tex,vec2 uv,float level,vec2 originalPixelSize){
        float ratio=mod(level,1.);
        int minLevel=int(floor(level));
        int maxLevel=int(ceil(level));
        vec4 minValue=packedTexture2DLOD(tex,uv,minLevel,originalPixelSize);
        vec4 maxValue=packedTexture2DLOD(tex,uv,maxLevel,originalPixelSize);
        return mix(minValue,maxValue,ratio);
    }
//=========================== pow5 ===========================
    float pow5(const in float x) {
        float x2 = x * x;
        return x2 * x2 * x;
    }
    
    vec2 pow5(const in vec2 x) {
        vec2 x2 = x * x;
        return x2 * x2 * x;
    }
    
    vec3 pow5(const in vec3 x) {
        vec3 x2 = x * x;
        return x2 * x2 * x;
    }
    
    vec4 pow5(const in vec4 x) {
        vec4 x2 = x * x;
        return x2 * x2 * x;
    }
        //=========================== schlick ===========================
    vec3 schlick(const in vec3 f0, const in float f90, const in float VoH) {
        float f = pow5(1.0 - VoH);
        return f + f0 * (f90 - f);
    }
    
    vec3 schlick(const in vec3 f0, const in vec3 f90, const in float VoH) {
        return f0 + (f90 - f0) * pow5(1.0 - VoH);
    }
    
    float schlick(const in float f0, const in float f90, const in float VoH) {
        return f0 + (f90 - f0) * pow5(1.0 - VoH);
    }
    
     //=========================== fresnel ===========================
    vec3 fresnel(vec3 f0, vec3 normal, vec3 view) {
      return schlick(f0, 1.0, dot(view, normal));
    }
    
    vec3 fresnel(const in vec3 f0, const in float NoV) {
        #if !defined(FNC_SATURATE) && !defined(saturate)
        #define FNC_SATURATE
        #define saturate(x) clamp(x, 0.0, 1.0)
        #endif
        #if defined(TARGET_MOBILE) || defined(PLATFORM_RPI)
            return schlick(f0, 1.0, NoV);
        #else
            float f90 = saturate(dot(f0, vec3(50.0 * 0.33)));
            return schlick(f0, f90, NoV);
        #endif
    }
    
    float fresnel(const in float f0, const in float NoV) {
        return schlick(f0, 1.0, NoV);
    }

void main(){
    vec2 p=vUv_;
    
    vec2 surfaceNormalUv=vWorldPosition.xz;
    surfaceNormalUv.x+=iTime*uSpeed;
    vec3 surfaceNormal=texture(normalMap,surfaceNormalUv).rgb*2.-1.;
    surfaceNormal=surfaceNormal.rbg;
    surfaceNormal=normalize(surfaceNormal);
    
    vec3 viewDir=vViewPosition;
    float d=length(viewDir);
    viewDir=normalize(viewDir);
    
    vec2 distortion=surfaceNormal.xz*(.001+1./d);
    
    vec4 reflectPoint=uReflectMatrix*vWorldPosition;
    reflectPoint=reflectPoint/reflectPoint.w;
    
    // vec3 reflectionSample=texture(uReflectTexture,reflectPoint.xy+distortion).xyz;
    vec2 roughnessUv=vWorldPosition.xz;
    roughnessUv.x+=iTime*uSpeed;
    float roughnessValue=texture(roughnessMap,roughnessUv).r;
    roughnessValue=roughnessValue*(1.7-.7*roughnessValue);
    roughnessValue*=4.;
    float level=roughnessValue;
    vec2 finalUv=reflectPoint.xy+distortion;
    vec3 reflectionSample=packedTexture2DLOD(uReflectTexture,finalUv,level,uMipmapTextureSize).rgb;
    reflectionSample*=uReflectIntensity;
    
    vec3 col=uColor;
    // col+=reflectionSample;
    col*=3.;
    vec3 fres=fresnel(vec3(0.),vNormal,viewDir);
    col=mix(col,reflectionSample,fres);
    
    gl_FragColor=vec4(col,1.);
     // gl_FragColor=vec4(1.0, 0.0, 0.0, 1.0);
}
`
