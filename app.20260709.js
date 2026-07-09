(() => {
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector(".menu-button");
  const navigation = document.getElementById("site-nav");
  const revealItems = [...document.querySelectorAll(".reveal")];
  const navigationLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
  const sections = navigationLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  let scrollFrame = 0;

  const updateHeader = () => {
    header?.classList.toggle("scrolled", window.scrollY > 18);
    scrollFrame = 0;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollFrame) {
        scrollFrame = window.requestAnimationFrame(updateHeader);
      }
    },
    { passive: true }
  );

  updateHeader();

  const setMenu = (open) => {
    if (!menuButton || !navigation) return;

    menuButton.setAttribute("aria-expanded", String(open));
    navigation.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    const label = menuButton.querySelector(".sr-only");
    if (label) label.textContent = open ? "Close navigation" : "Open navigation";
  };

  menuButton?.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });

  navigation?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        navigationLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
        });
      },
      { threshold: [0.18, 0.34, 0.52], rootMargin: "-15% 0px -55% 0px" }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  const mapDescriptions = {
    reef: {
      label: "AgentReef",
      copy: "Routes work between agents and keeps the evidence attached."
    },
    memory: {
      label: "Signed memory",
      copy: "Keeps shared context durable, searchable, and tied to its author."
    },
    skills: {
      label: "Skills",
      copy: "Lets peers call scoped capabilities instead of sharing unrestricted access."
    },
    arena: {
      label: "Arena",
      copy: "Runs a live bot environment where authors can observe behavior and iterate."
    },
    operator: {
      label: "Human owner",
      copy: "Owns the permission boundary and the decisions that still need judgment."
    }
  };

  const mapNodes = [...document.querySelectorAll("[data-map-node]")];
  const readoutLabel = document.querySelector("[data-readout-label]");
  const readoutCopy = document.querySelector("[data-readout-copy]");

  mapNodes.forEach((node) => {
    node.addEventListener("click", () => {
      const detail = mapDescriptions[node.dataset.mapNode];
      if (!detail) return;

      mapNodes.forEach((candidate) => candidate.setAttribute("aria-pressed", "false"));
      node.setAttribute("aria-pressed", "true");
      if (readoutLabel) readoutLabel.textContent = detail.label;
      if (readoutCopy) readoutCopy.textContent = detail.copy;
    });
  });
})();
