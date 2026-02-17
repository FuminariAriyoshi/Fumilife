"use client";

import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

export const animatePageOut = (href, router) => {
    const overlay = document.getElementById("transition-overlay");
    if (overlay) {
        overlay.style.visibility = 'visible';
        gsap.to(overlay, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => {
                router.push(href);
            }
        });
    }
};

export default function TransitionLink({ href, children, ...props }) {
    const router = useRouter();
    const pathname = usePathname();

    const handleClick = (e) => {
        // Only run transition if simple click and not same path
        if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && href !== pathname) {
            e.preventDefault();
            animatePageOut(href, router);
        }
    };

    return (
        <a href={href} onClick={handleClick} {...props}>
            {children}
        </a>
    );
}
