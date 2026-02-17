attribute vec3 aRandom;

varying vec3 vPosition;

uniform float uTime;
uniform float uScale;
uniform float uDispersion;
uniform float pressed;
uniform float uPointSize;

void main() {
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;

    float time = uTime * 4.0;

    vec3 pos = position;

    pos.x += sin(time * aRandom.x) * 0.01;
    pos.y += cos(time * aRandom.y) * 0.01;
    pos.z += cos(time * aRandom.z) * 0.01;

// dispersion
    pos.x += aRandom.x * uDispersion;
    pos.y += aRandom.y * uDispersion;
    pos.z += aRandom.z * uDispersion;

// scale
    pos.x *= uScale + (sin(pos.y*4. + time) *(1.-uScale));
    pos.y *= uScale + (cos(pos.z*4. + time) *(1.-uScale));
    pos.z *= uScale + (sin(pos.x*4. + time) *(1.-uScale));

    pos *= uScale;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // size of the particles
    // size of the particles
    gl_PointSize = uPointSize * (8.0 / -mvPosition.z);
}