(() => {
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector(".menu-button");
  const navigation = document.getElementById("site-nav");
  const revealItems = [...document.querySelectorAll(".reveal")];
  const navigationLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
  const sections = navigationLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollProgress = document.querySelector("[data-scroll-progress]");
  const timeline = document.querySelector("[data-timeline]");
  const projectImages = [...document.querySelectorAll(".project-media img")];
  const projectCards = [...document.querySelectorAll("[data-project]")];

  let scrollFrame = 0;

  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

  const updateScrollEffects = () => {
    header?.classList.toggle("scrolled", window.scrollY > 18);

    const scrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    scrollProgress?.style.setProperty("--page-progress", String(window.scrollY / scrollRange));

    if (reduceMotion) {
      timeline?.style.setProperty("--timeline-progress", "1");
    } else {
      projectImages.forEach((image) => {
        const frame = image.closest(".project-media");
        if (!frame) return;

        const bounds = frame.getBoundingClientRect();
        if (bounds.bottom < -100 || bounds.top > window.innerHeight + 100) return;

        const frameCenter = bounds.top + bounds.height / 2;
        const distanceFromCenter = window.innerHeight / 2 - frameCenter;
        const shift = clamp((distanceFromCenter / window.innerHeight) * 18, -9, 9);
        image.style.setProperty("--media-shift", `${shift.toFixed(2)}px`);
      });

      const viewportAnchor = window.innerHeight * 0.48;
      const activeProject = projectCards
        .map((project) => {
          const bounds = project.getBoundingClientRect();
          return {
            project,
            visible: bounds.bottom > 80 && bounds.top < window.innerHeight - 80,
            distance: Math.abs(bounds.top + bounds.height / 2 - viewportAnchor)
          };
        })
        .filter((candidate) => candidate.visible)
        .sort((a, b) => a.distance - b.distance)[0];

      if (activeProject?.project.dataset.project) {
        document.documentElement.dataset.activeProject = activeProject.project.dataset.project;
      }

      if (timeline) {
        const bounds = timeline.getBoundingClientRect();
        const startLine = window.innerHeight * 0.78;
        const endLine = window.innerHeight * 0.3;
        const travel = startLine - bounds.top;
        const distance = bounds.height + startLine - endLine;
        timeline.style.setProperty("--timeline-progress", String(clamp(travel / distance, 0, 1)));
      }
    }

    scrollFrame = 0;
  };

  const scheduleScrollEffects = () => {
    if (!scrollFrame) {
      scrollFrame = window.requestAnimationFrame(updateScrollEffects);
    }
  };

  window.addEventListener(
    "scroll",
    scheduleScrollEffects,
    { passive: true }
  );
  window.addEventListener("resize", scheduleScrollEffects, { passive: true });
  window.addEventListener("load", scheduleScrollEffects, { once: true });

  updateScrollEffects();

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

  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".project-media").forEach((media) => {
      media.addEventListener("pointermove", (event) => {
        const bounds = media.getBoundingClientRect();
        const x = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
        const y = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
        media.style.setProperty("--tilt-x", `${((0.5 - y) * 1.6).toFixed(2)}deg`);
        media.style.setProperty("--tilt-y", `${((x - 0.5) * 1.8).toFixed(2)}deg`);
      });

      media.addEventListener("pointerleave", () => {
        media.style.setProperty("--tilt-x", "0deg");
        media.style.setProperty("--tilt-y", "0deg");
      });
    });
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
  const mapReadout = document.querySelector(".map-readout");
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
      if (!reduceMotion && mapReadout) {
        mapReadout.classList.remove("is-updating");
        window.requestAnimationFrame(() => mapReadout.classList.add("is-updating"));
      }
    });
  });
})();
