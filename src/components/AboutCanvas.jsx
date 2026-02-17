"use client";
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Model from './Model';

export default function AboutCanvas({ children }) {
    const heroRef = useRef(null);
    const isLoaded = useRef(false);

    useEffect(() => {
        if (isLoaded.current) return;
        isLoaded.current = true;

        /*------------------------------
        Renderer
        ------------------------------*/
        const heroSection = heroRef.current;
        let heroRenderer;

        if (heroSection) {
            heroRenderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });
            heroRenderer.setSize(window.innerWidth, window.innerHeight);
            heroSection.appendChild(heroRenderer.domElement);
        }

        /*------------------------------
        Scene & Camera
        ------------------------------*/
        const heroScene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            40,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        camera.position.x = 0;
        camera.position.z = 5;
        camera.position.y = 1;

        /*------------------------------
        OrbitControls
        ------------------------------*/
        let heroControls;
        if (heroRenderer) {
            heroControls = new OrbitControls(camera, heroRenderer.domElement);
            heroControls.enableZoom = false;
        }

        /*------------------------------
        Models
        ------------------------------*/
        // Hero Model (Machine Particles)
        const heroWater = new Model({
            name: 'hero-particles',
            file: '/models/dragon2.glb',
            scene: heroScene,
            color1: 'purple',
            color2: 'white',
            placeOnLoad: true,
            pressed: 1.2,
            isHero: true,
        });

        /*------------------------------
        Clock
        ------------------------------*/
        const clock = new THREE.Clock();

        /*------------------------------
        Loop
        ------------------------------*/
        const animate = () => {
            requestAnimationFrame(animate);

            if (heroRenderer) {
                heroRenderer.render(heroScene, camera);
            }

            if (heroControls) heroControls.update();

            const elapsed = clock.getElapsedTime();
            if (heroWater && heroWater.isActive) heroWater.particleMaterial.uniforms.uTime.value = elapsed;
        };
        animate();

        /*------------------------------
        Resize
        ------------------------------*/
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            if (heroRenderer) heroRenderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener('resize', onWindowResize, false);

        /*------------------------------
        Mouse Move
        ------------------------------*/
        function onMouseMove(e) {
            gsap.to(heroScene.rotation, {
                y: gsap.utils.mapRange(0, window.innerWidth, -0.2, 0.2, e.clientX), // Reduced rotation for background
                x: gsap.utils.mapRange(0, window.innerHeight, -0.1, 0.1, e.clientY),
            });
        }
        window.addEventListener('mousemove', onMouseMove);

        return () => {
            window.removeEventListener('resize', onWindowResize);
            window.removeEventListener('mousemove', onMouseMove);
            // Cleanup logic if needed (dispose renderer, remove listeners)
        };
    }, []);

    return (
        <>
            <div id="hero-section" ref={heroRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }}></div>
            {children}
        </>
    );
}
