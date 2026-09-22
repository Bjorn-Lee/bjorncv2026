/* BJORN LEE — Interaction layer / V1 */

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("#site-header");
  const revealItems = document.querySelectorAll(
    ".section-intro,  .work-card, .impact-item, .experience-row, .profile-photo-wrap, .profile-details, .contact-main, .contact-bottom"
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
initWorkCarousel();



/* =========================
   WORK — INFINITE CAROUSEL
   ========================= */
function initWorkCarousel() {
  const rail = document.querySelector(".work-window");
  const track = document.querySelector(".work-scroll");

  if (!rail || !track) return;

  const cards = Array.from(track.querySelectorAll(".work-card"));

  if (cards.length < 2) return;

  const beforeFragment = document.createDocumentFragment();
  const afterFragment = document.createDocumentFragment();

  cards.forEach((card) => {
    const beforeClone = card.cloneNode(true);
    beforeClone.dataset.clone = "before";
    beforeClone.setAttribute("aria-hidden", "true");
    beforeClone.tabIndex = -1;
    beforeFragment.appendChild(beforeClone);

    const afterClone = card.cloneNode(true);
    afterClone.dataset.clone = "after";
    afterClone.setAttribute("aria-hidden", "true");
    afterClone.tabIndex = -1;
    afterFragment.appendChild(afterClone);
  });

  track.insertBefore(beforeFragment, cards[0]);
  track.appendChild(afterFragment);

  const realCards = Array.from(
    track.querySelectorAll('.work-card:not([data-clone])')
  );

  let loopWidth = 0;
  let resetting = false;
  
  const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

const autoplaySpeed = 0.03;
let lastTimestamp = null;
let autoplayPaused = false;

const pauseAutoplay = () => {
  autoplayPaused = true;
};

const resumeAutoplay = () => {
  if (!reducedMotion.matches) {
    autoplayPaused = false;
  }
};

const autoplay = (timestamp) => {
  if (lastTimestamp === null) {
    lastTimestamp = timestamp;
  }

  const elapsed = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  if (!autoplayPaused && !reducedMotion.matches) {
    rail.scrollLeft += elapsed * autoplaySpeed;
  }

  requestAnimationFrame(autoplay);
};

  const calculateLoopWidth = () => {
    if (!realCards[0] || !realCards[1]) return;

    const cardStep =
      realCards[1].offsetLeft - realCards[0].offsetLeft;

    loopWidth = cardStep * realCards.length;
  };

  const setInitialPosition = () => {
    calculateLoopWidth();

    if (!loopWidth) return;

    rail.scrollLeft = realCards[0].offsetLeft;
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(setInitialPosition);
  });

  window.addEventListener("load", setInitialPosition);

  window.addEventListener("resize", () => {
    calculateLoopWidth();
  });

  rail.addEventListener("scroll", () => {
    if (!loopWidth || resetting) return;

    const start = realCards[0].offsetLeft;
    const current = rail.scrollLeft;

    if (current >= start + loopWidth) {
      resetting = true;
      rail.scrollLeft = current - loopWidth;

      requestAnimationFrame(() => {
        resetting = false;
      });
    } else if (current < start) {
      resetting = true;
      rail.scrollLeft = current + loopWidth;

      requestAnimationFrame(() => {
        resetting = false;
      });
    }
   }, { passive: true });

  if (!reducedMotion.matches) {
    requestAnimationFrame(autoplay);
  }
}
  /* =========================
     CREATE CLONES
     ========================= */

  /*
   * We create:
   *
   * [clone][clone][clone][clone]
   * [real ][real ][real ][real ]
   * [clone][clone][clone][clone]
   *
   * This gives us room to move
   * in both directions.
   */

  const beforeFragment =
    document.createDocumentFragment();

  const afterFragment =
    document.createDocumentFragment();


