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

// Project carousel
const track = document.getElementById("carouselTrack");

if (track) {
  const cards = track.querySelectorAll(".project-card");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");
  let currentIndex = 0;
  let isDragging = false;
  let startX = 0;

  function updateCarousel() {
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const offset = -(currentIndex * (cardWidth + gap));
    track.style.transform = `translateX(${offset}px)`;

    cards.forEach((card, i) => card.classList.toggle("is-active", i === currentIndex));
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === cards.length - 1;
  }

  prevBtn.addEventListener("click", () => {
    currentIndex = Math.max(0, currentIndex - 1);
    updateCarousel();
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = Math.min(cards.length - 1, currentIndex + 1);
    updateCarousel();
  });

  // drag / swipe support
  track.addEventListener("pointerdown", (e) => {
    isDragging = true;
    startX = e.clientX;
    track.style.transition = "none";
  });

  track.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const baseOffset = -(currentIndex * (cardWidth + gap));
    track.style.transform = `translateX(${baseOffset + dx}px)`;
  });

  function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = "";
    const dx = e.clientX - startX;
    const wasDragged = Math.abs(dx) > 10;
    // Mark the card that was in view so its click can be suppressed
    // (prevents an accidental page-navigation right after a drag/swipe)
    cards[currentIndex].dataset.dragged = wasDragged ? "true" : "false";
    if (dx > 60 && currentIndex > 0) currentIndex--;
    else if (dx < -60 && currentIndex < cards.length - 1) currentIndex++;
    updateCarousel();
  }

  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointerleave", () => {
    if (isDragging) endDrag({ clientX: startX });
  });

  window.addEventListener("resize", updateCarousel);
  updateCarousel();

  // Prevent navigation when the click was actually the end of a drag/swipe
  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (card.dataset.dragged === "true") {
        e.preventDefault();
      }
    });
  });
}
