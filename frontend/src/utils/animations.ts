import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const fadeInUp = (element: HTMLElement | null, delay = 0) => {
    if (!element) return;
    gsap.fromTo(element,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, delay, ease: 'power3.out' }
    );
};

export const staggerFadeIn = (selector: string, container: HTMLElement | null) => {
    if (!container) return;
    gsap.fromTo(
        container.querySelectorAll(selector),
        { y: 30, opacity: 0, scale: 0.96 },
        {
            y: 0, opacity: 1, scale: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out'
        }
    );
};

export const scrollReveal = (element: HTMLElement | null, delay = 0) => {
    if (!element) return;
    gsap.set(element, { y: 50, opacity: 0 });
    ScrollTrigger.create({
        trigger: element,
        start: 'top 88%',
        onEnter: () => {
            gsap.to(element, {
                y: 0, opacity: 1,
                duration: 0.7, delay,
                ease: 'power3.out'
            });
        },
        once: true,
    });
};

export const counterAnimation = (
    element: HTMLElement | null,
    endValue: number,
    duration = 1.5,
    delay = 0
) => {
    if (!element) return;
    const obj = { val: 0 };
    gsap.to(obj, {
        val: endValue,
        duration,
        delay,
        ease: 'power2.out',
        onUpdate: () => {
            element.textContent = Math.round(obj.val).toLocaleString();
        }
    });
};