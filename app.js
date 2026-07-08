const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll("[data-form-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href) {
      return;
    }

    event.preventDefault();

    if (prefersReducedMotion.matches) {
      window.location.href = href;
      return;
    }

    link.classList.remove("animate__backInDown");
    link.classList.add("is-leaving", "animate__bounceOut");

    const redirect = () => {
      window.location.href = href;
    };

    link.addEventListener("animationend", redirect, { once: true });
    window.setTimeout(redirect, 950);
  });
});
