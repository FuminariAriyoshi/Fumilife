"use client";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Cursor() {
    const cursorRef = useRef(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        gsap.set(cursor, { xPercent: -50, yPercent: -50 });

        const onMouseMove = (e) => {
            if (!cursorRef.current) return;
            gsap.to(cursorRef.current, { duration: 0.2, x: e.clientX, y: e.clientY, ease: "power2.out" });
        };

        window.addEventListener('mousemove', onMouseMove, true);

        return () => {
            window.removeEventListener('mousemove', onMouseMove, true);
            gsap.killTweensOf(cursorRef.current);
        };
    }, []);

    return <div ref={cursorRef} className="custom-cursor"></div>;
}
