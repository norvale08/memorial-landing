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
    let autoPlayId = null;
    let autoPlayRafId = null;
    let isAutoPlaying = true;
    const cardWidth = memoriesRow.querySelector(".memory")?.offsetWidth + 24 || 394; // card width + gap
    const totalCards = memoriesRow.querySelectorAll(".memory").length;
    // Calculate maxScroll so the last card's left edge reaches the viewport's left edge
    // This is: total width of all cards except the last one
    const maxScroll = (totalCards - 1) * cardWidth;
    let currentIndex = 0;

    memoriesRow.addEventListener("mousedown", (e) => {
      isDown = true;
      memoriesRow.classList.add("is-dragging");
      startX = e.pageX - currentX;
      lastX = e.pageX;
      lastTime = performance.now();
      velocity = 0;
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
      
      // Pause auto-play on user interaction
      isAutoPlaying = false;
      if (autoPlayId) {
        clearTimeout(autoPlayId);
        autoPlayId = null;
      }
      if (autoPlayRafId) {
        cancelAnimationFrame(autoPlayRafId);
        autoPlayRafId = null;
      }
      
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
        
        // Don't snap to card boundaries - keep exact position
        // Resume auto-play after 5 seconds of inactivity
        autoPlayId = setTimeout(() => {
          isAutoPlaying = true;
          startCardAutoPlay();
        }, 5000);
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
      
      // IMPORTANT: Update currentX to match the actual clamped value
      currentX = clampedX;
      
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
        
        // IMPORTANT: Update currentX to match the actual clamped value
        currentX = clampedX;
        
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

    // Card-by-card auto-play with pauses for reading
    function startCardAutoPlay() {
      if (!isAutoPlaying) return;
      
      // Kill any existing GSAP tweens to prevent conflicts
      gsap.killTweensOf(memoriesRow);
      
      // Pause for reading (4 seconds) from current position
      autoPlayId = setTimeout(() => {
        if (!isAutoPlaying) return;
        
        // Read the ACTUAL current position from the DOM - this is the absolute truth
        const computedStyle = window.getComputedStyle(memoriesRow);
        const transform = computedStyle.transform;
        let actualCurrentX = 0;
        
        if (transform && transform !== 'none') {
          const matrix = transform.match(/matrix\(([^)]+)\)/);
          if (matrix) {
            const values = matrix[1].split(',').map(parseFloat);
            actualCurrentX = values[4] || 0;
          }
        }
        
        // Calculate target position - move left by one card width
        let targetX = actualCurrentX - cardWidth;
        
        // If this move would reach or pass the end, snap to exactly -maxScroll
        if (targetX <= -maxScroll) {
          targetX = -maxScroll;
        }
        
        // Update currentX to match the DOM value
        currentX = actualCurrentX;
        
        // Use requestAnimationFrame for smooth animation without GSAP conflicts
        const startTime = performance.now();
        const duration = 2500; // 2.5 seconds
        
        function animateCard(currentTime) {
          if (!isAutoPlaying || isDown) return;
          
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function (power3.inOut equivalent)
          const ease = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          
          const newX = actualCurrentX + (targetX - actualCurrentX) * ease;
          currentX = newX;
          memoriesRow.style.transform = `translateX(${newX}px)`;
          
          if (progress < 1) {
            autoPlayRafId = requestAnimationFrame(animateCard);
          } else {
            currentX = targetX;
            
            // If we've reached the end (last card at left edge), animate back to start
            if (targetX === -maxScroll) {
              // Quick return animation to first card
              const returnStartTime = performance.now();
              const returnDuration = 1000; // 1 second for quick return
              const returnStartX = -maxScroll;
              
              function animateReturn(currentTime) {
                if (!isAutoPlaying || isDown) return;
                
                const elapsed = currentTime - returnStartTime;
                const progress = Math.min(elapsed / returnDuration, 1);
                
                // Easing function (power2.out for quick return)
                const ease = 1 - Math.pow(1 - progress, 2);
                
                const newX = returnStartX + (0 - returnStartX) * ease;
                currentX = newX;
                memoriesRow.style.transform = `translateX(${newX}px)`;
                
                if (progress < 1) {
                  autoPlayRafId = requestAnimationFrame(animateReturn);
                } else {
                  currentX = 0;
                  // Start the normal sliding cycle again
                  startCardAutoPlay();
                }
              }
              
              autoPlayRafId = requestAnimationFrame(animateReturn);
            } else {
              startCardAutoPlay();
            }
          }
        }
        
        autoPlayRafId = requestAnimationFrame(animateCard);
      }, 4000);
    }

    // Start auto-play after initial load
    setTimeout(() => {
      if (isAutoPlaying) {
        // Sync currentX with actual transform before starting
        const currentTransform = memoriesRow.style.transform;
        if (currentTransform) {
          const currentTranslateX = parseFloat(currentTransform.replace('translateX(', '').replace('px)', ''));
          if (!isNaN(currentTranslateX)) {
            currentX = currentTranslateX;
          }
        }
        startCardAutoPlay();
      }
    }, 2000);
  }
})();