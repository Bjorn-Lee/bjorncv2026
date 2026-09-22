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

  const originalCards = Array.from(
    track.querySelectorAll(".work-card")
  );

  if (originalCards.length < 2) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const AUTOPLAY_SPEED = 0.03;
  const DRAG_THRESHOLD = 6;

  let loopWidth = 0;
  let isDragging = false;
  let dragMoved = false;
  let startX = 0;
  let startScrollLeft = 0;

  let autoplayFrame = null;
  let lastTimestamp = null;
  let autoplayPaused = reducedMotion.matches;

  /*
   * CREATE CLONES
   * Structure:
   * [clone] 01 02 03 04
   * [real]  01 02 03 04
   * [clone] 01 02 03 04
   */

  const beforeFragment =
    document.createDocumentFragment();

  const afterFragment =
    document.createDocumentFragment();

  originalCards.forEach((card) => {
    const beforeClone = card.cloneNode(true);

    beforeClone.dataset.clone = "before";
    beforeClone.setAttribute(
      "aria-hidden",
      "true"
    );
    beforeClone.tabIndex = -1;

    beforeFragment.appendChild(
      beforeClone
    );

    const afterClone = card.cloneNode(true);

    afterClone.dataset.clone = "after";
    afterClone.setAttribute(
      "aria-hidden",
      "true"
    );
    afterClone.tabIndex = -1;

    afterFragment.appendChild(
      afterClone
    );
  });

  track.insertBefore(
    beforeFragment,
    originalCards[0]
  );

  track.appendChild(afterFragment);

  /*
   * REAL CARDS
   */

  const realCards = Array.from(
    track.querySelectorAll(
      ".work-card:not([data-clone])"
    )
  );

  /*
   * CALCULATE ONE COMPLETE CARD SET
   */

  const calculateLoopWidth = () => {
    if (realCards.length < 2) return;

    const firstCard =
      realCards[0];

    const secondCard =
      realCards[1];

    const cardStep =
      secondCard.offsetLeft -
      firstCard.offsetLeft;

    loopWidth =
      cardStep * realCards.length;
  };

  /*
   * PUT VIEWPORT AT ORIGINAL 01
   */

  const setInitialPosition = () => {
    calculateLoopWidth();

    if (!loopWidth) return;

    viewport.scrollLeft =
      realCards[0].offsetLeft;
  };

  /*
   * INFINITE LOOP
   */
const handleLoop = () => {
  if (!loopWidth) return;

  const start =
    realCards[0].offsetLeft;

  const current =
    viewport.scrollLeft;

  const maxScroll =
    viewport.scrollWidth -
    viewport.clientWidth;

  /*
   * Reached the right side
   * → jump back one complete set
   */

  if (
    current >=
    maxScroll - 2
  ) {
    viewport.scrollLeft =
      current - loopWidth;

    return;
  }

  /*
   * Entered the left clone area
   * → jump forward one complete set
   */

  if (
    current < start
  ) {
    viewport.scrollLeft =
      current + loopWidth;
  }
};

  viewport.addEventListener(
    "scroll",
    handleLoop,
    { passive: true }
  );

  /*
   * AUTOPLAY
   */

  const stopAutoplay = () => {
    autoplayPaused = true;
  };

  const resumeAutoplay = () => {
    if (!reducedMotion.matches) {
      autoplayPaused = false;
      lastTimestamp = null;
    }
  };

  const autoplay = (timestamp) => {
    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
    }

    const elapsed =
      timestamp - lastTimestamp;

    lastTimestamp = timestamp;

    if (
      !autoplayPaused &&
      !reducedMotion.matches &&
      !isDragging
    ) {
      viewport.scrollLeft +=
        elapsed * AUTOPLAY_SPEED;
    }

    autoplayFrame =
      requestAnimationFrame(
        autoplay
      );
  };

  const startAutoplay = () => {
    if (autoplayFrame) return;

    lastTimestamp = null;

    autoplayFrame =
      requestAnimationFrame(
        autoplay
      );
  };

  viewport.addEventListener(
    "mouseenter",
    stopAutoplay
  );

  viewport.addEventListener(
    "mouseleave",
    resumeAutoplay
  );

  /*
   * MOUSE WHEEL
   */

  viewport.addEventListener(
    "wheel",
    (event) => {
      const isVerticalWheel =
        Math.abs(event.deltaY) >
        Math.abs(event.deltaX);

      if (!isVerticalWheel) return;

      event.preventDefault();

      stopAutoplay();

      viewport.scrollLeft +=
        event.deltaY;

      window.clearTimeout(
        viewport._wheelResumeTimer
      );

      viewport._wheelResumeTimer =
        window.setTimeout(() => {
          resumeAutoplay();
        }, 250);
    },
    { passive: false }
  );

  /*
   * POINTER DRAG / SWIPE
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

      stopAutoplay();

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
        event.clientX - startX;

      if (
        Math.abs(distance) >
        DRAG_THRESHOLD
      ) {
        dragMoved = true;
      }

      viewport.scrollLeft =
        startScrollLeft -
        distance;
    }
  );

  const stopDragging = (event) => {
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

    handleLoop();

    resumeAutoplay();

    if (dragMoved) {
      viewport.dataset.dragged =
        "true";

      window.setTimeout(() => {
        delete viewport.dataset.dragged;
      }, 0);
    }
  };

  viewport.addEventListener(
    "pointerup",
    stopDragging
  );

  viewport.addEventListener(
    "pointercancel",
    stopDragging
  );

  viewport.addEventListener(
    "lostpointercapture",
    () => {
      if (!isDragging) return;

      isDragging = false;

      viewport.classList.remove(
        "is-dragging"
      );

      handleLoop();

      resumeAutoplay();
    }
  );

  /*
   * PREVENT CLICK AFTER DRAG
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
   * PREVENT IMAGE DRAG
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
   * RESIZE
   */

  let resizeTimer = null;

  window.addEventListener(
    "resize",
    () => {
      window.clearTimeout(
        resizeTimer
      );

      resizeTimer =
        window.setTimeout(() => {
          calculateLoopWidth();
          handleLoop();
        }, 150);
    }
  );

  /*
   * REDUCED MOTION
   */

  const handleMotionPreference =
    () => {
      if (reducedMotion.matches) {
        stopAutoplay();
      } else {
        resumeAutoplay();
      }
    };

  if (
    typeof reducedMotion.addEventListener ===
    "function"
  ) {
    reducedMotion.addEventListener(
      "change",
      handleMotionPreference
    );
  }

  /*
   * INITIALIZE
   */

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setInitialPosition();

      if (
        !reducedMotion.matches
      ) {
        startAutoplay();
      }
    });
  });
}

