"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { usePathname } from "next/navigation";

export default function PageTransition() {
    const overlayRef = useRef(null);
    const pathname = usePathname();

    useEffect(() => {
        // Run enter animation when path changes
        if (overlayRef.current) {
            gsap.to(overlayRef.current, {
                opacity: 0,
                duration: 0.5,
                ease: "power2.inOut",
                onComplete: () => {
                    overlayRef.current.style.visibility = 'hidden';
                }
            });
        }
    }, [pathname]);

    return (
        <div id="transition-overlay" ref={overlayRef} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'black',
            zIndex: 9999,
            pointerEvents: 'none',
            opacity: 0, // Start hidden, JS will manage
            visibility: 'hidden'
        }} />
    );
}

// Helper to check standard anchor clicks manually if needed, or use custom link
// Custom link is preferred.
