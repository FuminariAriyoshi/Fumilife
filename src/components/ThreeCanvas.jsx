"use client";
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Model from './Model';

export default function ThreeCanvas({ children }) {
    const mountRef = useRef(null);
    const heroRef = useRef(null);
    const modelsRef = useRef([]); // To access models outside useEffect if needed
    const isLoaded = useRef(false);

    useEffect(() => {
        // Prevent double initialization
        if (isLoaded.current) return;
        isLoaded.current = true;

        /*------------------------------
        Renderer
        ------------------------------*/
        const mainSection = mountRef.current;

        // Main Renderer
        let mainRenderer;
        if (mainSection) {
            mainRenderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });
            mainRenderer.setSize(window.innerWidth, window.innerHeight);
            mainSection.appendChild(mainRenderer.domElement);
        }

        // Hero Renderer
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
        const scene = new THREE.Scene();

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
        let controls;
        if (mainRenderer) {
            controls = new OrbitControls(camera, mainRenderer.domElement);
            controls.enableZoom = false;
        }

        let heroControls;
        if (heroRenderer) {
            heroControls = new OrbitControls(camera, heroRenderer.domElement);
            heroControls.enableZoom = false;
        }

        /*------------------------------
        Models
        ------------------------------*/
        let water, dragon, machine;

        water = new Model({
            name: 'water',
            file: '/models/water.glb',
            scene: scene,
            color1: 'white',
            color2: 'yellow',
            placeOnLoad: true, // First model loaded by default
        });

        dragon = new Model({
            name: 'dragon',
            file: '/models/dragon2.glb',
            scene: scene,
            color1: 'white',
            color2: 'green',
        });

        machine = new Model({
            name: 'machine',
            file: '/models/machine2.glb',
            scene: scene,
            color1: 'purple',
            color2: 'white',
        });

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

        // Controllers
        const models = [water, dragon, machine];
        modelsRef.current = models; // Store ref

        // Text elements (managed via DOM selectors as in legacy)
        const textElements = document.querySelectorAll('.text');

        let currentModelIndex = 0;
        let currentImageIndex = 0;
        let isAnimating = false;

        function changeModel(index) {
            if (index === currentModelIndex) return;

            isAnimating = true;

            // Add new model
            models[index].add();

            // Remove other models
            models.forEach((model, i) => {
                if (i !== index) {
                    model.remove();
                }
            });

            // Update text visibility
            titleAnimation(index);
            cornerChangeAnimation();

            currentModelIndex = index;
            currentImageIndex = 0;

            setTimeout(() => {
                isAnimating = false;
            }, 1500);

            // Update Progress Bar
            if (window.progressHandler) {
                window.progressHandler.sync(index);
            }
        }

        // Helper to split text
        const splitText = (element) => {
            if (element.querySelector('.char-wrapper')) return; // Already split
            const content = element.textContent;
            element.innerHTML = '';
            content.split('').forEach(char => {
                const wrapper = document.createElement('span');
                wrapper.className = 'char-wrapper';
                wrapper.style.display = 'inline-block';
                wrapper.style.overflow = 'hidden';
                wrapper.style.verticalAlign = 'bottom'; // Align properly

                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.className = 'char';
                span.style.display = 'inline-block';

                wrapper.appendChild(span);
                element.appendChild(wrapper);
            });
        };

        function titleAnimation(index) {
            const texts = document.querySelectorAll('.text');
            texts.forEach((text, i) => {
                const chars = text.querySelectorAll('.char');
                const wrappers = text.querySelectorAll('.char-wrapper');

                if (i === index) {
                    gsap.set(text, { pointerEvents: 'auto' });
                    gsap.set(chars, { opacity: 1 });

                    // Reset for entry
                    if (wrappers.length > 0) {
                        gsap.set(wrappers, { width: 0, overflow: 'hidden' });
                    }

                    // Animate Wrapper Width (Expand)
                    gsap.to(wrappers, {
                        width: 'auto',
                        duration: 0.8,
                        stagger: 0.05,
                        ease: "power2.out",
                        onComplete: () => {
                            if (wrappers.length > 0) wrappers.forEach(w => w.style.overflow = 'visible');
                        }
                    });

                    // Animate Char Slide (Reveal)
                    gsap.fromTo(chars,
                        { x: '-105%' },
                        {
                            x: '0%',
                            duration: 0.8,
                            stagger: 0.05,
                            ease: "power2.out"
                        }
                    );
                } else {
                    gsap.set(text, { pointerEvents: 'none' });

                    // Enable mask for exit animation
                    if (wrappers.length > 0) wrappers.forEach(w => w.style.overflow = 'hidden');

                    // Animate Wrapper Width (Collapse)
                    gsap.to(wrappers, {
                        width: 0,
                        duration: 0.5,
                        ease: "power2.in",
                        stagger: 0.02
                    });

                    // Animate Char Slide (Exit)
                    gsap.to(chars, {
                        x: '105%',
                        duration: 0.5,
                        ease: "power2.in",
                        stagger: 0.02
                    });
                }
            });
        }

        function cornerChangeAnimation() {
            const corners = document.querySelectorAll('.corner-element');
            corners.forEach(corner => {
                const wrappers = corner.querySelectorAll('.ui-mask');
                if (wrappers.length > 0) {
                    // Enable mask for exit
                    wrappers.forEach(w => w.style.overflow = 'hidden');

                    const targets = Array.from(wrappers).map(w => w.firstElementChild);

                    // Out
                    gsap.to(targets, {
                        y: '105%',
                        duration: 0.5,
                        ease: "power2.in",
                        stagger: 0.02,
                        onComplete: () => {
                            // In
                            gsap.to(targets, {
                                y: '0%',
                                duration: 0.8,
                                ease: "power2.out",
                                stagger: 0.05,
                                delay: 0.1,
                                onComplete: () => {
                                    wrappers.forEach(w => w.style.overflow = 'visible');
                                }
                            });
                        }
                    });
                } else {
                    // Fallback if masking failed
                    gsap.to(corner, {
                        opacity: 0,
                        duration: 0.5,
                        yoyo: true,
                        repeat: 1
                    });
                }
            });
        };

        initialTextAnimation();
        function initialTextAnimation() {
            const texts = document.querySelectorAll('.text');
            texts.forEach(text => {
                splitText(text);
                gsap.set(text, { opacity: 1, pointerEvents: 'none' });

                // Set initial state
                gsap.set(text.querySelectorAll('.char'), { x: '-105%', opacity: 1 });
                // Ensure wrappers start at 0 width and hidden overflow
                gsap.set(text.querySelectorAll('.char-wrapper'), { width: 0, overflow: 'hidden' });
            });

            if (texts.length > 0) {
                const activeText = texts[currentModelIndex];
                const wrappers = activeText.querySelectorAll('.char-wrapper');

                gsap.set(activeText, { pointerEvents: 'auto' });

                // Animate Wrapper Width (Expand)
                gsap.to(wrappers, {
                    width: 'auto',
                    duration: 0.8,
                    stagger: 0.05,
                    ease: "power2.out",
                    delay: 0.5,
                    onComplete: () => {
                        wrappers.forEach(w => w.style.overflow = 'visible');
                    }
                });

                // Animate Char Slide (Reveal)
                gsap.to(activeText.querySelectorAll('.char'), {
                    x: '0%',
                    duration: 0.8,
                    stagger: 0.05,
                    ease: "power2.out",
                    delay: 0.5
                });
            }
        }


        // Initial Corner Animation
        cornerAnimation();
        function cornerAnimation() {
            const corners = document.querySelectorAll('.corner-element');
            corners.forEach(corner => {
                const children = Array.from(corner.children);
                children.forEach(child => {
                    // Avoid double wrapping
                    if (child.parentNode.classList.contains('ui-mask')) return;

                    const wrapper = document.createElement('div');
                    wrapper.className = 'ui-mask';
                    wrapper.style.overflow = 'hidden';

                    // Insert wrapper before child
                    child.parentNode.insertBefore(wrapper, child);
                    // Move child into wrapper
                    wrapper.appendChild(child);
                });

                // Animate children inside masks
                const targets = Array.from(corner.querySelectorAll('.ui-mask')).map(w => w.firstElementChild);
                if (targets.length > 0) {
                    gsap.fromTo(targets, { y: '105%' }, {
                        y: '0%',
                        duration: 1.,
                        ease: "power2.out",
                        stagger: 0.1,
                        onComplete: () => {
                            // Revert overflow to visible to avoid clipping tooltips/dropdowns if any
                            corner.querySelectorAll('.ui-mask').forEach(w => w.style.overflow = 'visible');
                        }
                    });
                }
            });
        }


        /*------------------------------
        Scroll Interaction
        ------------------------------*/
        const handleScroll = (e) => {
            if (isAnimating) return;

            const viewer = document.getElementById('img-viewer');
            const isActive = (viewer && gsap.getProperty(viewer, "opacity") > 0.1) || isOpeningViewer;

            if (isActive) {
                const groups = [
                    document.getElementById('waterImage'),
                    document.getElementById('dragonImage'),
                    document.getElementById('machineImage')
                ];
                const targetGroup = groups[currentModelIndex];
                const images = targetGroup ? targetGroup.querySelectorAll('img') : [];

                if (e.deltaY > 0) {
                    if (currentImageIndex < images.length - 1) {
                        currentImageIndex++;
                        openViewer(currentModelIndex, false);
                    }
                } else {
                    if (currentImageIndex > 0) {
                        currentImageIndex--;
                        openViewer(currentModelIndex, false);
                    } else {
                        closeViewer();
                    }
                }
                return;
            }

            if (e.deltaY > 0) {
                let nextIndex = currentModelIndex + 1;
                if (nextIndex >= models.length) nextIndex = 0;
                changeModel(nextIndex);
            } else {
                let nextIndex = currentModelIndex - 1;
                if (nextIndex < 0) nextIndex = models.length - 1;
                changeModel(nextIndex);
            }
        };
        window.addEventListener('wheel', handleScroll);

        /*------------------------------
        Animation Loop
        ------------------------------*/
        const clock = new THREE.Clock();
        const animate = function () {
            requestAnimationFrame(animate);

            if (heroRenderer) {
                heroRenderer.render(heroScene, camera);
            }
            if (mainRenderer) {
                mainRenderer.render(scene, camera);
            }

            const elapsed = clock.getElapsedTime();
            if (heroWater && heroWater.isActive) heroWater.particleMaterial.uniforms.uTime.value = elapsed;
            if (water && water.isActive) water.particleMaterial.uniforms.uTime.value = elapsed;
            if (dragon && dragon.isActive) dragon.particleMaterial.uniforms.uTime.value = elapsed;
            if (machine && machine.isActive) machine.particleMaterial.uniforms.uTime.value = elapsed;
        };
        animate();

        /*------------------------------
        Resize
        ------------------------------*/
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            if (mainRenderer) mainRenderer.setSize(window.innerWidth, window.innerHeight);
            if (heroRenderer) heroRenderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener('resize', onWindowResize, false);

        /*------------------------------
        Mouse Move
        ------------------------------*/
        function onMouseMove(e) {
            gsap.to(scene.rotation, {
                y: gsap.utils.mapRange(0, window.innerWidth, -2, 2, e.clientX),
                x: gsap.utils.mapRange(0, window.innerHeight, -0.5, 0.5, e.clientY),
            });
        }
        window.addEventListener('mousemove', onMouseMove);

        /*------------------------------
        Explore Hover
        ------------------------------*/
        function animateExploreHover(isHovering) {
            const arrow = document.querySelector('.arrow');
            // const text = document.querySelector('.explore'); // Unused in specific logic shown but defined?

            if (isHovering) {
                gsap.to(arrow, { y: 3, duration: 0.3, ease: "power2.out" });
            } else {
                gsap.to(arrow, { y: 0, duration: 0.3, ease: "power2.out" });
            }
        }

        const exploreContainer = document.querySelector('.explore-container');
        if (exploreContainer) {
            exploreContainer.addEventListener('mouseenter', () => {
                animateExploreHover(true);
            });

            exploreContainer.addEventListener('mouseleave', () => {
                animateExploreHover(false);
            });

            exploreContainer.addEventListener('click', () => {
                openViewer(currentModelIndex);
            });
        }

        /*------------------------------
        Progress Handler
        ------------------------------*/
        class ProgressHandler {
            constructor() {
                this.progress = document.querySelector('.progress');
                this.indicators = [];
                this.mobile = 786;
                this.barCount = models.length;
                this.count = models.length;
                this.userInteractionsEnabled = true;
                this.isDragging = false;
                this.revealThreshold = -1;

                this.init();
            }
            init() {
                if (!this.progress) return;
                this.progress.innerHTML = '';
                this.indicators = [];
                for (let i = 0; i < this.barCount; i++) {
                    const div = document.createElement('div');
                    div.classList.add('progress-indicator');
                    this.progress.appendChild(div);
                    this.indicators.push({ el: div });
                }
                this.isDragging = false;

                this.progress.addEventListener('mouseenter', (e) => this.onPointerDown(e));
                this.progress.addEventListener('mouseleave', () => this.onPointerUp());
                this.progress.addEventListener('mousemove', (e) => this.onPointerMove(e));
                this.progress.addEventListener('touchstart', (e) => this.onPointerDown(e.touches[0]));

                window.addEventListener('touchmove', (e) => {
                    if (this.isDragging) this.onPointerMove(e.touches[0] || e);
                }, { passive: false });
                window.addEventListener('touchend', () => this.onPointerUp());

                this.sync(currentModelIndex);
            }
            onPointerDown(e) {
                if (!this.userInteractionsEnabled) return;
                this.isDragging = true;
                this.updateDrag(e);
            }
            onPointerMove(e) {
                if (!this.isDragging) return;
                this.updateDrag(e);
            }
            onPointerUp() {
                if (!this.isDragging) return;
                this.isDragging = false;
            }
            updateDrag(e) {
                const rect = this.progress.getBoundingClientRect();
                let ratio;
                if (window.innerWidth > this.mobile) {
                    ratio = (e.clientX - rect.left) / rect.width;
                } else {
                    ratio = (e.clientY - rect.top) / rect.height;
                }
                ratio = Math.max(0, Math.min(1, ratio));
                const targetIndex = Math.round(ratio * (this.count - 1));
                const barIndex = Math.round(ratio * (this.barCount - 1));
                this.updateProgressUI(barIndex);

                const pageNum = document.getElementById('current-page');
                if (pageNum) pageNum.innerText = (targetIndex % this.count) + 1;

                if (targetIndex !== currentModelIndex) {
                    changeModel(targetIndex);
                }
            }
            sync(index) {
                const ratio = index / (this.count - 1);
                const barIndex = Math.round(ratio * (this.barCount - 1));
                this.updateProgressUI(barIndex);
                const pageNum = document.getElementById('current-page');
                if (pageNum) pageNum.innerText = (index % this.count) + 1;
            }
            updateProgressUI(index) {
                if (!this.indicators) return;
                const count = this.indicators.length;
                const activeSpread = 10;
                const edgeSpread = 8;
                const getGauss = (dist, spread) => {
                    if (dist > spread) return 0;
                    const sigma = spread / 2.5;
                    return Math.exp(-(dist * dist) / (2 * sigma * sigma));
                };
                const getQuad = (dist, spread) => {
                    if (dist > spread) return 0;
                    return Math.pow(1 - dist / spread, 2);
                };

                this.indicators.forEach((item, i) => {
                    const { el } = item;
                    const distActive = Math.abs(i - index);
                    const strActive = getGauss(distActive, activeSpread);
                    const distStart = Math.abs(i - 0);
                    const strStart = getQuad(distStart, edgeSpread);
                    const distEnd = Math.abs(i - (count - 1));
                    const strEnd = getQuad(distEnd, edgeSpread);

                    let scale = 0.5 + strActive * 0.3;
                    scale += strStart * 0.2;
                    scale += strEnd * 0.2;
                    let opacity = 0.2 + 0.8 * strActive;

                    const isDesktop = window.innerWidth > this.mobile;
                    const isActive = i === index;
                    const durationTime = 1.;

                    if (isActive) {
                        el.classList.add('active');
                        if (isDesktop) {
                            gsap.to(el, { duration: durationTime, width: 21, backgroundColor: 'transparent', border: '1px solid white', scaleY: 1, opacity: 1, ease: "power2.out" });
                        } else {
                            gsap.to(el, { duration: durationTime, scaleX: scale, scaleY: 1, width: 10, transformOrigin: 'right center', opacity: 1, backgroundColor: 'white', border: 'none', ease: "power2.out" });
                        }
                    } else {
                        el.classList.remove('active');
                        if (isDesktop) {
                            gsap.to(el, { duration: durationTime, width: 1, backgroundColor: 'white', border: 'none', scaleY: scale, opacity: opacity, ease: "power2.out" });
                        } else {
                            gsap.to(el, { duration: durationTime, scaleX: scale, scaleY: 1, width: 10, transformOrigin: 'right center', opacity: opacity, backgroundColor: 'white', border: 'none', ease: "power2.out" });
                        }
                    }
                });
            }
        }

        // Delay init to ensure DOM is ready? 
        // Since this is useEffect, DOM should be ready, but maybe use setTimeout to be safe like in legacy
        setTimeout(() => {
            window.progressHandler = new ProgressHandler();
        }, 100);

        /*------------------------------
        Viewer Logic
        ------------------------------*/
        let isOpeningViewer = false;

        function switchImage(group, targetIndex) {
            if (!group) return;
            const slider = group.querySelector('.images-slider');
            if (!slider) return;
            const images = slider.querySelectorAll('img');
            images.forEach(img => gsap.set(img, { display: 'block', opacity: 1 }));
            const targetImage = images[targetIndex];
            if (!targetImage) return;
            const wrapperHeight = group.offsetHeight || window.innerHeight;
            const targetTop = targetImage.offsetTop;
            const targetHeight = targetImage.offsetHeight;
            const moveY = (wrapperHeight / 2) - (targetTop + targetHeight / 2);
            gsap.to(slider, { y: moveY, duration: 1, ease: 'power2.out', overwrite: true });
        }

        function updateOverviewLine(modelIndex, imageIndex, immediate = false) {
            const line = document.querySelector('.overview-line');
            const overviewGroups = [
                document.getElementById('waterOverview'),
                document.getElementById('dragonOverview'),
                document.getElementById('machineOverview')
            ];
            const activeGroup = overviewGroups[modelIndex];
            if (!activeGroup || !line) return;
            const images = activeGroup.querySelectorAll('.overview-img');
            if (images.length === 0) return;
            const idx = Math.min(Math.max(imageIndex, 0), images.length - 1);
            const targetImage = images[idx];
            if (targetImage) {
                const rect = targetImage.getBoundingClientRect();
                const centerY = rect.top + (rect.height / 2);
                if (immediate) {
                    gsap.set(line, { width: rect.width + 10, height: rect.height + 10, top: centerY });
                } else {
                    gsap.to(line, { width: rect.width + 10, height: rect.height + 10, top: centerY, duration: 0.8, ease: 'power3.out' });
                }
            }
        }

        function openViewer(index, autoCycle = true) {
            const viewer = document.getElementById('img-viewer');
            const line = document.querySelector('.overview-line');
            if (!viewer) return;

            const groups = [
                document.getElementById('waterImage'),
                document.getElementById('dragonImage'),
                document.getElementById('machineImage')
            ];

            // Update isOpeningViewer global-ish state? 
            // This function uses closure variable isOpeningViewer

            const currentOpacity = gsap.getProperty(viewer, "opacity");
            // Allow interaction if fully open OR currently opening
            const isActive = currentOpacity > 0.9 || isOpeningViewer;

            // if (!isActive && isOpeningViewer) return; // Removed this guard to allow updates during opening

            const targetGroup = groups[index];
            if (targetGroup) {
                const images = targetGroup.querySelectorAll('img');
                if (isActive) {
                    if (autoCycle) {
                        currentImageIndex++;
                        if (currentImageIndex >= images.length) currentImageIndex = 0;
                    }
                } else {
                    isOpeningViewer = true;
                    currentImageIndex = 0;
                }
            }

            groups.forEach((group, i) => {
                if (!group) return;
                if (i !== index) {
                    gsap.set(group, { display: 'none', autoAlpha: 0 });
                } else {
                    app: {
                        // Using a specialized approach for setting initial position
                    }
                    gsap.set(group, { display: 'block', autoAlpha: 1 });

                    if (!isActive) {
                        // Force a reflow for this group if needed, though requestAnimationFrame is safer
                        // void group.offsetWidth; 

                        requestAnimationFrame(() => {
                            const slider = group.querySelector('.images-slider');
                            const images = slider ? slider.querySelectorAll('img') : [];

                            if (images.length > 0 && slider) {
                                // Ensure images are visible for calculation
                                images.forEach(img => gsap.set(img, { display: 'block', opacity: 1 }));

                                const targetImage = images[0]; // Always start with 0 when opening? Yes, currentImageIndex reset above.

                                // Ensure we have valid dimensions. If image is not loaded, this might still fail.
                                // But assuming loaded:
                                const wrapperHeight = group.offsetHeight || window.innerHeight;
                                const targetTop = targetImage.offsetTop;
                                const targetHeight = targetImage.offsetHeight;

                                if (targetHeight > 0) {
                                    const moveY = (wrapperHeight / 2) - (targetTop + targetHeight / 2);
                                    gsap.set(slider, { y: moveY });
                                } else {
                                    // Fallback if height is 0 (e.g. image not loaded yet)
                                    // Maybe add onload listener?
                                    if (!targetImage.complete) {
                                        targetImage.onload = () => {
                                            const wH = group.offsetHeight || window.innerHeight;
                                            const tT = targetImage.offsetTop;
                                            const tH = targetImage.offsetHeight;
                                            const mY = (wH / 2) - (tT + tH / 2);
                                            gsap.set(slider, { y: mY });
                                        };
                                    }
                                }
                            }
                        });
                    }
                }
            });

            if (isActive) {
                switchImage(targetGroup, currentImageIndex);
                updateOverviewLine(index, currentImageIndex);
            } else {
                // Open animation
            }

            viewer.classList.remove('hidden');

            if (!isActive) {
                try { models[index].disperse(); } catch (e) { }
                const exploreContainer = document.querySelector('.explore-container');
                if (exploreContainer) {
                    gsap.to(exploreContainer, { opacity: 0, duration: 0.1, ease: "power2.out" });
                }
            }

            const overview = document.querySelector('.overview');
            if (overview) {
                const overviewGroups = [
                    document.getElementById('waterOverview'),
                    document.getElementById('dragonOverview'),
                    document.getElementById('machineOverview')
                ];
                overviewGroups.forEach((group, i) => {
                    if (!group) return;
                    if (i === index) {
                        gsap.set(group, { display: 'flex', autoAlpha: 1 });
                    } else {
                        gsap.set(group, { display: 'none', autoAlpha: 0 });
                    }
                });

                gsap.set('.overview-img', { y: 0 });
                gsap.set('.overview-line', { y: 0, yPercent: -50 });
                updateOverviewLine(index, currentImageIndex, !isActive);

                if (!isActive) {
                    // Animate In logic
                    const ease = 'expo.out';
                    const durationTime = 1.5;
                    gsap.fromTo(viewer, { y: window.innerHeight, opacity: 0 },
                        { y: 0, duration: durationTime, opacity: 1, visibility: 'visible', pointerEvents: 'auto', ease: ease, onComplete: () => { isOpeningViewer = false; } });
                    gsap.fromTo(overview, { opacity: 0 }, { duration: durationTime, opacity: 1, visibility: 'visible', pointerEvents: 'auto', ease: ease });

                    const activeGroup = overviewGroups[index];
                    const activeImages = activeGroup ? activeGroup.querySelectorAll('img') : [];
                    if (activeGroup && activeImages.length > 0) {
                        const elementsToAnimate = [...Array.from(activeImages), line];
                        gsap.fromTo(elementsToAnimate, { y: window.innerHeight, opacity: 0 },
                            {
                                duration: durationTime,
                                y: 0,
                                opacity: (i, t) => t === line ? 0.8 : 1,
                                ease: ease,
                                stagger: 0.008,
                                onStart: () => {
                                    if (activeGroup) activeGroup.style.overflowY = 'visible';
                                },
                                onComplete: () => {
                                    if (activeGroup) activeGroup.style.overflowY = 'visible';
                                }
                            });
                    }
                }
            }
        }

        function closeViewer() {
            const viewer = document.getElementById('img-viewer');
            if (!viewer) return;

            // Kill running animations immediately!
            isOpeningViewer = false;
            gsap.killTweensOf(viewer);
            gsap.killTweensOf('.overview-line');
            gsap.killTweensOf('.overview-img');
            gsap.killTweensOf('.overview');
            gsap.killTweensOf('.explore-container');
            gsap.killTweensOf('.explore');
            gsap.killTweensOf('.arrow');

            const line = document.querySelector('.overview-line');
            if (line) gsap.to(line, { opacity: 0, duration: 0.5 });

            if (heroSection) gsap.to(heroSection, { opacity: 1, duration: 0.5 });

            gsap.to(viewer, {
                duration: 0.5,
                opacity: 0,
                pointerEvents: 'none',
                ease: 'power2.out',
                onComplete: () => { viewer.style.visibility = 'hidden'; }
            });

            const exploreContainer = document.querySelector('.explore-container');
            const exploreText = document.querySelector('.explore');
            const exploreWrapper = document.querySelector('.explore-wrapper');
            const arrow = document.querySelector('.arrow');
            const arrowWrapper = document.querySelector('.arrow-wrapper');

            if (exploreContainer) {
                exploreAnimation();
            }

            models[currentModelIndex].assemble();
            currentImageIndex = 0;

            const overview = document.querySelector('.overview');
            if (overview) {
                gsap.to(overview, {
                    duration: 0.5,
                    opacity: 0,
                    pointerEvents: 'none',
                    ease: 'power2.out',
                    onComplete: () => { overview.style.visibility = 'hidden'; }
                });
            }
        }


        function exploreAnimation() {
            const exploreContainer = document.querySelector('.explore-container');
            const exploreText = document.querySelector('.explore');
            const exploreWrapper = document.querySelector('.explore-wrapper');
            const arrow = document.querySelector('.arrow');
            const arrowWrapper = document.querySelector('.arrow-wrapper');

            gsap.to(exploreContainer, { opacity: 1 });

            if (exploreWrapper) exploreWrapper.style.overflow = 'hidden';
            if (arrowWrapper) arrowWrapper.style.overflow = 'hidden';

            const durationTime = 1.;

            gsap.fromTo(exploreText, { y: 80, opacity: 1 }, {
                y: 0,
                duration: durationTime,
                ease: "power2.out",
                onComplete: () => {
                    if (exploreWrapper) exploreWrapper.style.overflow = 'visible';
                }
            });
            gsap.fromTo(arrow, { y: 90, opacity: 1 }, {
                y: 0,
                duration: durationTime,
                ease: "power2.out",
                onComplete: () => {
                    if (arrowWrapper) arrowWrapper.style.overflow = 'visible';
                }
            });
        }



        /*------------------------------
        Scroll Interaction
        ------------------------------*/
        /*------------------------------
        Keyboard Interaction
        ------------------------------*/
        window.addEventListener('keydown', (e) => {

            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const viewer = document.getElementById('img-viewer');
                const isActive = (gsap.getProperty(viewer, "opacity") > 0.1) || isOpeningViewer;

                if (isActive) {
                    const groups = [
                        document.getElementById('waterImage'),
                        document.getElementById('dragonImage'),
                        document.getElementById('machineImage')
                    ];
                    const targetGroup = groups[currentModelIndex];
                    const images = targetGroup ? targetGroup.querySelectorAll('img') : [];

                    if (e.key === 'ArrowRight') {
                        if (currentImageIndex < images.length - 1) {
                            currentImageIndex++;
                            openViewer(currentModelIndex, false);
                        }
                    } else {
                        if (currentImageIndex > 0) {
                            currentImageIndex--;
                            openViewer(currentModelIndex, false);
                        }
                    }
                } else {
                    if (e.key === 'ArrowRight') {
                        let nextIndex = currentModelIndex + 1;
                        if (nextIndex >= models.length) nextIndex = 0;
                        changeModel(nextIndex);
                    } else {
                        let nextIndex = currentModelIndex - 1;
                        if (nextIndex < 0) nextIndex = models.length - 1;
                        changeModel(nextIndex);
                    }
                }
            }

            if (e.key === 'ArrowDown') {
                if (mainSection) openViewer(currentModelIndex);
            }

            if (e.key === 'ArrowUp') {
                const viewer = document.getElementById('img-viewer');
                const isActive = (gsap.getProperty(viewer, "opacity") > 0.1) || isOpeningViewer;

                if (isActive) {
                    if (currentImageIndex > 0) {
                        currentImageIndex--;
                        openViewer(currentModelIndex, false);
                    } else {
                        closeViewer();
                    }
                }
            }
        });
    }, []);
    return (
        <>
            <div id="hero-section" ref={heroRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }}></div>
            <div id="main-section" ref={mountRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 20 }}>{children}</div>
        </>
    );
}

