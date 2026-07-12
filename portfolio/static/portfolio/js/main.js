(() => {
    "use strict";

    const doc = document;
    const body = doc.body;
    const stage = doc.querySelector(".scroll-stage");
    const panels = Array.from(doc.querySelectorAll(".panel"));
    const railLinks = Array.from(doc.querySelectorAll(".rail-dot"));
    const navLinks = Array.from(doc.querySelectorAll(".desktop-nav a"));
    const preloader = doc.getElementById("preloader");
    const loaderBar = doc.getElementById("loaderBar");
    const loaderPercent = doc.getElementById("loaderPercent");
    const wipe = doc.querySelector(".page-wipe");
    const currentSection = doc.getElementById("currentSection");
    const totalSections = doc.getElementById("totalSections");
    const sceneName = doc.getElementById("sceneName");
    const sceneChapter = doc.getElementById("sceneChapter");
    const statusProgress = doc.getElementById("statusProgress");
    const projectDialog = doc.getElementById("projectDialog");
    const commandDialog = doc.getElementById("commandDialog");
    const commandButton = doc.getElementById("commandButton");
    const focusToggle = doc.getElementById("focusToggle");
    const cursor = doc.querySelector(".cursor-dot");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let activeIndex = 0;
    let isAnimating = false;
    let wheelAccumulator = 0;
    let wheelResetTimer = null;
    let scrollTimer = null;

    if (totalSections) totalSections.textContent = String(panels.length).padStart(2, "0");

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    function completePreloader() {
        if (!preloader) return;
        let progress = 0;
        const started = performance.now();
        const duration = reduceMotion ? 120 : 950;

        const tick = (now) => {
            const elapsed = now - started;
            const eased = 1 - Math.pow(1 - clamp(elapsed / duration, 0, 1), 3);
            progress = Math.round(eased * 100);
            if (loaderBar) loaderBar.style.width = `${progress}%`;
            if (loaderPercent) loaderPercent.textContent = `${progress}%`;
            if (progress < 100) {
                requestAnimationFrame(tick);
            } else {
                window.setTimeout(() => {
                    preloader.classList.add("is-hidden");
                    body.classList.remove("is-scroll-locked");
                    panels[activeIndex]?.classList.add("is-active");
                }, reduceMotion ? 0 : 180);
            }
        };
        body.classList.add("is-scroll-locked");
        requestAnimationFrame(tick);
    }

    function setActive(index, options = {}) {
        const nextIndex = clamp(index, 0, panels.length - 1);
        if (!panels[nextIndex]) return;

        const previousIndex = activeIndex;
        activeIndex = nextIndex;
        body.dataset.scene = String(nextIndex);

        panels.forEach((panel, panelIndex) => {
            panel.classList.toggle("is-active", panelIndex === nextIndex);
            panel.classList.toggle("is-before", panelIndex < nextIndex);
            panel.classList.toggle("is-after", panelIndex > nextIndex);
            panel.classList.toggle("is-leaving", panelIndex === previousIndex && previousIndex !== nextIndex);
        });

        window.setTimeout(() => panels[previousIndex]?.classList.remove("is-leaving"), 760);

        railLinks.forEach((link, linkIndex) => link.classList.toggle("is-active", linkIndex === nextIndex));
        navLinks.forEach((link) => link.classList.toggle("is-active", link.hash === `#${panels[nextIndex].id}`));

        const panel = panels[nextIndex];
        if (currentSection) currentSection.textContent = String(nextIndex + 1).padStart(2, "0");
        if (sceneName) sceneName.textContent = panel.dataset.sceneName || panel.id;
        if (sceneChapter) sceneChapter.textContent = panel.dataset.chapter || `Section ${String(nextIndex + 1).padStart(2, "0")}`;
        if (statusProgress) statusProgress.style.width = `${((nextIndex + 1) / panels.length) * 100}%`;

        if (options.updateHash && history.replaceState) {
            history.replaceState(null, "", `#${panel.id}`);
        }
    }

    function triggerWipe() {
        if (!wipe || reduceMotion) return;
        wipe.classList.remove("is-active");
        void wipe.offsetWidth;
        wipe.classList.add("is-active");
        window.setTimeout(() => wipe.classList.remove("is-active"), 900);
    }

    function goToSection(index, options = {}) {
        const nextIndex = clamp(index, 0, panels.length - 1);
        if (!panels[nextIndex] || nextIndex === activeIndex && !options.force) return;
        if (isAnimating && !options.force) return;

        isAnimating = true;
        triggerWipe();
        setActive(nextIndex, { updateHash: true });
        panels[nextIndex].scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        window.setTimeout(() => { isAnimating = false; }, reduceMotion ? 80 : 820);
    }

    function updateSceneProgress() {
        if (!stage || !panels.length) return;
        const panel = panels[activeIndex];
        const relative = (stage.scrollTop - panel.offsetTop) / Math.max(panel.offsetHeight, 1);
        const progress = clamp(relative + 0.5, 0, 1);
        doc.documentElement.style.setProperty("--scene-progress", progress.toFixed(4));
    }

    function findNearestPanel() {
        if (!stage) return 0;
        const target = stage.scrollTop + stage.clientHeight * 0.48;
        let nearest = 0;
        let distance = Infinity;
        panels.forEach((panel, index) => {
            const center = panel.offsetTop + panel.offsetHeight * 0.5;
            const nextDistance = Math.abs(center - target);
            if (nextDistance < distance) {
                distance = nextDistance;
                nearest = index;
            }
        });
        return nearest;
    }

    function handleStageScroll() {
        updateSceneProgress();
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(() => {
            const nearest = findNearestPanel();
            if (nearest !== activeIndex) setActive(nearest, { updateHash: true });
        }, 80);
    }

    function isScrollableElement(target, direction) {
        let element = target instanceof Element ? target : null;
        while (element && element !== stage && element !== body) {
            const style = getComputedStyle(element);
            const canScroll = /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 2;
            if (canScroll) {
                if (direction > 0 && element.scrollTop + element.clientHeight < element.scrollHeight - 2) return true;
                if (direction < 0 && element.scrollTop > 2) return true;
            }
            element = element.parentElement;
        }
        return false;
    }

    function handleWheel(event) {
        if (window.innerWidth <= 980 || reduceMotion || projectDialog?.open || commandDialog?.open) return;
        const direction = Math.sign(event.deltaY);
        if (!direction || isScrollableElement(event.target, direction)) return;

        event.preventDefault();
        wheelAccumulator += event.deltaY;
        window.clearTimeout(wheelResetTimer);
        wheelResetTimer = window.setTimeout(() => { wheelAccumulator = 0; }, 150);

        if (Math.abs(wheelAccumulator) < 42 || isAnimating) return;
        const next = activeIndex + (wheelAccumulator > 0 ? 1 : -1);
        wheelAccumulator = 0;
        if (next >= 0 && next < panels.length) goToSection(next);
    }

    function handleKeydown(event) {
        if (projectDialog?.open || commandDialog?.open) return;
        const tag = event.target?.tagName?.toLowerCase();
        if (["input", "textarea", "select"].includes(tag)) return;

        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            openCommandDialog();
            return;
        }

        const forward = ["ArrowDown", "PageDown", " "];
        const backward = ["ArrowUp", "PageUp"];
        if (forward.includes(event.key)) {
            event.preventDefault();
            goToSection(activeIndex + 1);
        } else if (backward.includes(event.key)) {
            event.preventDefault();
            goToSection(activeIndex - 1);
        } else if (event.key === "Home") {
            event.preventDefault();
            goToSection(0);
        } else if (event.key === "End") {
            event.preventDefault();
            goToSection(panels.length - 1);
        }
    }

    function bindNavigation() {
        doc.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener("click", (event) => {
                const id = link.getAttribute("href")?.slice(1);
                const index = panels.findIndex((panel) => panel.id === id);
                if (index < 0) return;
                event.preventDefault();
                if (commandDialog?.open) commandDialog.close();
                goToSection(index, { force: true });
            });
        });
    }

    function setupObserver() {
        if (!("IntersectionObserver" in window)) return;
        const observer = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (!visible) return;
            const index = panels.indexOf(visible.target);
            if (index >= 0 && visible.intersectionRatio > 0.48 && index !== activeIndex) setActive(index, { updateHash: true });
        }, { root: stage, threshold: [0.25, 0.48, 0.62, 0.8] });
        panels.forEach((panel) => observer.observe(panel));
    }

    function setupProjectDialog() {
        if (!projectDialog) return;
        const closeButton = projectDialog.querySelector(".dialog-close");
        doc.querySelectorAll(".project-open").forEach((button) => {
            button.addEventListener("click", () => {
                const slug = button.dataset.project;
                projectDialog.querySelectorAll(".dialog-project").forEach((item) => {
                    item.classList.toggle("is-active", item.dataset.dialogProject === slug);
                });
                projectDialog.showModal();
                body.classList.add("is-scroll-locked");
            });
        });
        closeButton?.addEventListener("click", () => projectDialog.close());
        projectDialog.addEventListener("click", (event) => {
            if (event.target === projectDialog) projectDialog.close();
        });
        projectDialog.addEventListener("close", () => body.classList.remove("is-scroll-locked"));
    }

    function openCommandDialog() {
        if (!commandDialog || commandDialog.open) return;
        commandDialog.showModal();
        body.classList.add("is-scroll-locked");
    }

    function setupCommandDialog() {
        if (!commandDialog) return;
        commandButton?.addEventListener("click", openCommandDialog);
        commandDialog.querySelector(".command-head button")?.addEventListener("click", () => commandDialog.close());
        commandDialog.addEventListener("click", (event) => {
            if (event.target === commandDialog) commandDialog.close();
        });
        commandDialog.addEventListener("close", () => body.classList.remove("is-scroll-locked"));
    }

    function setupReadingFocus() {
        if (!focusToggle) return;
        const saved = localStorage.getItem("portfolio-reading-focus") === "true";
        if (saved) {
            body.classList.add("reading-focus");
            focusToggle.setAttribute("aria-pressed", "true");
        }
        focusToggle.addEventListener("click", () => {
            const enabled = body.classList.toggle("reading-focus");
            focusToggle.setAttribute("aria-pressed", String(enabled));
            localStorage.setItem("portfolio-reading-focus", String(enabled));
        });
    }

    function setupPointerEffects() {
        if (!cursor || window.matchMedia("(pointer: coarse)").matches || reduceMotion) return;
        let cursorX = window.innerWidth / 2;
        let cursorY = window.innerHeight / 2;
        let renderX = cursorX;
        let renderY = cursorY;

        window.addEventListener("pointermove", (event) => {
            cursorX = event.clientX;
            cursorY = event.clientY;
            const normalizedX = (event.clientX / window.innerWidth - 0.5) * 2;
            const normalizedY = (event.clientY / window.innerHeight - 0.5) * 2;
            doc.documentElement.style.setProperty("--mouse-x", normalizedX.toFixed(3));
            doc.documentElement.style.setProperty("--mouse-y", normalizedY.toFixed(3));
        });

        const render = () => {
            renderX += (cursorX - renderX) * 0.18;
            renderY += (cursorY - renderY) * 0.18;
            cursor.style.left = `${renderX}px`;
            cursor.style.top = `${renderY}px`;
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);

        doc.querySelectorAll("a, button, .skill-card, .project-card, .achievement-card").forEach((element) => {
            element.addEventListener("pointerenter", () => cursor.classList.add("is-hovering"));
            element.addEventListener("pointerleave", () => cursor.classList.remove("is-hovering"));
        });

        doc.querySelectorAll(".magnetic").forEach((element) => {
            element.addEventListener("pointermove", (event) => {
                const rect = element.getBoundingClientRect();
                const x = event.clientX - rect.left - rect.width / 2;
                const y = event.clientY - rect.top - rect.height / 2;
                element.style.transform = `translate(${x * 0.11}px, ${y * 0.11}px)`;
            });
            element.addEventListener("pointerleave", () => { element.style.transform = ""; });
        });
    }

    function setupInitialSection() {
        const hash = window.location.hash.slice(1);
        const index = panels.findIndex((panel) => panel.id === hash);
        activeIndex = index >= 0 ? index : 0;
        setActive(activeIndex);
        window.requestAnimationFrame(() => {
            if (index > 0) panels[index].scrollIntoView({ behavior: "auto", block: "start" });
            updateSceneProgress();
        });
    }

    function init() {
        setupInitialSection();
        completePreloader();
        bindNavigation();
        setupObserver();
        setupProjectDialog();
        setupCommandDialog();
        setupReadingFocus();
        setupPointerEffects();

        stage?.addEventListener("scroll", handleStageScroll, { passive: true });
        stage?.addEventListener("wheel", handleWheel, { passive: false });
        window.addEventListener("keydown", handleKeydown);
        window.addEventListener("resize", updateSceneProgress, { passive: true });
        window.addEventListener("hashchange", () => {
            const index = panels.findIndex((panel) => panel.id === window.location.hash.slice(1));
            if (index >= 0 && index !== activeIndex) goToSection(index, { force: true });
        });
    }

    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init, { once: true });
    else init();
})();
