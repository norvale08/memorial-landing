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
      once: false, // Changed to false to allow replay
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

    // Hero entrance animation function
    const heroText = [
      ".hero__eyebrow",
      ".hero__name",
      ".hero__dates",
      ".hero__tagline",
    ];
    
    function playHeroAnimation() {
      // Reset to initial state with subtle scale/position only (no opacity)
      gsap.set(".hero__media", { scale: 1.03, y: 8 });
      heroText.forEach(el => {
        gsap.set(el, { opacity: 0, y: 24 });
      });
      
      // Create and play refined animation
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.to(".hero__media", { scale: 1, y: 0, duration: 2.5 })
        .to(heroText, { opacity: 1, y: 0, duration: 1.2, stagger: 0.16 }, "-=2");
    }
    
    // Play on initial load
    playHeroAnimation();
    
    // Replay when scrolling back to hero
    ScrollTrigger.create({
      trigger: ".hero",
      start: "top center",
      onEnterBack: playHeroAnimation
    });

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