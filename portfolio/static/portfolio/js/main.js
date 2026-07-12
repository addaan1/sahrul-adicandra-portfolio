(() => {
    "use strict";

    const body = document.body;
    const stage = document.querySelector(".scroll-stage");
    const panels = [...document.querySelectorAll(".panel")];
    const railDots = [...document.querySelectorAll(".rail-dot")];
    const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
    const currentLabel = document.getElementById("currentSection");
    const totalLabel = document.getElementById("totalSections");
    const sceneChapter = document.getElementById("sceneChapter");
    const sceneName = document.getElementById("sceneName");
    const hudProgress = document.getElementById("hudProgress");
    const railProgress = document.getElementById("railProgress");
    const mobileProgress = document.getElementById("mobileProgress");
    const transitionIris = document.querySelector(".transition-iris");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDesktop = () => window.innerWidth > 900;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const ease = (t) => 1 - Math.pow(1 - t, 4);

    let activeIndex = 0;
    let travelling = false;
    let wheelAccumulator = 0;
    let wheelResetTimer = 0;
    let wheelLockUntil = 0;
    let scrollAnimation = 0;

    if (totalLabel) totalLabel.textContent = String(panels.length).padStart(2, "0");

    function setActiveSection(index, source = "observer") {
        const next = clamp(index, 0, panels.length - 1);
        if (next === activeIndex && source !== "init") return;
        activeIndex = next;
        const progress = panels.length > 1 ? activeIndex / (panels.length - 1) : 1;
        const panel = panels[activeIndex];

        body.dataset.scene = String(activeIndex);
        panels.forEach((item, itemIndex) => item.classList.toggle("is-visible", itemIndex === activeIndex));
        railDots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === activeIndex));
        navLinks.forEach((link) => {
            const panelIndex = panels.findIndex((item) => `#${item.id}` === link.getAttribute("href"));
            link.classList.toggle("is-active", panelIndex === activeIndex);
        });

        if (currentLabel) currentLabel.textContent = String(activeIndex + 1).padStart(2, "0");
        if (sceneChapter) sceneChapter.textContent = panel?.dataset.chapter || `Section ${String(activeIndex + 1).padStart(2, "0")}`;
        if (sceneName) sceneName.textContent = panel?.dataset.sceneName || "Portfolio";
        if (hudProgress) hudProgress.style.width = `${((activeIndex + 1) / panels.length) * 100}%`;
        if (railProgress) railProgress.style.height = `${progress * 100}%`;

        if (panel?.id === "journey") {
            const routeTrain = document.getElementById("routeTrain");
            if (routeTrain) routeTrain.style.left = "100%";
        }

        window.dispatchEvent(new CustomEvent("portfolio:scenechange", { detail: { index: activeIndex } }));
        if (source === "navigation" && history.replaceState) history.replaceState(null, "", `#${panel.id}`);
    }

    function animateStageTo(index) {
        const next = clamp(index, 0, panels.length - 1);
        if (!stage || !panels[next] || travelling || next === activeIndex) return;

        cancelAnimationFrame(scrollAnimation);
        travelling = true;
        body.classList.add("is-travelling");
        transitionIris?.classList.add("is-travelling");

        const start = stage.scrollTop;
        const target = panels[next].offsetTop;
        const distance = target - start;
        const duration = reduceMotion ? 1 : clamp(680 + Math.abs(next - activeIndex) * 75, 680, 960);
        const started = performance.now();
        setActiveSection(next, "navigation");

        const frame = (now) => {
            const t = clamp((now - started) / duration, 0, 1);
            stage.scrollTop = start + distance * ease(t);
            if (t < 1) {
                scrollAnimation = requestAnimationFrame(frame);
                return;
            }
            stage.scrollTop = target;
            window.setTimeout(() => {
                travelling = false;
                body.classList.remove("is-travelling");
                transitionIris?.classList.remove("is-travelling");
            }, reduceMotion ? 0 : 100);
        };
        scrollAnimation = requestAnimationFrame(frame);
    }

    function scrollToHash(hash) {
        const index = panels.findIndex((panel) => `#${panel.id}` === hash);
        if (index < 0) return;
        if (isDesktop()) animateStageTo(index);
        else panels[index].scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const hash = link.getAttribute("href");
            if (!hash || hash === "#" || !document.querySelector(hash)) return;
            event.preventDefault();
            scrollToHash(hash);
        });
    });

    stage?.addEventListener("wheel", (event) => {
        if (!isDesktop() || body.classList.contains("modal-open") || event.target.closest("dialog, input, textarea")) return;
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

        const now = performance.now();
        if (travelling || now < wheelLockUntil) {
            event.preventDefault();
            return;
        }

        const normalized = event.deltaMode === 1 ? event.deltaY * 18 : event.deltaY;
        wheelAccumulator += clamp(normalized, -120, 120);
        window.clearTimeout(wheelResetTimer);
        wheelResetTimer = window.setTimeout(() => { wheelAccumulator = 0; }, 220);
        if (Math.abs(wheelAccumulator) < 78) return;

        const direction = wheelAccumulator > 0 ? 1 : -1;
        const next = activeIndex + direction;
        wheelAccumulator = 0;
        if (next < 0 || next >= panels.length) return;

        event.preventDefault();
        wheelLockUntil = now + 900;
        animateStageTo(next);
    }, { passive: false });

    document.addEventListener("keydown", (event) => {
        if (body.classList.contains("modal-open") || event.target.matches("input, textarea, select")) return;
        if (["ArrowDown", "PageDown", " "].includes(event.key)) {
            event.preventDefault();
            isDesktop() ? animateStageTo(activeIndex + 1) : panels[activeIndex + 1]?.scrollIntoView({ behavior: "smooth" });
        } else if (["ArrowUp", "PageUp"].includes(event.key)) {
            event.preventDefault();
            isDesktop() ? animateStageTo(activeIndex - 1) : panels[activeIndex - 1]?.scrollIntoView({ behavior: "smooth" });
        } else if (event.key === "Home") {
            event.preventDefault();
            scrollToHash("#home");
        } else if (event.key === "End") {
            event.preventDefault();
            scrollToHash("#contact");
        }
    });

    const observer = new IntersectionObserver((entries) => {
        if (travelling && isDesktop()) return;
        const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(panels.indexOf(visible.target), "observer");
    }, { root: isDesktop() ? stage : null, threshold: [0.32, 0.56, 0.72] });
    panels.forEach((panel) => observer.observe(panel));

    const initialIndex = panels.findIndex((panel) => `#${panel.id}` === window.location.hash);
    setActiveSection(initialIndex >= 0 ? initialIndex : 0, "init");
    if (initialIndex >= 0 && stage && isDesktop()) stage.scrollTop = panels[initialIndex].offsetTop;

    function updateMobileProgress() {
        if (isDesktop() || !mobileProgress) return;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        mobileProgress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
    }
    window.addEventListener("scroll", updateMobileProgress, { passive: true });

    // Loader handoff.
    const preloader = document.getElementById("preloader");
    const loaderPercent = document.getElementById("loaderPercent");
    const loaderBar = document.getElementById("loaderBar");
    let loaderValue = 0;
    const updateLoader = (value) => {
        loaderValue = Math.max(loaderValue, Math.round(value));
        if (loaderPercent) loaderPercent.textContent = `${loaderValue}%`;
        if (loaderBar) loaderBar.style.width = `${loaderValue}%`;
    };
    window.addEventListener("portfolio:world-progress", (event) => updateLoader(event.detail.value));
    const hideLoader = () => {
        updateLoader(100);
        window.setTimeout(() => preloader?.classList.add("is-hidden"), 260);
        window.setTimeout(() => preloader?.remove(), 1300);
    };
    window.addEventListener("portfolio:world-ready", hideLoader, { once: true });
    if (window.__PORTFOLIO_WORLD_READY__) hideLoader();
    window.setTimeout(hideLoader, 2400);

    // Custom cursor.
    const cursor = document.querySelector(".cursor-orb");
    if (cursor && window.matchMedia("(pointer:fine)").matches) {
        let x = innerWidth / 2, y = innerHeight / 2, targetX = x, targetY = y;
        window.addEventListener("pointermove", (event) => {
            targetX = event.clientX;
            targetY = event.clientY;
            cursor.classList.add("is-visible");
        }, { passive: true });
        const tick = () => {
            x += (targetX - x) * .2;
            y += (targetY - y) * .2;
            cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    // Magnetic motion is deliberately subtle to keep the interface professional.
    if (!reduceMotion && window.matchMedia("(pointer:fine)").matches) {
        document.querySelectorAll(".magnetic").forEach((element) => {
            element.addEventListener("pointermove", (event) => {
                const rect = element.getBoundingClientRect();
                const x = (event.clientX - rect.left - rect.width / 2) * .08;
                const y = (event.clientY - rect.top - rect.height / 2) * .08;
                element.style.transform = `translate(${x}px, ${y}px)`;
            });
            element.addEventListener("pointerleave", () => { element.style.transform = ""; });
        });

        document.querySelectorAll(".tilt-card").forEach((card) => {
            card.addEventListener("pointermove", (event) => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - .5;
                const y = (event.clientY - rect.top) / rect.height - .5;
                card.style.transform = `perspective(1100px) rotateY(${x * 3.5}deg) rotateX(${-y * 3}deg)`;
            });
            card.addEventListener("pointerleave", () => { card.style.transform = ""; });
        });
    }

    // Reading focus.
    const focusToggle = document.getElementById("focusToggle");
    const readingToast = document.getElementById("readingToast");
    let savedFocus = false;
    try { savedFocus = localStorage.getItem("portfolio-reading-focus") === "true"; } catch (error) { savedFocus = false; }
    if (savedFocus) {
        body.classList.add("reading-focus");
        focusToggle?.setAttribute("aria-pressed", "true");
    }
    focusToggle?.addEventListener("click", () => {
        const enabled = body.classList.toggle("reading-focus");
        focusToggle.setAttribute("aria-pressed", String(enabled));
        try { localStorage.setItem("portfolio-reading-focus", String(enabled)); } catch (error) { /* Storage may be blocked. */ }
        if (readingToast) {
            readingToast.textContent = enabled ? "Reading focus enabled" : "Reading focus disabled";
            readingToast.classList.add("is-visible");
            window.setTimeout(() => readingToast.classList.remove("is-visible"), 1500);
        }
    });

    // Project details.
    const projectModal = document.getElementById("projectModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalEyebrow = document.getElementById("modalEyebrow");
    const modalDetail = document.getElementById("modalDetail");
    const modalImpact = document.getElementById("modalImpact");
    const modalMetric = document.getElementById("modalMetric");
    const modalLink = document.getElementById("modalLink");

    function closeDialog(dialog) {
        if (dialog?.open) dialog.close();
        body.classList.remove("modal-open");
        window.PortfolioWorld?.pause(false);
    }

    document.querySelectorAll("[data-project-open]").forEach((button) => {
        button.addEventListener("click", () => {
            if (!projectModal) return;
            modalTitle.textContent = button.dataset.title || "Project";
            modalEyebrow.textContent = button.dataset.eyebrow || "Selected Project";
            modalDetail.textContent = button.dataset.detail || "";
            modalImpact.textContent = button.dataset.impact || "";
            modalMetric.textContent = button.dataset.metric || "";
            modalLink.href = button.dataset.url || "#";
            body.classList.add("modal-open");
            window.PortfolioWorld?.pause(true);
            projectModal.showModal();
        });
    });
    document.querySelector("[data-modal-close]")?.addEventListener("click", () => closeDialog(projectModal));
    projectModal?.addEventListener("click", (event) => {
        if (event.target === projectModal) closeDialog(projectModal);
    });
    projectModal?.addEventListener("close", () => closeDialog(projectModal));

    // Command palette.
    const commandButton = document.getElementById("commandButton");
    const commandPalette = document.getElementById("commandPalette");
    const commandInput = document.getElementById("commandInput");
    const commandItems = commandPalette ? [...commandPalette.querySelectorAll(".command-list > *")] : [];
    let commandSelection = 0;

    function visibleCommandItems() {
        return commandItems.filter((item) => item.style.display !== "none");
    }
    function updateCommandSelection(index) {
        const visible = visibleCommandItems();
        if (!visible.length) return;
        commandSelection = (index + visible.length) % visible.length;
        commandItems.forEach((item) => item.classList.remove("is-selected"));
        visible[commandSelection].classList.add("is-selected");
        visible[commandSelection].scrollIntoView({ block: "nearest" });
    }
    function openCommands() {
        if (!commandPalette?.open) {
            body.classList.add("modal-open");
            window.PortfolioWorld?.pause(true);
            commandPalette.showModal();
            commandInput.value = "";
            commandItems.forEach((item) => { item.style.display = ""; });
            updateCommandSelection(0);
            window.setTimeout(() => commandInput.focus(), 30);
        }
    }
    function closeCommands() {
        if (commandPalette?.open) commandPalette.close();
        body.classList.remove("modal-open");
        window.PortfolioWorld?.pause(false);
    }
    commandButton?.addEventListener("click", openCommands);
    document.addEventListener("keydown", (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            commandPalette?.open ? closeCommands() : openCommands();
        }
        if (!commandPalette?.open) return;
        if (event.key === "Escape") closeCommands();
        if (event.key === "ArrowDown") { event.preventDefault(); updateCommandSelection(commandSelection + 1); }
        if (event.key === "ArrowUp") { event.preventDefault(); updateCommandSelection(commandSelection - 1); }
        if (event.key === "Enter" && document.activeElement === commandInput) {
            event.preventDefault();
            visibleCommandItems()[commandSelection]?.click();
        }
    });
    commandInput?.addEventListener("input", () => {
        const query = commandInput.value.trim().toLowerCase();
        commandItems.forEach((item) => {
            item.style.display = item.textContent.toLowerCase().includes(query) ? "" : "none";
        });
        updateCommandSelection(0);
    });
    commandItems.forEach((item) => {
        item.addEventListener("click", () => {
            const target = item.dataset.commandTarget;
            closeCommands();
            if (target) window.setTimeout(() => scrollToHash(target), 40);
        });
    });
    commandPalette?.addEventListener("click", (event) => {
        if (event.target === commandPalette) closeCommands();
    });
    commandPalette?.addEventListener("close", () => {
        body.classList.remove("modal-open");
        window.PortfolioWorld?.pause(false);
    });

    window.addEventListener("resize", () => {
        if (isDesktop()) setActiveSection(activeIndex, "resize");
        else updateMobileProgress();
    }, { passive: true });
})();