cards.forEach((card) => {
  const beforeClone = card.cloneNode(true);
  beforeClone.dataset.clone = "before";
  beforeClone.setAttribute("aria-hidden", "true");
  beforeClone.tabIndex = -1;
  beforeFragment.appendChild(beforeClone);

  const afterClone = card.cloneNode(true);
  afterClone.dataset.clone = "after";
  afterClone.setAttribute("aria-hidden", "true");
  afterClone.tabIndex = -1;
  afterFragment.appendChild(afterClone);
});

  /* =========================
     GET REAL CARDS
     ========================= */

  const realCards =
    Array.from(
      rail.querySelectorAll(
        '.work-card:not([data-clone])'
      )
    );


  /* =========================
     CALCULATE LOOP WIDTH
     ========================= */

  let loopWidth = 0;


  const calculateLoopWidth = () => {

    if (
      !realCards[0] ||
      !realCards[1]
    ) return;


    /*
     * Distance between the first
     * and second real card.
     */

    const cardStep =
      realCards[1].offsetLeft -
      realCards[0].offsetLeft;


    /*
     * 4 cards × card step
     */

    loopWidth =
      cardStep * realCards.length;

  };


  /* =========================
     INITIAL POSITION
     ========================= */

  const setInitialPosition = () => {

    calculateLoopWidth();

    if (!loopWidth) return;


    /*
     * Start at the REAL first card,
     * not the beginning of the clones.
     */

    rail.scrollLeft =
      realCards[0].offsetLeft;

  };


  /*
   * Wait until layout is ready.
   */

  requestAnimationFrame(() => {

    requestAnimationFrame(() => {

      setInitialPosition();

    });

  });


  window.addEventListener(
    "load",
    setInitialPosition
  );


  window.addEventListener(
    "resize",
    () => {

      calculateLoopWidth();

    }
  );


  /* =========================
     INFINITE LOOP
     ========================= */

  let resetting = false;


  rail.addEventListener(
    "scroll",
    () => {

      if (
        !loopWidth ||
        resetting
      ) return;


      const firstReal =
        realCards[0];


      if (!firstReal) return;


      const start =
        firstReal.offsetLeft;


      const current =
        rail.scrollLeft;


      /*
       * TOO FAR RIGHT
       *
       * 01 02 03 04
       *          ↓
       *          01 02 03 04
       */

      if (
        current >=
        start + loopWidth
      ) {

        resetting = true;


        rail.scrollLeft =
          current - loopWidth;


        requestAnimationFrame(() => {

          resetting = false;

        });

      }


      /*
       * TOO FAR LEFT
       *
       * clone 01 02 03 04
       *        ↓
       *        real 01
       */

      else if (
        current <
        start
      ) {

        resetting = true;


        rail.scrollLeft =
          current + loopWidth;


        requestAnimationFrame(() => {

          resetting = false;

        });

      }

    },
    {
      passive: true
    }
  );


  /* =========================
     MOUSE WHEEL
     ========================= */

  rail.addEventListener(
    "wheel",
    event => {

      /*
       * Convert vertical mouse wheel
       * into horizontal movement.
       */

      if (
        Math.abs(event.deltaY) >
        Math.abs(event.deltaX)
      ) {

        event.preventDefault();

        rail.scrollLeft +=
          event.deltaY;

      }

    },
    {
      passive: false
    }
  );


  /* =========================
     MOUSE DRAG
     ========================= */

  let isDragging = false;

  let startX = 0;

  let startScrollLeft = 0;


  rail.addEventListener(
    "pointerdown",
    event => {

      /*
       * Let mobile use native
       * touch scrolling.
       */

      if (
        event.pointerType === "touch"
      ) return;


      isDragging = true;


      startX =
        event.clientX;


      startScrollLeft =
        rail.scrollLeft;


      rail.classList.add(
        "is-dragging"
      );


      rail.setPointerCapture(
        event.pointerId
      );

    }
  );


  rail.addEventListener(
    "pointermove",
    event => {

      if (!isDragging) return;


      const distance =
        event.clientX -
        startX;


      rail.scrollLeft =
        startScrollLeft -
        distance;

    }
  );


  const stopDragging = () => {

    if (!isDragging) return;


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

  rail
    .querySelectorAll("img")
    .forEach(img => {

      img.addEventListener(
        "dragstart",
        event => {

          event.preventDefault();

        }
      );

    });

});
