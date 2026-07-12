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
    const compassNeedle = document.querySelector(".hud-compass span");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = () => window.innerWidth > 900;
    let activeIndex = 0;
    let travelling = false;
    let wheelAccumulator = 0;
    let wheelResetTimer = 0;
    let wheelLockUntil = 0;
    let scrollAnimation = 0;

    if (totalLabel) totalLabel.textContent = String(panels.length).padStart(2, "0");

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const ease = (t) => 1 - Math.pow(1 - t, 4);

    const setActiveSection = (index, source = "observer") => {
        const next = clamp(index, 0, panels.length - 1);
        if (next === activeIndex && source !== "init") return;
        activeIndex = next;
        const progress = panels.length > 1 ? activeIndex / (panels.length - 1) : 1;
        body.dataset.scene = String(activeIndex);
        panels.forEach((panel, panelIndex) => panel.classList.toggle("is-visible", panelIndex === activeIndex));
        railDots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === activeIndex));
        navLinks.forEach((link) => {
            const panelIndex = panels.findIndex((panel) => `#${panel.id}` === link.getAttribute("href"));
            link.classList.toggle("is-active", panelIndex === activeIndex);
        });
        if (currentLabel) currentLabel.textContent = String(activeIndex + 1).padStart(2, "0");
        if (sceneChapter) sceneChapter.textContent = panels[activeIndex]?.dataset.chapter || `Chapter ${activeIndex + 1}`;
        if (sceneName) sceneName.textContent = panels[activeIndex]?.dataset.sceneName || "Celestial Route";
        if (hudProgress) hudProgress.style.width = `${((activeIndex + 1) / panels.length) * 100}%`;
        if (railProgress) railProgress.style.height = `${progress * 100}%`;
        if (compassNeedle) compassNeedle.style.transform = `translateY(-3px) rotate(${20 + activeIndex * 43}deg)`;
        window.dispatchEvent(new CustomEvent("portfolio:scenechange", { detail: { index: activeIndex } }));
        if (source === "navigation" && history.replaceState) {
            history.replaceState(null, "", `#${panels[activeIndex].id}`);
        }
    };

    const animateStageTo = (index) => {
        const next = clamp(index, 0, panels.length - 1);
        if (!stage || !panels[next] || travelling || next === activeIndex) return;
        cancelAnimationFrame(scrollAnimation);
        travelling = true;
        body.classList.add("is-travelling");
        transitionIris?.classList.add("is-travelling");
        const start = stage.scrollTop;
        const target = panels[next].offsetTop;
        const distance = target - start;
        const duration = reduceMotion ? 1 : clamp(720 + Math.abs(next - activeIndex) * 80, 720, 1050);
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
            }, reduceMotion ? 0 : 120);
        };
        scrollAnimation = requestAnimationFrame(frame);
    };

    const scrollToHash = (hash) => {
        const index = panels.findIndex((panel) => `#${panel.id}` === hash);
        if (index < 0) return;
        if (desktop()) animateStageTo(index);
        else panels[index].scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    };

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const hash = link.getAttribute("href");
            if (!hash || hash === "#") return;
            const target = document.querySelector(hash);
            if (!target) return;
            event.preventDefault();
            scrollToHash(hash);
        });
    });

    if (stage && desktop() && !reduceMotion) {
        stage.addEventListener("wheel", (event) => {
            if (body.classList.contains("modal-open") || event.target.closest("dialog, input, textarea, [data-project-track], .route-map")) return;
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
            if (Math.abs(wheelAccumulator) < 72) return;
            const direction = wheelAccumulator > 0 ? 1 : -1;
            const next = activeIndex + direction;
            wheelAccumulator = 0;
            if (next < 0 || next >= panels.length) return;
            event.preventDefault();
            wheelLockUntil = now + 980;
            animateStageTo(next);
        }, { passive: false });
    }

    document.addEventListener("keydown", (event) => {
        if (body.classList.contains("modal-open") || event.target.matches("input, textarea, select")) return;
        if (["ArrowDown", "PageDown", " "].includes(event.key)) {
            event.preventDefault();
            desktop() ? animateStageTo(activeIndex + 1) : panels[activeIndex + 1]?.scrollIntoView({ behavior: "smooth" });
        } else if (["ArrowUp", "PageUp"].includes(event.key)) {
            event.preventDefault();
            desktop() ? animateStageTo(activeIndex - 1) : panels[activeIndex - 1]?.scrollIntoView({ behavior: "smooth" });
        } else if (event.key === "Home") {
            event.preventDefault();
            scrollToHash("#home");
        } else if (event.key === "End") {
            event.preventDefault();
            scrollToHash("#contact");
        }
    });

    const observer = new IntersectionObserver((entries) => {
        if (travelling && desktop()) return;
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        setActiveSection(panels.indexOf(visible.target), "observer");
    }, { root: desktop() ? stage : null, threshold: [0.34, 0.56, 0.72] });
    panels.forEach((panel) => observer.observe(panel));
    setActiveSection(0, "init");

    const updateMobileProgress = () => {
        if (desktop() || !mobileProgress) return;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        mobileProgress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
    };
    window.addEventListener("scroll", updateMobileProgress, { passive: true });

    // Loader coordinates with the WebGL world engine.
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
        window.setTimeout(() => preloader?.classList.add("is-hidden"), 300);
        window.setTimeout(() => preloader?.remove(), 1500);
    };
    window.addEventListener("portfolio:world-ready", hideLoader, { once: true });
    if (window.__PORTFOLIO_WORLD_READY__) hideLoader();
    window.setTimeout(hideLoader, 2200);

    // Custom cursor and magnetic targets.
    const cursor = document.querySelector(".cursor-orb");
    if (cursor && window.matchMedia("(pointer:fine)").matches) {
        let cursorX = innerWidth / 2, cursorY = innerHeight / 2, targetX = cursorX, targetY = cursorY;
        window.addEventListener("pointermove", (event) => {
            targetX = event.clientX; targetY = event.clientY;
            cursor.classList.add("is-visible");
        }, { passive: true });
        const tickCursor = () => {
            cursorX += (targetX - cursorX) * .18;
            cursorY += (targetY - cursorY) * .18;
            cursor.style.transform = `translate(${cursorX - 21}px, ${cursorY - 21}px)`;
            requestAnimationFrame(tickCursor);
        };
        tickCursor();
        document.querySelectorAll("a, button, input, textarea, .tilt-card").forEach((item) => {
            item.addEventListener("pointerenter", () => cursor.classList.add("is-hovering"));
            item.addEventListener("pointerleave", () => cursor.classList.remove("is-hovering"));
        });

        document.querySelectorAll(".magnetic").forEach((item) => {
            item.addEventListener("pointermove", (event) => {
                const rect = item.getBoundingClientRect();
                const x = event.clientX - rect.left - rect.width / 2;
                const y = event.clientY - rect.top - rect.height / 2;
                item.style.transform = `translate(${x * .12}px, ${y * .12}px)`;
            });
            item.addEventListener("pointerleave", () => { item.style.transform = ""; });
        });
    }

    // Lightweight 3D tilt on interface cards.
    if (!reduceMotion && window.matchMedia("(pointer:fine)").matches) {
        document.querySelectorAll(".tilt-card").forEach((card) => {
            card.addEventListener("pointermove", (event) => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - .5;
                const y = (event.clientY - rect.top) / rect.height - .5;
                card.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 6}deg) translateZ(0)`;
            });
            card.addEventListener("pointerleave", () => { card.style.transform = ""; });
        });
    }

    // Hero text signal scramble.
    const scrambleTarget = document.querySelector("[data-scramble]");
    if (scrambleTarget && !reduceMotion) {
        const finalText = scrambleTarget.dataset.scramble;
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789△◇✦";
        let iteration = 0;
        const finishScramble = () => {
            scrambleTarget.textContent = finalText;
            window.clearInterval(scramble);
        };
        const scramble = window.setInterval(() => {
            scrambleTarget.textContent = finalText.split("").map((letter, index) => {
                if (letter === " ") return " ";
                return index < iteration ? finalText[index] : chars[Math.floor(Math.random() * chars.length)];
            }).join("");
            iteration += .78;
            if (iteration >= finalText.length) finishScramble();
        }, 36);
        window.setTimeout(finishScramble, 1100);
    }

    // Project mission carousel.
    const track = document.querySelector("[data-project-track]");
    const missionCards = [...document.querySelectorAll(".mission-card")];
    const prevButton = document.querySelector("[data-project-prev]");
    const nextButton = document.querySelector("[data-project-next]");
    const projectCurrent = document.getElementById("projectCurrent");
    let missionIndex = 0;
    let dragging = false;
    let dragStart = 0;
    let initialScroll = 0;

    const missionStep = () => missionCards[0] ? missionCards[0].getBoundingClientRect().width + 20 : 600;
    const updateMission = () => {
        if (!track || !missionCards.length) return;
        const center = track.scrollLeft + track.clientWidth * .42;
        let nearest = 0;
        let distance = Infinity;
        missionCards.forEach((card, index) => {
            const cardCenter = card.offsetLeft + card.offsetWidth / 2;
            const delta = Math.abs(cardCenter - center);
            if (delta < distance) { distance = delta; nearest = index; }
        });
        missionIndex = nearest;
        missionCards.forEach((card, index) => card.classList.toggle("is-current", index === nearest));
        if (projectCurrent) projectCurrent.textContent = String(nearest + 1).padStart(2, "0");
    };
    const goToMission = (index) => {
        missionIndex = clamp(index, 0, missionCards.length - 1);
        track?.scrollTo({ left: missionCards[missionIndex]?.offsetLeft || missionIndex * missionStep(), behavior: reduceMotion ? "auto" : "smooth" });
        window.setTimeout(updateMission, 350);
    };
    prevButton?.addEventListener("click", () => goToMission(missionIndex - 1));
    nextButton?.addEventListener("click", () => goToMission(missionIndex + 1));
    track?.addEventListener("scroll", updateMission, { passive: true });
    track?.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") { event.preventDefault(); goToMission(missionIndex + 1); }
        if (event.key === "ArrowLeft") { event.preventDefault(); goToMission(missionIndex - 1); }
    });
    track?.addEventListener("pointerdown", (event) => {
        if (event.target.closest("a,button")) return;
        dragging = true; dragStart = event.clientX; initialScroll = track.scrollLeft;
        track.setPointerCapture(event.pointerId); track.style.cursor = "grabbing";
    });
    track?.addEventListener("pointermove", (event) => {
        if (!dragging) return;
        track.scrollLeft = initialScroll - (event.clientX - dragStart) * 1.15;
    });
    const releaseTrack = () => { dragging = false; if (track) track.style.cursor = "grab"; updateMission(); };
    track?.addEventListener("pointerup", releaseTrack);
    track?.addEventListener("pointercancel", releaseTrack);
    updateMission();

    // Journey train follows the route map's scroll position.
    const routeMap = document.querySelector(".route-map");
    const routeTrain = document.getElementById("routeTrain");
    const updateRouteTrain = () => {
        if (!routeMap || !routeTrain) return;
        const max = routeMap.scrollHeight - routeMap.clientHeight;
        const ratio = max > 0 ? routeMap.scrollTop / max : 0;
        routeTrain.style.top = `${ratio * 92}%`;
    };
    routeMap?.addEventListener("scroll", updateRouteTrain, { passive: true });

    // Project modal.
    const modal = document.getElementById("projectModal");
    const modalFields = {
        title: document.getElementById("modalTitle"), eyebrow: document.getElementById("modalEyebrow"),
        detail: document.getElementById("modalDetail"), impact: document.getElementById("modalImpact"),
        metric: document.getElementById("modalMetric"), link: document.getElementById("modalLink"),
    };
    const openProjectModal = (button) => {
        if (!modal) return;
        modalFields.title.textContent = button.dataset.title || "Mission";
        modalFields.eyebrow.textContent = button.dataset.eyebrow || "Project mission";
        modalFields.detail.textContent = button.dataset.detail || "";
        modalFields.impact.textContent = button.dataset.impact || "";
        modalFields.metric.textContent = button.dataset.metric || "";
        modalFields.link.href = button.dataset.url || "#";
        modal.showModal(); body.classList.add("modal-open"); window.PortfolioWorld?.pause(true);
    };
    document.querySelectorAll("[data-project-open]").forEach((button) => button.addEventListener("click", () => openProjectModal(button)));
    const closeProjectModal = () => {
        if (!modal?.open) return;
        modal.close(); body.classList.remove("modal-open"); window.PortfolioWorld?.pause(false);
    };
    document.querySelector("[data-modal-close]")?.addEventListener("click", closeProjectModal);
    modal?.addEventListener("click", (event) => {
        const rect = modal.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeProjectModal();
    });
    modal?.addEventListener("close", () => { body.classList.remove("modal-open"); window.PortfolioWorld?.pause(false); });

    // Command palette.
    const commandPalette = document.getElementById("commandPalette");
    const commandButton = document.getElementById("commandButton");
    const commandInput = document.getElementById("commandInput");
    const commandItems = [...document.querySelectorAll("#commandList button, #commandList a")];
    let commandIndex = 0;
    const selectCommand = (index) => {
        const visible = commandItems.filter((item) => !item.hidden);
        commandIndex = clamp(index, 0, Math.max(0, visible.length - 1));
        commandItems.forEach((item) => item.classList.remove("is-selected"));
        visible[commandIndex]?.classList.add("is-selected");
        visible[commandIndex]?.scrollIntoView({ block: "nearest" });
    };
    const openCommand = () => {
        if (!commandPalette) return;
        commandPalette.showModal(); body.classList.add("modal-open"); commandInput.value = "";
        commandItems.forEach((item) => { item.hidden = false; });
        selectCommand(0); window.setTimeout(() => commandInput.focus(), 30);
    };
    const closeCommand = () => { if (commandPalette?.open) commandPalette.close(); body.classList.remove("modal-open"); };
    commandButton?.addEventListener("click", openCommand);
    document.addEventListener("keydown", (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); commandPalette?.open ? closeCommand() : openCommand(); }
        if (!commandPalette?.open) return;
        if (event.key === "Escape") { event.preventDefault(); closeCommand(); }
        if (event.key === "ArrowDown") { event.preventDefault(); selectCommand(commandIndex + 1); }
        if (event.key === "ArrowUp") { event.preventDefault(); selectCommand(commandIndex - 1); }
        if (event.key === "Enter" && document.activeElement === commandInput) {
            event.preventDefault(); commandItems.filter((item) => !item.hidden)[commandIndex]?.click();
        }
    });
    commandInput?.addEventListener("input", () => {
        const query = commandInput.value.trim().toLowerCase();
        commandItems.forEach((item) => { item.hidden = !item.textContent.toLowerCase().includes(query); });
        selectCommand(0);
    });
    commandItems.forEach((item) => item.addEventListener("click", () => {
        const target = item.dataset.commandTarget;
        closeCommand(); if (target) window.setTimeout(() => scrollToHash(target), 40);
    }));
    commandPalette?.addEventListener("click", (event) => {
        const rect = commandPalette.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeCommand();
    });
    commandPalette?.addEventListener("close", () => body.classList.remove("modal-open"));

    // Reading focus: dims the world while preserving the portfolio layout.
    const focusToggle = document.getElementById("focusToggle");
    const readingToast = document.getElementById("readingToast");
    let toastTimer = 0;
    const applyFocusMode = (enabled, announce = false) => {
        body.classList.toggle("focus-mode", enabled);
        focusToggle?.setAttribute("aria-pressed", String(enabled));
        focusToggle?.setAttribute("aria-label", enabled ? "Disable reading focus" : "Enable reading focus");
        try { localStorage.setItem("portfolio-reading-focus", enabled ? "1" : "0"); } catch (_) {}
        if (announce && readingToast) {
            readingToast.textContent = enabled ? "Reading focus enabled" : "Cinematic balance restored";
            readingToast.classList.add("is-visible");
            window.clearTimeout(toastTimer);
            toastTimer = window.setTimeout(() => readingToast.classList.remove("is-visible"), 1800);
        }
    };
    let savedFocus = false;
    try { savedFocus = localStorage.getItem("portfolio-reading-focus") === "1"; } catch (_) {}
    applyFocusMode(savedFocus);
    focusToggle?.addEventListener("click", () => applyFocusMode(!body.classList.contains("focus-mode"), true));

    // Cinematic UI mode.
    const cinematicToggle = document.getElementById("cinematicToggle");
    cinematicToggle?.addEventListener("click", () => {
        const enabled = !body.classList.contains("cinematic");
        body.classList.toggle("cinematic", enabled);
        cinematicToggle.setAttribute("aria-pressed", String(enabled));
        cinematicToggle.setAttribute("aria-label", enabled ? "Exit cinematic mode" : "Enter cinematic mode");
    });

    // Optional procedurally generated ambient sound; no external media is required.
    const soundToggle = document.getElementById("soundToggle");
    let audioContext = null;
    let audioNodes = [];
    const startAmbientSound = async () => {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) return false;
        audioContext = audioContext || new Context();
        await audioContext.resume();
        const master = audioContext.createGain();
        master.gain.value = .035;
        master.connect(audioContext.destination);
        const filter = audioContext.createBiquadFilter();
        filter.type = "lowpass"; filter.frequency.value = 620; filter.Q.value = .7; filter.connect(master);
        [55, 82.41, 110].forEach((frequency, index) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = index === 1 ? "triangle" : "sine";
            osc.frequency.value = frequency;
            osc.detune.value = index * 4;
            gain.gain.value = index === 0 ? .42 : .2;
            osc.connect(gain); gain.connect(filter); osc.start();
            audioNodes.push(osc, gain);
        });
        const lfo = audioContext.createOscillator();
        const lfoGain = audioContext.createGain();
        lfo.frequency.value = .08; lfoGain.gain.value = 150;
        lfo.connect(lfoGain); lfoGain.connect(filter.frequency); lfo.start();
        audioNodes.push(lfo, lfoGain, filter, master);
        return true;
    };
    const stopAmbientSound = () => {
        audioNodes.forEach((node) => { try { if (typeof node.stop === "function") node.stop(); else node.disconnect(); } catch (_) {} });
        audioNodes = [];
    };
    soundToggle?.addEventListener("click", async () => {
        const enabled = soundToggle.getAttribute("aria-pressed") !== "true";
        if (enabled) {
            const started = await startAmbientSound();
            if (!started) return;
        } else stopAmbientSound();
        soundToggle.setAttribute("aria-pressed", String(enabled));
        soundToggle.setAttribute("aria-label", enabled ? "Disable ambient sound" : "Enable ambient sound");
    });

    window.addEventListener("resize", () => {
        if (!desktop()) travelling = false;
        updateMobileProgress();
    }, { passive: true });
})();
