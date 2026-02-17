varying vec3 vPosition;

uniform vec3 uColor1;
uniform vec3 uColor2;

void main() {
    vec3 color = vec3(1.0, 1.0, 1.0);
    color = vec3(0.5, 0.5, 0.5);
    color.r = 0.0;


    float depth = vPosition.z*0.5+0.5;
    color = mix(uColor1, uColor2, depth);
    
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) {
        discard;
    }

    gl_FragColor = vec4(color, depth * 0.3 + 0.2);
}