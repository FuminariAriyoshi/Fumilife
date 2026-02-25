"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "../app/about/about.css";

export default function AboutPageClient() {
    const containerRef = useRef(null);
    const ARROW_SVG = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" class="external-link-icon" style="margin-left: 4px; display: inline-block; vertical-align: middle;"><path d="M1 9L9 1M9 1H2M9 1V8" stroke="currentColor" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        /**
         * テキストを単語ごとに span でラップする
         */
        const wrapWordsInSpan = (element) => {
            const text = element.textContent.trim();
            element.innerHTML = text
                .split(/\s+/) // 複数の空白にも対応
                .map(word => {
                    const content = word === "↗" ? ARROW_SVG : word;
                    return `<span class="word" style="display:inline-block; overflow:hidden; vertical-align:bottom;"><span class="word-inner" style="display:inline-block;">${content}</span></span>`;
                })
                .join(' ');
        };

        const ctx = gsap.context(() => {
            // Target elements for word reveal
            const introItems = document.querySelectorAll(".about-bio li");
            const valueItems = document.querySelectorAll(".about-value li");
            const socialLinks = document.querySelectorAll(".about-socials-col a");
            const projectItems = document.querySelectorAll(".about-lists-right-wrapper li");

            introItems.forEach(item => wrapWordsInSpan(item));
            valueItems.forEach(item => wrapWordsInSpan(item));
            socialLinks.forEach(link => wrapWordsInSpan(link));
            projectItems.forEach(item => wrapWordsInSpan(item));

            const labels = document.querySelectorAll(".about-list-title");
            const introWords = document.querySelectorAll(".about-bio li .word-inner");
            const valueWords = document.querySelectorAll(".about-value li .word-inner");
            const socialWords = document.querySelectorAll(".about-socials-col a .word-inner");
            const projectWords = document.querySelectorAll(".about-lists-right-wrapper li .word-inner");

            const parents = document.querySelectorAll(".about-bio, .about-value, .about-socials-col, .about-lists-right-wrapper");

            // Timeline for coordinated reveal (Page Load Initial Animation)
            const tl = gsap.timeline({
                delay: 0.2, // 初期ディレイ
            });

            const wordAnim = {
                yPercent: 100,
                targetY: 0,
                duration: 4.0,
                stagger: 0.02,
                ease: "expo.out"
            };

            // Make elements visible and sequence animations
            tl.set(parents, { autoAlpha: 1 })
                .fromTo(".about-hero-title",
                    { y: "110%", autoAlpha: 1 },
                    {
                        y: "0%",
                        autoAlpha: 1,
                        duration: 2.0,
                        ease: "expo.out",
                    }
                )
                .fromTo(labels,
                    { autoAlpha: 0, yPercent: 100 },
                    {
                        autoAlpha: 1,
                        yPercent: 0,
                        duration: 0.8,
                        stagger: 0,
                        ease: "power2.out",
                    },
                    "<0.2"
                )
                .fromTo(".about-list-line",
                    { scaleX: 0, autoAlpha: 1 },
                    {
                        scaleX: 1,
                        autoAlpha: 1,
                        duration: 1.8,
                        stagger: 0,
                        ease: "expo.out",
                    },
                    "<" // ラベルのアニメーションと同時に開始
                )
                .fromTo(introWords, { yPercent: 100 }, { yPercent: 0, duration: wordAnim.duration, stagger: wordAnim.stagger, ease: wordAnim.ease }, "<0.18")
                .fromTo(valueWords, { yPercent: 100 }, { yPercent: 0, duration: wordAnim.duration, stagger: wordAnim.stagger, ease: wordAnim.ease }, "<")
                .fromTo(socialWords, { yPercent: 100 }, { yPercent: 0, duration: wordAnim.duration, stagger: wordAnim.stagger, ease: wordAnim.ease }, "<")
                .fromTo(projectWords, { yPercent: 100 }, { yPercent: 0, duration: wordAnim.duration, stagger: wordAnim.stagger, ease: wordAnim.ease }, "<");

            // Ensure visibility for right items
            tl.set(".about-lists-right-wrapper", { autoAlpha: 1 }, 0);

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div className="about-page" ref={containerRef}>
            <div className="about-container">
                <section className="about-hero" style={{ overflow: 'hidden' }}>
                    <h1 className="about-hero-title text-huge">
                        FUMILIFE
                    </h1>
                </section>

                <div className="about-content-wrapper">
                    <div className="about-info-stack">
                        <section className="about-grid">
                            <div className="about-bio">
                                <h2 className="about-list-title">Introduction</h2>
                                <div className="about-list-line"></div>
                                <ul className="about-list-items text-small" style={{ lineHeight: '2' }}>
                                    <li className="about-list-item">FUMINARI ARIYOSHI IS A CREATIVE DEVELOPER</li>
                                    <li className="about-list-item">FOCUSING ON THE INTERSECTION OF DESIGN AND TECHNOLOGY.</li>
                                    <li className="about-list-item">UNDER THE MONIKER FUMILIFE, HE EXPLORES DIGITAL AESTHETICS</li>
                                    <li className="about-list-item">THROUGH MOTION, INTERACTION, AND MINIMALISM.</li>
                                    <li className="about-list-item">BASED IN JAPAN, HE WORKS WITH FORWARD-THINKING CLIENTS</li>
                                    <li className="about-list-item">TO BUILD IMMERSIVE WEB EXPERIENCES.</li>
                                </ul>
                            </div>
                        </section>

                        <section className="about-value">
                            <h2 className="about-list-title">Brand Value</h2>
                            <div className="about-list-line"></div>
                            <ul className="about-list-items">
                                <li className="about-list-item">1. STRATEGIC STORYTELLING</li>
                                <li className="about-list-item">2. MINIMALIST AESTHETIC</li>
                                <li className="about-list-item">3. TECHNICAL EXCELLENCE</li>
                                <li className="about-list-item">4. EMOTIONAL INTERACTION</li>
                            </ul>
                        </section>

                        <div className="about-socials-col">
                            <h2 className="about-list-title">Socials</h2>
                            <div className="about-list-line"></div>
                            <ul className="about-list-items">
                                <li className="about-list-item">
                                    <a href="https://www.instagram.com/fumilife__a" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
                                </li>
                                <li className="about-list-item">
                                    <a href="https://www.youtube.com/@Fumi_design99" target="_blank" rel="noopener noreferrer">Youtube ↗</a>
                                </li>
                                <li className="about-list-item">
                                    <a href="https://x.com/Fumi__aa" target="_blank" rel="noopener noreferrer">X ↗</a>
                                </li>
                            </ul>
                        </div>
                        <div className="about-lists-right-wrapper">
                            <div>
                                <h2 className="about-list-title">Selected Projects</h2>
                                <div className="about-list-line"></div>
                                <ul className="about-list-items">
                                    <li className="about-list-item">BRAND IDENTITY SYSTEM</li>
                                    <li className="about-list-item">3D SHADER EXPLORER</li>
                                    <li className="about-list-item">GLID MOTION GRID</li>
                                    <li className="about-list-item">VOICE INTERFACE DESIGN</li>
                                    <li className="about-list-item">GENERATIVE ART SERIES</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="about-list-title">Capabilities</h2>
                                <div className="about-list-line"></div>
                                <ul className="about-list-items">
                                    <li className="about-list-item">CREATIVE DIRECTION</li>
                                    <li className="about-list-item">UI/UX DESIGN</li>
                                    <li className="about-list-item">FRONT-END DEVELOPMENT</li>
                                    <li className="about-list-item">3D WEB (THREE.JS / WEBGL)</li>
                                    <li className="about-list-item">INTERACTION DESIGN</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
