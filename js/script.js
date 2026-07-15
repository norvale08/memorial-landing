/* Memorial landing — animations & interactivity */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Lightbox for gallery ---- */
  const galleryImgs = Array.from(document.querySelectorAll(".gallery__item img"));
  if (galleryImgs.length) {
    const box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML =
      '<button class="lightbox__close" aria-label="Закрыть">&times;</button>' +
      '<img class="lightbox__img" alt="">';
    document.body.appendChild(box);
    const boxImg = box.querySelector(".lightbox__img");
    const closeBtn = box.querySelector(".lightbox__close");

    const open = (src, alt) => {
      boxImg.src = src;
      boxImg.alt = alt || "";
      box.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };
    const close = () => {
      box.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    galleryImgs.forEach((img) => {
      img.parentElement.addEventListener("click", () => open(img.src, img.alt));
    });
    closeBtn.addEventListener("click", close);
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

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

  /* ---- GSAP: hero intro + parallax ---- */
  if (window.gsap) {
    const gsap = window.gsap;

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

    // Subtle parallax via ScrollTrigger
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      document.querySelectorAll("[data-parallax]").forEach((el) => {
        const depth = parseFloat(el.getAttribute("data-parallax")) || 0.1;
        gsap.to(el.querySelector("img") || el, {
          yPercent: depth * 100,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }
  }

  /* ---- Fallback: light native parallax if GSAP is unavailable ---- */
  if (!window.gsap) {
    const layers = document.querySelectorAll("[data-parallax]");
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        layers.forEach((el) => {
          const depth = parseFloat(el.getAttribute("data-parallax")) || 0.2;
          el.style.transform = "translate3d(0," + (y * depth) + "px,0)";
        });
        ticking = false;
      });
    }, { passive: true });
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