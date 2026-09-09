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
