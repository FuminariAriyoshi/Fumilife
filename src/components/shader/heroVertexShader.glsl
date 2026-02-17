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
    // pos.y += cos(time * aRandom.y) * 0.01;
    // pos.z += cos(time * aRandom.z) * 0.01;

// scale
    pos.x *= pressed + (sin(pos.y*2. + time) *(1.));
    pos.y *= pressed + (cos(pos.z*2. + time) *(1.));
    pos.z *= pressed + (sin(pos.x*2. + time) *(1.));


    // // 中心を高くして集める (Raise center and gather)
    // float dist = length(pos.xz);
    // // 中心に近いほど高くする + 少し集める
    // float heightFactor = 1.0 + (0.5 / (dist + 0.1));
    
    // // Y軸方向に伸ばす
    // pos.y *= heightFactor;
    
    // // 少し中心に寄せる (Optional: gather effect)
    // pos.x /= (dist * 0.5 + 1.0);
    // pos.z /= (dist * 0.5 + 1.0);
    
    // // 螺旋状にねじる (Twist effect)
    // float angle = pos.y * 0.5 + time * 0.5;
    // float s = sin(angle);
    // float c = cos(angle);
    // float newX = pos.x * c - pos.z * s;
    // float newZ = pos.x * s + pos.z * c;
    // pos.x = newX;
    // pos.z = newZ;

    // pos *= pressed;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // size of the particles
    // size of the particles
    gl_PointSize = uPointSize * (8.0 / -mvPosition.z);
}