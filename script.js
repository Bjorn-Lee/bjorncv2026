/* BJORN LEE — Interaction layer / V1 */

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("#site-header");
  const revealItems = document.querySelectorAll(
    ".section-intro, .capability, .work-card, .impact-item, .experience-row, .capability-line, .process-grid article, .coffee-copy, .profile-photo-wrap, .profile-details, .contact-main, .contact-bottom"
  );

  // Year
  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();

  // Add reveal class
  revealItems.forEach((item) => item.classList.add("reveal"));

  // Intersection Observer
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -50px 0px"
    });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  // Header hides when scrolling down, returns when scrolling up.
  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateHeader = () => {
    const currentY = window.scrollY;
    if (currentY > 120 && currentY > lastScrollY + 8) {
      header.style.transform = "translateY(-100%)";
    } else if (currentY < lastScrollY - 8 || currentY < 80) {
      header.style.transform = "translateY(0)";
    }
    lastScrollY = currentY;
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  // Slight pointer movement for portfolio visuals.
  document.querySelectorAll(".work-card").forEach((card) => {
    const visual = card.querySelector(".work-visual");
    if (!visual) return;

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      visual.style.transform = `translate(${x * 5}px, ${y * 5}px)`;
    });

    card.addEventListener("pointerleave", () => {
      visual.style.transform = "";
    });
  });

  // Keyboard-friendly external links.
  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.addEventListener("click", () => {
      link.blur();
    });
  });
});
/* =========================
   WORK — INFINITE CAROUSEL
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  const rail = document.querySelector(".work-scroll");
  if (!rail) return;
  const originalCards = Array.from(
    rail.querySelectorAll(".work-card")
  );
  if (originalCards.length < 2) return;
  /* =========================
     CREATE CLONES
     ========================= */
  // Clone cards BEFORE the originals
  const prependFragment = document.createDocumentFragment();
  originalCards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.dataset.clone = "before";
    prependFragment.appendChild(clone);
  });
  rail.insertBefore(
    prependFragment,
    originalCards[0]
  );
  // Clone cards AFTER the originals
  const appendFragment = document.createDocumentFragment();
  originalCards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.dataset.clone = "after";
    appendFragment.appendChild(clone);
  });
  rail.appendChild(appendFragment);
  /* =========================
     CALCULATE ORIGINAL WIDTH
     ========================= */
  let loopWidth = 0;
  const calculateLoopWidth = () => {
    const firstOriginal = rail.querySelector(
      '.work-card:not([data-clone])'
    );
    const firstAfterClone = rail.querySelector(
      '.work-card[data-clone="after"]'
    );
    if (!firstOriginal || !firstAfterClone) return;
    loopWidth =
      firstAfterClone.offsetLeft -
      firstOriginal.offsetLeft;
  };
  /* =========================
     INITIAL POSITION
     ========================= */
  const setInitialPosition = () => {
    calculateLoopWidth();
    if (!loopWidth) return;
    const firstOriginal = rail.querySelector(
      '.work-card:not([data-clone])'
    );
    rail.scrollLeft =
      firstOriginal.offsetLeft;
  };
  /*
   * Wait for images/layout to finish
   * before calculating positions.
   */
  window.requestAnimationFrame(() => {
    setInitialPosition();
  });
  window.addEventListener(
    "load",
    setInitialPosition
  );
  /* =========================
     INFINITE LOOP
     ========================= */
  let isRepositioning = false;
  rail.addEventListener(
    "scroll",
    () => {
      if (!loopWidth || isRepositioning) return;
      const firstOriginal = rail.querySelector(
        '.work-card:not([data-clone])'
      );
      if (!firstOriginal) return;
      const start =
        firstOriginal.offsetLeft;
      /*
       * Scrolled too far RIGHT
       */
      if (
        rail.scrollLeft >=
        start + loopWidth
      ) {
        isRepositioning = true;
        rail.scrollLeft -= loopWidth;
        requestAnimationFrame(() => {
          isRepositioning = false;
        });
      }
      /*
       * Scrolled too far LEFT
       */
      else if (
        rail.scrollLeft < start
      ) {
        isRepositioning = true;
        rail.scrollLeft += loopWidth;
        requestAnimationFrame(() => {
          isRepositioning = false;
        });
      }
    },
    { passive: true }
  );
  /* =========================
     MOUSE WHEEL → HORIZONTAL
     ========================= */
  rail.addEventListener(
    "wheel",
    (event) => {
      if (
        Math.abs(event.deltaY) >
        Math.abs(event.deltaX)
      ) {
        event.preventDefault();
        rail.scrollLeft += event.deltaY;
      }
    },
    { passive: false }
  );
  /* =========================
     MOUSE DRAG
     ========================= */
  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  rail.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType === "touch") return;
      isDragging = true;
      startX = event.clientX;
      startScrollLeft = rail.scrollLeft;
      rail.classList.add("is-dragging");
      rail.setPointerCapture(
        event.pointerId
      );
    }
  );
  rail.addEventListener(
    "pointermove",
    (event) => {
      if (!isDragging) return;
      const distance =
        event.clientX - startX;
      rail.scrollLeft =
        startScrollLeft - distance;
    }
  );
  const stopDragging = () => {
    isDragging = false;
    rail.classList.remove(
      "is-dragging"
    );
  };
  rail.addEventListener(
    "pointerup",
    stopDragging
  );
  rail.addEventListener(
    "pointercancel",
    stopDragging
  );
  rail.addEventListener(
    "lostpointercapture",
    stopDragging
  );
  /* =========================
     PREVENT IMAGE DRAG
     ========================= */
  rail.querySelectorAll("img").forEach(img => {
    img.addEventListener(
      "dragstart",
      event => {
        event.preventDefault();
      }
    );

  });

});
