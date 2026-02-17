"use client";
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import TransitionLink from '../components/TransitionLink';
import './2D.css';

export default function TwoDPage() {
  useEffect(() => {
    gsap.registerPlugin(Observer);

    const container = document.querySelector('.infinite-scroll-container .container');
    if (!container) return;

    let halfX = 0;
    let halfY = 0;

    // Function to update dimensions (responsive support)
    const updateDimensions = () => {
      const content = document.querySelector('.infinite-scroll-container .content'); // Target the first content block
      if (content) {
        halfX = content.offsetWidth; // Use exact rendered width of one block
        halfY = content.offsetHeight; // Use exact rendered height of one block
      }
    };

    // Initial calculation
    // Defer slightly to ensure layout
    setTimeout(updateDimensions, 100);

    // Recalculate on resize
    window.addEventListener('resize', updateDimensions);

    let xTo = gsap.quickTo(container, 'x', {
      duration: 1.5,
      ease: "power4",
      modifiers: {
        x: (x) => gsap.utils.unitize(gsap.utils.wrap(-halfX, 0))(x) // Dynamic wrapping
      }
    });

    let yTo = gsap.quickTo(container, 'y', {
      duration: 1.5,
      ease: "power4",
      modifiers: {
        y: (y) => gsap.utils.unitize(gsap.utils.wrap(-halfY, 0))(y) // Dynamic wrapping
      }
    });

    let incrX = 0, incrY = 0;

    // Observer to handle wheel and drag events
    const observer = Observer.create({
      target: window,
      type: "wheel,touch,pointer", // Handles wheel, touch, and drag
      onChangeX: (self) => {
        // Determine direction based on event type
        if (self.event.type === "wheel")
          incrX -= self.deltaX;
        else
          incrX += self.deltaX * 2;

        xTo(incrX);
      },
      onChangeY: (self) => {
        if (self.event.type === "wheel")
          incrY -= self.deltaY;
        else
          incrY += self.deltaY * 2;

        yTo(incrY);
      }
    });

    return () => {
      window.removeEventListener('resize', updateDimensions);
      observer.kill();
    };
  }, []);

  // Create array for videos to avoid repetition in code
  const videos = [
    "/mov/1.mov", "/mov/2.mov", "/mov/3.mov", "/mov/4.mp4", "/mov/5.mp4",
    "/mov/6.mp4", "/mov/1.mov", "/mov/2.mov",
    "/mov/3.mov", "/mov/4.mp4", "/mov/5.mp4", "/mov/6.mp4",
  ];

  return (
    <main>
      <section>
        <div className="corner-element title">
          <div className="switch">
            <TransitionLink href="/" className="btn-2D">LIFE</TransitionLink>
            <TransitionLink href="/3D" className="btn-3D">PORTFOLIO</TransitionLink>
          </div>
          <TransitionLink href="/about">FUMILIFE</TransitionLink>
        </div>

        <div className="corner-element sns">
          <ul className="sns-list">
            <li><a href="https://www.instagram.com/ryo_taro.__" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="https://www.youtube.com/@ryo_taro_07" target="_blank" rel="noopener noreferrer">Youtube</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">X</a></li>
          </ul>
        </div>

        <div className="corner-element info">
          <span className="year">2026</span>
          <div className="concept">
            <div>concept</div>
            <div>description</div>
          </div>
        </div>
      </section>

      <section className="infinite-scroll-container">
        <div className="container">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="content" aria-hidden={i > 0}>
              {videos.map((src, idx) => (
                <div key={idx} className="media">
                  <video src={src} autoPlay loop muted playsInline />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
