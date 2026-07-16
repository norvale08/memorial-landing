/* ===== Memorial Landing Page Scripts =====
 * Author: Memorial Site Team
 * Description: Animations and interactivity for memorial landing page
 * Version: 1.0.0
 * Dependencies: GSAP (animations), AOS (scroll reveal)
 * 
 * Features:
 * - Hero entrance animation using GSAP
 * - Scroll reveal animations using AOS
 * - Natural drag-scroll for memories section with momentum
 * - Accessibility: Reduced motion support
 */

/* Memorial landing — animations & interactivity */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- AOS: scroll reveal ---- */
  if (window.AOS) {
    AOS.init({
      duration: 900,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
      disable: prefersReduced,
    });
  }

  if (prefersReduced) return;

  /* ---- GSAP: hero intro ---- */
  if (window.gsap) {
    const gsap = window.gsap;
    
    // Register ScrollTrigger plugin
    if (gsap.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Hero entrance timeline
    const heroText = [
      ".hero__eyebrow",
      ".hero__name",
      ".hero__dates",
      ".hero__tagline",
    ];
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".hero__media", { autoAlpha: 0, scale: 1.05, duration: 1.6 })
      .from(heroText, { autoAlpha: 0, y: 24, duration: 1, stagger: 0.14 }, "-=1.1");

    // Parallax effect for hero background
    const heroBg = document.querySelector(".hero__bg");
    if (heroBg) {
      gsap.to(heroBg, {
        y: "20%",
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }
  }

  /* ---- Natural slider for memories ---- */
  const memoriesRow = document.querySelector(".memories__row");
  if (memoriesRow) {
    let isDown = false;
    let startX;
    let scrollLeft;
    let velocity = 0;
    let animationId = null;

    memoriesRow.addEventListener("mousedown", (e) => {
      isDown = true;
      memoriesRow.classList.add("is-dragging");
      startX = e.pageX - memoriesRow.offsetLeft;
      scrollLeft = memoriesRow.scrollLeft;
      velocity = 0;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    });

    memoriesRow.addEventListener("mouseleave", () => {
      isDown = false;
      memoriesRow.classList.remove("is-dragging");
      applyMomentum();
    });

    memoriesRow.addEventListener("mouseup", () => {
      isDown = false;
      memoriesRow.classList.remove("is-dragging");
      applyMomentum();
    });

    memoriesRow.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - memoriesRow.offsetLeft;
      const walk = (x - startX) * 1.5;
      const newScrollLeft = scrollLeft - walk;
      velocity = newScrollLeft - memoriesRow.scrollLeft;
      memoriesRow.scrollLeft = newScrollLeft;
    });

    // Touch support
    let touchStartX = 0;
    let touchScrollLeft = 0;

    memoriesRow.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].pageX;
      touchScrollLeft = memoriesRow.scrollLeft;
    }, { passive: true });

    memoriesRow.addEventListener("touchmove", (e) => {
      const touchX = e.touches[0].pageX;
      const walk = (touchX - touchStartX) * 1.5;
      memoriesRow.scrollLeft = touchScrollLeft - walk;
    }, { passive: true });

    function applyMomentum() {
      if (Math.abs(velocity) < 0.5) return;
      
      function step() {
        memoriesRow.scrollLeft += velocity;
        velocity *= 0.95;
        
        if (Math.abs(velocity) > 0.5) {
          animationId = requestAnimationFrame(step);
        }
      }
      
      animationId = requestAnimationFrame(step);
    }
  }
})();