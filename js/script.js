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
  const memoriesContent = document.querySelector(".memories .section__content");
  if (memoriesRow && memoriesContent) {
    let isDown = false;
    let startX;
    let currentX = 0;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;
    let rafId = null;
    const maxScroll = memoriesRow.scrollWidth - memoriesContent.clientWidth;

    memoriesRow.addEventListener("mousedown", (e) => {
      isDown = true;
      memoriesRow.classList.add("is-dragging");
      startX = e.pageX - currentX;
      lastX = e.pageX;
      lastTime = performance.now();
      velocity = 0;
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
      
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDown) {
        isDown = false;
        memoriesRow.classList.remove("is-dragging");
        document.body.style.userSelect = "";
        document.body.style.webkitUserSelect = "";
        startMomentum();
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      
      const x = e.pageX;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime > 0) {
        const deltaX = x - lastX;
        velocity = deltaX / deltaTime;
      }
      
      currentX = x - startX;
      
      // Clamp to bounds
      const clampedX = Math.max(-maxScroll, Math.min(0, currentX));
      memoriesRow.style.transform = `translateX(${clampedX}px)`;
      
      lastX = x;
      lastTime = currentTime;
    });

    function startMomentum() {
      if (Math.abs(velocity) < 0.01) return;
      
      function momentumLoop() {
        if (isDown) return;
        
        currentX += velocity * 16;
        const clampedX = Math.max(-maxScroll, Math.min(0, currentX));
        memoriesRow.style.transform = `translateX(${clampedX}px)`;
        
        // Stop at bounds
        if (clampedX === 0 || clampedX === -maxScroll) {
          velocity = 0;
          return;
        }
        
        velocity *= 0.96;
        
        if (Math.abs(velocity) > 0.01) {
          rafId = requestAnimationFrame(momentumLoop);
        }
      }
      
      rafId = requestAnimationFrame(momentumLoop);
    }
  }
})();