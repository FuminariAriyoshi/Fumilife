"use client";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Cursor() {
    const cursorRef = useRef(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        // Center the cursor on the mouse position
        gsap.set(cursor, { xPercent: -50, yPercent: -50 });

        const onMouseMove = (e) => {
            gsap.to(cursor, { duration: 0.2, x: e.clientX, y: e.clientY, ease: "power2.out" });
        };

        window.addEventListener('mousemove', onMouseMove);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, []);

    return <div ref={cursorRef} className="custom-cursor"></div>;
}
