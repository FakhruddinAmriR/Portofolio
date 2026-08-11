// Scroll reveal for sections
const revealEls = document.querySelectorAll(".reveal");

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

revealEls.forEach((el) => io.observe(el));

// Project carousel — infinite loop version
const track = document.getElementById("carouselTrack");

if (track) {
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");

  // Grab the real cards first, before we add any clones
  const originalCards = Array.from(track.querySelectorAll(".project-card"));

  // Clone the first card and put a copy at the very end,
  // clone the last card and put a copy at the very start.
  // This guarantees there's always a "neighbor" card to peek at
  // on both the left and right side, no matter where you are.
  const firstClone = originalCards[0].cloneNode(true);
  const lastClone = originalCards[originalCards.length - 1].cloneNode(true);

  [firstClone, lastClone].forEach((clone) => {
    clone.setAttribute("aria-hidden", "true");
    clone.tabIndex = -1;
  });

  track.appendChild(firstClone);
  track.insertBefore(lastClone, originalCards[0]);

  // Full list now: [lastClone, card1, card2, ..., cardN, firstClone]
  const cards = Array.from(track.querySelectorAll(".project-card"));
  const lastRealIndex = cards.length - 2; // index of the real last card
  let currentIndex = 1; // start on the real first card
  let isDragging = false;
  let startX = 0;

  function frameOffset(index) {
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return -(index * (cardWidth + gap));
  }

  function setActiveClasses() {
    cards.forEach((card, i) => card.classList.toggle("is-active", i === currentIndex));
  }

  function goTo(index, instant) {
    currentIndex = index;
    track.style.transition = instant ? "none" : "";
    track.style.transform = `translateX(${frameOffset(currentIndex)}px)`;
    setActiveClasses();
  }

  // After a real (animated) slide finishes, silently snap from a clone
  // back to the matching real card — this is what makes it feel infinite.
  track.addEventListener("transitionend", () => {
    if (currentIndex === 0) {
      goTo(lastRealIndex, true);
    } else if (currentIndex === cards.length - 1) {
      goTo(1, true);
    }
  });

  prevBtn.addEventListener("click", () => goTo(currentIndex - 1, false));
  nextBtn.addEventListener("click", () => goTo(currentIndex + 1, false));

  // drag / swipe support
  track.addEventListener("pointerdown", (e) => {
    isDragging = true;
    startX = e.clientX;
    track.style.transition = "none";
  });

  track.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    track.style.transform = `translateX(${frameOffset(currentIndex) + dx}px)`;
  });

  function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    const dx = e.clientX - startX;
    const wasDragged = Math.abs(dx) > 10;
    cards[currentIndex].dataset.dragged = wasDragged ? "true" : "false";

    if (dx > 60) goTo(currentIndex - 1, false);
    else if (dx < -60) goTo(currentIndex + 1, false);
    else goTo(currentIndex, false);
  }

  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointerleave", () => {
    if (isDragging) endDrag({ clientX: startX });
  });

  window.addEventListener("resize", () => goTo(currentIndex, true));
  goTo(currentIndex, true); // position correctly on load, no animation

  // Prevent navigation when the click was actually the end of a drag/swipe
  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (card.dataset.dragged === "true") {
        e.preventDefault();
      }
    });
  });
}

// Screenshot gallery lightbox (project detail pages)
const galleryItems = document.querySelectorAll(".gallery-item");

if (galleryItems.length) {
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML = `
    <div class="lightbox-overlay"></div>
    <div class="lightbox-img-wrap">
      <button class="lightbox-close" aria-label="Tutup">×</button>
      <img src="" alt="" />
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector("img");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const overlay = lightbox.querySelector(".lightbox-overlay");

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      openLightbox(img.src, img.alt);
    });
  });

  closeBtn.addEventListener("click", closeLightbox);
  overlay.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}
