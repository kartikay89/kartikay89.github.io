const carousel = document.querySelector("[data-project-carousel]");
const dotsContainer = document.querySelector("[data-carousel-dots]");
const previousButton = document.querySelector("[data-carousel-prev]");
const nextButton = document.querySelector("[data-carousel-next]");

if (carousel && dotsContainer && previousButton && nextButton) {
  const cards = Array.from(carousel.querySelectorAll(".project-card"));
  const dots = cards.map((_, index) => {
    const dot = document.createElement("button");
    dot.className = "carousel-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to project ${index + 1}`);
    dot.addEventListener("click", () => scrollToCard(index));
    dotsContainer.appendChild(dot);
    return dot;
  });

  let activeIndex = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartScrollLeft = 0;

  const scrollToCard = (index) => {
    const safeIndex = Math.max(0, Math.min(index, cards.length - 1));
    cards[safeIndex].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };

  const updateActiveState = () => {
    const carouselLeft = carousel.getBoundingClientRect().left;
    const closestIndex = cards.reduce((closest, card, index) => {
      const distance = Math.abs(card.getBoundingClientRect().left - carouselLeft);
      return distance < closest.distance ? { index, distance } : closest;
    }, { index: 0, distance: Number.POSITIVE_INFINITY }).index;

    activeIndex = closestIndex;
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === activeIndex);
      dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
    });
  };

  previousButton.addEventListener("click", () => scrollToCard(activeIndex - 1));
  nextButton.addEventListener("click", () => scrollToCard(activeIndex + 1));
  carousel.addEventListener("scroll", () => window.requestAnimationFrame(updateActiveState));
  carousel.addEventListener("pointerdown", (event) => {
    isDragging = true;
    dragStartX = event.clientX;
    dragStartScrollLeft = carousel.scrollLeft;
    carousel.classList.add("is-dragging");
    carousel.setPointerCapture(event.pointerId);
  });

  carousel.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }

    const dragDistance = event.clientX - dragStartX;
    carousel.scrollLeft = dragStartScrollLeft - dragDistance;
  });

  carousel.addEventListener("pointerup", (event) => {
    isDragging = false;
    carousel.classList.remove("is-dragging");
    carousel.releasePointerCapture(event.pointerId);
  });

  carousel.addEventListener("pointercancel", () => {
    isDragging = false;
    carousel.classList.remove("is-dragging");
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollToCard(activeIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollToCard(activeIndex + 1);
    }
  });

  updateActiveState();
}
