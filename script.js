/* BJORN LEE — Interaction layer / V2 */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     GLOBAL
     ========================= */

  const header = document.querySelector("#site-header");
  const year = document.querySelector("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  /* =========================
     REVEAL
     ========================= */

  const revealItems = document.querySelectorAll(
    ".section-intro, .work-card, .impact-item, .experience-row, .profile-photo-wrap, .profile-details, .contact-main, .contact-bottom"
  );

  revealItems.forEach((item) => {
    item.classList.add("reveal");
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    revealItems.forEach((item) => {
      observer.observe(item);
    });
  } else {
    revealItems.forEach((item) => {
      item.classList.add("is-visible");
    });
  }


  /* =========================
     HEADER
     ========================= */

  if (header) {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeader = () => {
      const currentY = window.scrollY;

      if (currentY > 120 && currentY > lastScrollY + 8) {
        header.style.transform = "translateY(-100%)";
      } else if (
        currentY < lastScrollY - 8 ||
        currentY < 80
      ) {
        header.style.transform = "translateY(0)";
      }

      lastScrollY = currentY;
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(updateHeader);
          ticking = true;
        }
      },
      { passive: true }
    );
  }


  /* =========================
     WORK — INFINITE CAROUSEL
     ========================= */

function initWorkCarousel() {
  const viewport = document.querySelector(".work-window");
  const track = document.querySelector(".work-scroll");

  if (!viewport || !track) return;

  const cards = Array.from(
    track.querySelectorAll(".work-card")
  );

  if (cards.length < 2) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const SPEED = 0.03;
  const DRAG_THRESHOLD = 6;

  let loopWidth = 0;
  let isDragging = false;
  let dragMoved = false;
  let startX = 0;
  let startScrollLeft = 0;

  /*
   * =========================
   * CREATE CLONES
   * =========================
   */

  const before = document.createDocumentFragment();
  const after = document.createDocumentFragment();

  cards.forEach((card) => {
    const beforeClone = card.cloneNode(true);
    beforeClone.dataset.clone = "before";
    beforeClone.setAttribute("aria-hidden", "true");
    beforeClone.tabIndex = -1;

    before.appendChild(beforeClone);

    const afterClone = card.cloneNode(true);
    afterClone.dataset.clone = "after";
    afterClone.setAttribute("aria-hidden", "true");
    afterClone.tabIndex = -1;

    after.appendChild(afterClone);
  });

  track.insertBefore(before, cards[0]);
  track.appendChild(after);

  /*
   * =========================
   * ORIGINAL CARDS
   * =========================
   */

  const realCards = Array.from(
    track.querySelectorAll(
      ".work-card:not([data-clone])"
    )
  );

  /*
   * =========================
   * CALCULATE LOOP WIDTH
   * =========================
   */

  const calculateLoopWidth = () => {
    if (realCards.length < 2) return;

    const first = realCards[0];
    const second = realCards[1];

    const step =
      second.offsetLeft -
      first.offsetLeft;

    loopWidth =
      step * realCards.length;
  };

  /*
   * =========================
   * INITIAL POSITION
   * =========================
   */

  const setInitialPosition = () => {
    calculateLoopWidth();

    if (!loopWidth) return;

    viewport.scrollLeft =
      realCards[0].offsetLeft;
  };

  /*
   * =========================
   * INFINITE LOOP
   * =========================
   */

  const checkLoop = () => {
    if (!loopWidth) return;

    const start =
      realCards[0].offsetLeft;

    const current =
      viewport.scrollLeft;

    /*
     * Moved past original cards
     */

    if (
      current >=
      start + loopWidth
    ) {
      viewport.scrollLeft =
        current - loopWidth;

      return;
    }

    /*
     * Moved into left clones
     */

    if (current < start) {
      viewport.scrollLeft =
        current + loopWidth;
    }
  };

  viewport.addEventListener(
    "scroll",
    checkLoop,
    { passive: true }
  );

  /*
   * =========================
   * AUTOPLAY
   * =========================
   */

  let animationFrame = null;
  let lastTime = null;
  let paused = reducedMotion.matches;

  const animate = (time) => {
    if (lastTime === null) {
      lastTime = time;
    }

    const delta =
      time - lastTime;

    lastTime = time;

    if (
      !paused &&
      !reducedMotion.matches &&
      !isDragging
    ) {
      viewport.scrollLeft +=
        delta * SPEED;
    }

    animationFrame =
      requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    if (animationFrame) return;

    lastTime = null;

    animationFrame =
      requestAnimationFrame(animate);
  };

  const pauseAnimation = () => {
    paused = true;
  };

  const resumeAnimation = () => {
    if (!reducedMotion.matches) {
      paused = false;
      lastTime = null;
    }
  };

  viewport.addEventListener(
    "mouseenter",
    pauseAnimation
  );

  viewport.addEventListener(
    "mouseleave",
    resumeAnimation
  );

  /*
   * =========================
   * WHEEL
   * =========================
   */

  viewport.addEventListener(
    "wheel",
    (event) => {
      if (
        Math.abs(event.deltaY) <=
        Math.abs(event.deltaX)
      ) {
        return;
      }

      event.preventDefault();

      pauseAnimation();

      viewport.scrollLeft +=
        event.deltaY;

      checkLoop();

      clearTimeout(
        viewport._wheelTimer
      );

      viewport._wheelTimer =
        setTimeout(() => {
          resumeAnimation();
        }, 250);
    },
    { passive: false }
  );

  /*
   * =========================
   * DRAG / SWIPE
   * =========================
   */

  viewport.style.touchAction =
    "pan-y";

  viewport.addEventListener(
    "pointerdown",
    (event) => {
      if (
        event.pointerType === "mouse" &&
        event.button !== 0
      ) {
        return;
      }

      isDragging = true;
      dragMoved = false;

      startX =
        event.clientX;

      startScrollLeft =
        viewport.scrollLeft;

      pauseAnimation();

      viewport.classList.add(
        "is-dragging"
      );

      viewport.setPointerCapture(
        event.pointerId
      );
    }
  );

  viewport.addEventListener(
    "pointermove",
    (event) => {
      if (!isDragging) return;

      const distance =
        event.clientX -
        startX;

      if (
        Math.abs(distance) >
        DRAG_THRESHOLD
      ) {
        dragMoved = true;
      }

      viewport.scrollLeft =
        startScrollLeft -
        distance;

      checkLoop();
    }
  );

  const endDrag = (event) => {
    if (!isDragging) return;

    isDragging = false;

    viewport.classList.remove(
      "is-dragging"
    );

    if (
      event &&
      viewport.hasPointerCapture(
        event.pointerId
      )
    ) {
      viewport.releasePointerCapture(
        event.pointerId
      );
    }

    checkLoop();

    resumeAnimation();

    if (dragMoved) {
      viewport.dataset.dragged =
        "true";

      setTimeout(() => {
        delete viewport.dataset.dragged;
      }, 0);
    }
  };

  viewport.addEventListener(
    "pointerup",
    endDrag
  );

  viewport.addEventListener(
    "pointercancel",
    endDrag
  );

  /*
   * =========================
   * PREVENT CLICK AFTER DRAG
   * =========================
   */

  viewport.addEventListener(
    "click",
    (event) => {
      if (
        viewport.dataset.dragged ===
        "true"
      ) {
        event.preventDefault();
        event.stopPropagation();

        delete viewport.dataset.dragged;
      }
    },
    true
  );

  /*
   * =========================
   * PREVENT IMAGE DRAG
   * =========================
   */

  track
    .querySelectorAll("img")
    .forEach((img) => {
      img.addEventListener(
        "dragstart",
        (event) => {
          event.preventDefault();
        }
      );
    });

  /*
   * =========================
   * RESIZE
   * =========================
   */

  let resizeTimer = null;

  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);

      resizeTimer =
        setTimeout(() => {
          calculateLoopWidth();
          checkLoop();
        }, 150);
    }
  );

  /*
   * =========================
   * REDUCED MOTION
   * =========================
   */

  const updateMotion = () => {
    if (reducedMotion.matches) {
      pauseAnimation();
    } else {
      resumeAnimation();
    }
  };

  if (
    typeof reducedMotion.addEventListener ===
    "function"
  ) {
    reducedMotion.addEventListener(
      "change",
      updateMotion
    );
  }

  /*
   * =========================
   * START
   * =========================
   */

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setInitialPosition();

      if (!reducedMotion.matches) {
        startAnimation();
      }
initWorkCarousel();
});
}
