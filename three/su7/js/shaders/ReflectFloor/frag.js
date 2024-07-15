
export const fragmentShader = `
  #include <packing>
		uniform vec3 color;
		uniform sampler2D tReflectionMap;
    uniform sampler2D tDepth;
		uniform float cameraNear;
		uniform float cameraFar;
    uniform sampler2D tNormalMap0;
    uniform sampler2D tRoughness;
    uniform sampler2D tNoise;
    uniform vec4 config;
		varying vec4 vCoord;
    varying vec2 vUv;


		float blendOverlay( float base, float blend ) {

			return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );

		}

		vec3 blendOverlay( vec3 base, vec3 blend ) {

			return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );

		}
    float readDepth( sampler2D depthSampler, vec4 coord ) {
				
		float fragCoordZ = texture2DProj( depthSampler, coord ).x;
		float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
		return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
			
		}
    #define pow2(x) (x * x)

    const float pi = atan(1.0) * 4.0;
    const int samples = 8;
    const float sigma = float(samples) * 0.25;
    float gaussian(vec2 i) {
      return 1.0 / (2.0 * pi * pow2(sigma)) * exp(-((pow2(i.x) + pow2(i.y)) / (2.0 * pow2(sigma))));
    }
  
    vec3 blur(sampler2D sp, vec2 uv, vec2 scale) {
        vec3 col = vec3(0.0);
        float accum = 0.0;
        float weight;
        vec2 offset;
        
        for (int x = -samples / 2; x < samples / 2; ++x) {
            for (int y = -samples / 2; y < samples / 2; ++y) {
                offset = vec2(x, y);
                weight = gaussian(offset);
                col += texture(sp, uv + scale * offset).rgb * weight;
                accum += weight;
            }
        }
        
        return col / accum;
    }
    vec2 noise (vec2 uv){
      // uv = vec2(dot(uv,vec2(127.1,311.7)),dot(uv,vec2(269.5,183.3)));
      // return fract(sin(uv) * 43758.5453123) - 0.5;
      return texture2D(tNoise,uv).xy - 0.5;
    }
		void main() {

			#include <logdepthbuf_fragment>
      vec2 uv = vec2(vCoord.x/vCoord.w,vCoord.y/vCoord.w);
			vec4 base = texture2DProj( tReflectionMap, vCoord );
      float depth = readDepth( tDepth, vCoord );
      // vec3 Color = blur(tReflectionMap,vCoord.xy/vCoord.w,vec2(1.0)/vec2(1920.,1080.));
			// gl_FragColor = vec4( blendOverlay( base.rgb, vec3(1.,1.,0.) ), 1. -( depth * 1000.0 )  );
      // vec4 Color = texture2D(tReflectionMap,uv + noise(uv)*blur_power);
      // gl_FragColor = vec4( Color, 1.- ( depth * 100.0 ));

	    float scale = config.w;
      vec4 normalColor = texture2D(tNormalMap0, (uv * scale));
      vec3 normal = normalize(vec3(normalColor.r * 2.0 - 1.0, normalColor.b, normalColor.g * 2.0 - 1.0));
      vec3 coord = vCoord.xyz / vCoord.w;
      vec2 uv_normal = coord.xy + coord.z * normal.xz * 0.25 ;
      vec4 reflectColor = texture2D(tReflectionMap, vec2( uv_normal.x, uv_normal.y));
      float blur_power = 0.04;
      vec4 Color = texture2D(tReflectionMap,uv_normal + noise(uv_normal)*blur_power);
      float roughness = texture2D(tRoughness, vUv*0.5).g;
      float mixRatio = 1. - roughness;

      gl_FragColor = Color;
      gl_FragColor *=  mixRatio;
      gl_FragColor +=  reflectColor*0.2;
			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}

`
