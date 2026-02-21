import React from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Model from './Model';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {ChromaticAberrationShader} from 'three/examples/jsm/shaders/ChromaticAberrationShader';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import {unrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';

export default function Chromatic Aberration() {
    const containerRef = useRef(null);
    const isLoaded = useRef(false);

    useEffect(() => {
        if (isLoaded.current) return;
        isLoaded.current = true;
    }, []);
}

this.myeffect = {

    vertexShader: `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix
        * modelViewMatrix
        * vec4(position, 1.0);
    }
    `,
    
    fragmentShader: `
uniform sampler2D tDiffuse;
varying vec2 vUv;
void main() {
    vec2 newUV =vUv;
    newUV.x += (vUv.x -0.5) * 0.5*vUv.y;
    gl_Fragcolor = texture2D(tDiffuse, newUV);
`,
}