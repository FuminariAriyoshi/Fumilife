"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "../app/about/about.css";

export default function AboutPageClient() {
    const containerRef = useRef(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            // Reveal huge title
            gsap.fromTo(".about-hero-title",
                { y: 200, autoAlpha: 0 },
                {
                    y: 0,
                    autoAlpha: 1,
                    duration: 1.5,
                    ease: "expo.out",
                    delay: 0.5,
                }
            );

            // Reveal grid items
            gsap.fromTo(".about-grid > div, .about-value",
                { y: 60, autoAlpha: 0 },
                {
                    y: 0,
                    autoAlpha: 1,
                    duration: 1.2,
                    stagger: 0.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".about-grid",
                        start: "top 85%",
                    },
                }
            );

            // Reveal footer
            gsap.fromTo(".about-footer",
                { autoAlpha: 0 },
                {
                    autoAlpha: 1,
                    duration: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: ".about-footer",
                        start: "top 90%",
                    },
                }
            );

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div className="about-page" ref={containerRef}>
            <div className="about-container">
                <div className="about-top-group">
                    <section className="about-hero">
                        <h1 className="about-hero-title text-huge">
                            FUMILIFE
                        </h1>
                    </section>

                    <div className="about-main-wrapper">
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
                    </div>
                </div>

                <section className="about-footer">
                    <div className="about-lists">
                        <div className="about-socials-col">
                            <h2 className="about-list-title">Socials</h2>
                            <ul className="about-list-items">
                                <li className="about-list-item">
                                    <a href="https://www.instagram.com/fumilife" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
                                </li>
                                <li className="about-list-item">
                                    <a href="https://www.youtube.com/@fumilife" target="_blank" rel="noopener noreferrer">Youtube ↗</a>
                                </li>
                                <li className="about-list-item">
                                    <a href="#" target="_blank" rel="noopener noreferrer">X ↗</a>
                                </li>
                            </ul>
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
                </section>
            </div>
        </div>
    );
}
