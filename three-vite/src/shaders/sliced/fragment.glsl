uniform float uSliceStart;
uniform float uSliceArc;
uniform float uSliceStartY; // 切片开始的x坐标
uniform float uSliceWidth;  // 切片的宽度
uniform float uMinWidth;  // 切片的宽度

varying vec3 vPosition;

void main() {
//    // float uSliceStart = 1.0;
//    // float uSliceArc = 1.5;
//
//    float angle = atan(vPosition.y, vPosition.x); // MANDATORY to put FIRST the y axis and THEN the x axis
//    angle -= uSliceStart;
//    angle = mod(angle, PI2);
//
//    if (angle > 0.0 && angle < uSliceArc) {
//        // The sliced portion occurs only when the angle satisfies the said conditions, and if it does, we discard all of the pixels so that they are not drawn
//        discard;
//    }
//    float csm_Slice;
    float xRelativeToSlice = abs(uSliceStartY) - vPosition.y;

    // 判断顶点是否在切片区域内
    if (xRelativeToSlice < uMinWidth || xRelativeToSlice >= uSliceWidth) {
        // 如果顶点不在切片区域内，则丢弃该像素
        discard;
    }
    float csm_Slice;

// csm_FragColor = vec4(vec3(angle), 1.0);
}
