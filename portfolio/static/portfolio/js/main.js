(() => {
    "use strict";

    const stage = document.querySelector(".scroll-stage");
    const panels = [...document.querySelectorAll(".panel")];
    const dots = [...document.querySelectorAll(".rail-dot")];
    const currentLabel = document.getElementById("currentSection");
    const totalLabel = document.getElementById("totalSections");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let activeIndex = 0;
    let wheelLocked = false;

    if (totalLabel) totalLabel.textContent = String(panels.length).padStart(2, "0");

    const activateSection = (index) => {
        activeIndex = Math.max(0, Math.min(index, panels.length - 1));
        panels.forEach((panel, panelIndex) => panel.classList.toggle("is-visible", panelIndex === activeIndex));
        dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === activeIndex));
        if (currentLabel) currentLabel.textContent = String(activeIndex + 1).padStart(2, "0");
    };

    const observer = new IntersectionObserver(
        (entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (!visible) return;
            activateSection(panels.indexOf(visible.target));
        },
        { root: window.innerWidth > 900 ? stage : null, threshold: [0.32, 0.55, 0.72] }
    );

    panels.forEach((panel) => observer.observe(panel));
    if (panels.length) panels[0].classList.add("is-visible");

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const target = document.querySelector(link.getAttribute("href"));
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        });
    });

    const scrollToPanel = (index) => {
        const nextIndex = Math.max(0, Math.min(index, panels.length - 1));
        if (nextIndex === activeIndex) return;
        wheelLocked = true;
        panels[nextIndex].scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        window.setTimeout(() => {
            activateSection(nextIndex);
            wheelLocked = false;
        }, reduceMotion ? 50 : 780);
    };

    if (stage && window.innerWidth > 900 && !reduceMotion) {
        stage.addEventListener(
            "wheel",
            (event) => {
                if (wheelLocked || Math.abs(event.deltaY) < 18 || document.body.classList.contains("modal-open")) return;
                const interactive = event.target.closest("input, textarea, select, [contenteditable='true']");
                if (interactive) return;
                const direction = event.deltaY > 0 ? 1 : -1;
                const next = activeIndex + direction;
                if (next < 0 || next >= panels.length) return;
                event.preventDefault();
                scrollToPanel(next);
            },
            { passive: false }
        );
    }

    document.addEventListener("keydown", (event) => {
        if (document.body.classList.contains("modal-open")) return;
        if (event.target.matches("input, textarea")) return;
        if (["ArrowDown", "PageDown"].includes(event.key)) {
            event.preventDefault();
            scrollToPanel(activeIndex + 1);
        }
        if (["ArrowUp", "PageUp"].includes(event.key)) {
            event.preventDefault();
            scrollToPanel(activeIndex - 1);
        }
        if (event.key === "Home") scrollToPanel(0);
        if (event.key === "End") scrollToPanel(panels.length - 1);
    });

    const cursorGlow = document.querySelector(".cursor-glow");
    if (cursorGlow && window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener("pointermove", (event) => {
            cursorGlow.style.left = `${event.clientX}px`;
            cursorGlow.style.top = `${event.clientY}px`;
        });
    }

    const heroWorld = document.querySelector(".hero-world");
    const parallaxLayers = [...document.querySelectorAll(".parallax-layer")];
    if (heroWorld && parallaxLayers.length && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
        heroWorld.addEventListener("pointermove", (event) => {
            const rect = heroWorld.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            parallaxLayers.forEach((layer) => {
                const depth = Number(layer.dataset.depth || 0.2);
                layer.style.translate = `${x * depth * 42}px ${y * depth * 42}px`;
            });
        });
        heroWorld.addEventListener("pointerleave", () => {
            parallaxLayers.forEach((layer) => (layer.style.translate = "0 0"));
        });
    }

    const track = document.querySelector("[data-project-track]");
    const prevButton = document.querySelector("[data-project-prev]");
    const nextButton = document.querySelector("[data-project-next]");
    const cardStep = () => Math.min(track?.clientWidth * 0.78 || 420, 520);
    prevButton?.addEventListener("click", () => track?.scrollBy({ left: -cardStep(), behavior: "smooth" }));
    nextButton?.addEventListener("click", () => track?.scrollBy({ left: cardStep(), behavior: "smooth" }));

    if (track) {
        let dragging = false;
        let startX = 0;
        let initialScroll = 0;
        track.addEventListener("pointerdown", (event) => {
            if (event.target.closest("a, button")) return;
            dragging = true;
            startX = event.clientX;
            initialScroll = track.scrollLeft;
            track.setPointerCapture(event.pointerId);
            track.style.cursor = "grabbing";
        });
        track.addEventListener("pointermove", (event) => {
            if (!dragging) return;
            track.scrollLeft = initialScroll - (event.clientX - startX) * 1.15;
        });
        const release = () => {
            dragging = false;
            track.style.cursor = "";
        };
        track.addEventListener("pointerup", release);
        track.addEventListener("pointercancel", release);
    }

    const modal = document.getElementById("projectModal");
    const modalFields = {
        title: document.getElementById("modalTitle"),
        eyebrow: document.getElementById("modalEyebrow"),
        detail: document.getElementById("modalDetail"),
        impact: document.getElementById("modalImpact"),
        metric: document.getElementById("modalMetric"),
        link: document.getElementById("modalLink"),
    };

    document.querySelectorAll("[data-project-open]").forEach((button) => {
        button.addEventListener("click", () => {
            if (!modal) return;
            modalFields.title.textContent = button.dataset.title || "Project";
            modalFields.eyebrow.textContent = button.dataset.eyebrow || "Case study";
            modalFields.detail.textContent = button.dataset.detail || "";
            modalFields.impact.textContent = button.dataset.impact || "";
            modalFields.metric.textContent = button.dataset.metric || "";
            modalFields.link.href = button.dataset.url || "#";
            modal.showModal();
            document.body.classList.add("modal-open");
        });
    });

    const closeModal = () => {
        if (!modal?.open) return;
        modal.close();
        document.body.classList.remove("modal-open");
    };
    document.querySelector("[data-modal-close]")?.addEventListener("click", closeModal);
    modal?.addEventListener("click", (event) => {
        const rect = modal.getBoundingClientRect();
        const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
        if (outside) closeModal();
    });
    modal?.addEventListener("close", () => document.body.classList.remove("modal-open"));
})();
