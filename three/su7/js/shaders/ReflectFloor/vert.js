
export const vertexShader = `

uniform mat4 textureMatrix;
		varying vec4 vCoord;
    varying vec2 vUv;
		void main() {
      vUv = uv;
			vCoord = textureMatrix * vec4( position, 1.0 );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}

`
