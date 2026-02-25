"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "../app/about/about.css";

export default function AboutPageClient() {
    const containerRef = useRef(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        /**
         * テキストを単語ごとに span でラップする
         */
        const wrapWordsInSpan = (element) => {
            const text = element.textContent.trim();
            element.innerHTML = text
                .split(/\s+/) // 複数の空白にも対応
                .map(word => `<span class="word" style="display:inline-block; overflow:hidden; vertical-align:bottom;"><span class="word-inner" style="display:inline-block;">${word}</span></span>`)
                .join(' ');
        };

        const ctx = gsap.context(() => {
            // Reveal huge title
            gsap.fromTo(".about-hero-title",
                { y: "110%", autoAlpha: 1 },
                {
                    y: "0%",
                    autoAlpha: 1,
                    duration: 2,
                    ease: "expo.out",
                    delay: 0.2,
                }
            );

            // Target elements for word reveal
            const introParagraph = document.querySelector(".about-bio p");
            const valueItems = document.querySelectorAll(".about-value li");
            const socialLinks = document.querySelectorAll(".about-socials-col a");

            if (introParagraph) wrapWordsInSpan(introParagraph);
            valueItems.forEach(item => wrapWordsInSpan(item));
            socialLinks.forEach(link => wrapWordsInSpan(link));

            const labels = document.querySelectorAll(".about-list-title");
            const allWords = document.querySelectorAll(".about-bio p .word-inner, .about-value li .word-inner, .about-socials-col a .word-inner");
            const parents = document.querySelectorAll(".about-bio, .about-value, .about-socials-col");

            // Timeline for coordinated reveal (Page Load Initial Animation)
            const tl = gsap.timeline({
                delay: 1.2, // タイトルのリビール開始後、少し遅れて開始
            });

            // Make parents visible immediately when timeline starts
            tl.set(parents, { autoAlpha: 1 })
                .fromTo(labels,
                    { autoAlpha: 0, yPercent: 100 },
                    {
                        autoAlpha: 1,
                        yPercent: 0,
                        duration: 0.8,
                        stagger: 0.2,
                        ease: "power2.out",
                    })
                .fromTo(allWords,
                    { yPercent: 100 },
                    {
                        yPercent: 0,
                        duration: 1.2,
                        stagger: 0.025, // staggerを大きくした (0.01 -> 0.025)
                        ease: "expo.out",
                    },
                    "+=0.4" // ラベル表示の途中から開始
                );

            // Selected Projects / Capabilities (desktop only) reveal
            const rightLists = document.querySelector(".about-lists-right-wrapper");
            if (rightLists) {
                gsap.fromTo(rightLists,
                    { autoAlpha: 0 },
                    {
                        autoAlpha: 1,
                        duration: 1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: rightLists,
                            start: "top 95%",
                        },
                    }
                );
            }

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
                                <p className="about-list-item text-small" style={{ lineHeight: '2' }}>
                                    FUMINARI ARIYOSHI IS A CREATIVE DEVELOPER FOCUSING ON THE INTERSECTION OF DESIGN AND TECHNOLOGY.
                                    UNDER THE MONIKER FUMILIFE, HE EXPLORES DIGITAL AESTHETICS THROUGH MOTION, INTERACTION, AND MINIMALISM.
                                    BASED IN JAPAN, HE WORKS WITH FORWARD-THINKING CLIENTS TO BUILD IMMERSIVE WEB EXPERIENCES.
                                </p>
                            </div>
                        </section>

                        <section className="about-value">
                            <h2 className="about-list-title">Brand Value</h2>
                            <ul className="about-list-items">
                                <li className="about-list-item">1. STRATEGIC STORYTELLING</li>
                                <li className="about-list-item">2. MINIMALIST AESTHETIC</li>
                                <li className="about-list-item">3. TECHNICAL EXCELLENCE</li>
                                <li className="about-list-item">4. EMOTIONAL INTERACTION</li>
                            </ul>
                        </section>

                        <div className="about-socials-col">
                            <h2 className="about-list-title">Socials</h2>
                            <ul className="about-list-items">
                                <li className="about-list-item">
                                    <a href="https://www.instagram.com/fumilife__a" target="_blank" rel="noopener noreferrer">Instagram <span className="external-link-arrow">↗</span></a>
                                </li>
                                <li className="about-list-item">
                                    <a href="https://www.youtube.com/@fumi99" target="_blank" rel="noopener noreferrer">Youtube <span className="external-link-arrow">↗</span></a>
                                </li>
                                <li className="about-list-item">
                                    <a href="#" target="_blank" rel="noopener noreferrer">X <span className="external-link-arrow">↗</span></a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="about-lists-right-wrapper">
                        <div>
                            <h2 className="about-list-title">Selected Projects</h2>
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
    );
}
