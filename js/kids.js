/* ============================================================
   MYŠÁK KIDS - zvuky, konfety, postup, ovládání zvuku
   ============================================================ */

(function () {
    "use strict";

    let soundOn = (localStorage.getItem("mysak_sound") !== "off");
    let audioCtx = null;

    // --- Téma: tmavé je výchozí, světlé na přepínač ---
    let theme = "dark";
    try { theme = localStorage.getItem("mysak_theme") === "light" ? "light" : "dark"; } catch (e) {}
    document.documentElement.setAttribute("data-theme", theme);

    function ctx() {
        if (!audioCtx) {
            try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; }
        }
        return audioCtx;
    }

    function beep(freq, dur, type, gain) {
        if (!soundOn) return;
        const c = ctx();
        if (!c) return;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = type || "sine";
        o.frequency.value = freq;
        g.gain.value = gain || 0.12;
        o.connect(g); g.connect(c.destination);
        o.start();
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
        o.stop(c.currentTime + dur);
    }

    window.kidSound = {
        click: function () { beep(520, .08, "triangle", .1); },
        ok: function () { beep(660, .1, "sine", .12); setTimeout(function(){ beep(880, .12, "sine", .12); }, 90); },
        bad: function () { beep(220, .15, "sawtooth", .1); },
        win: function () {
            [523,659,784,1047].forEach(function(f,i){ setTimeout(function(){ beep(f, .18, "sine", .14); }, i*120); });
        }
    };

    // Wrap common interactions to add sound
    document.addEventListener("click", function (e) {
        const t = e.target;
        if (t && (t.tagName === "A" || t.tagName === "BUTTON" || t.closest && t.closest("a,button"))) {
            kidSound.click();
        }
    }, true);

    // Confetti
    function confetti() {
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const canvas = document.createElement("canvas");
        canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:99999;";
        document.body.appendChild(canvas);
        const c = canvas.getContext("2d");
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        const pieces = [];
        for (let i = 0; i < 120; i++) {
            pieces.push({
                x: Math.random() * canvas.width,
                y: -20 - Math.random() * 100,
                vx: (Math.random() - .5) * 4,
                vy: 2 + Math.random() * 4,
                r: 4 + Math.random() * 6,
                color: "hsl(" + Math.floor(Math.random()*360) + ",90%,60%)",
                rot: Math.random() * Math.PI * 2,
                vr: (Math.random() - .5) * .2
            });
        }
        let frames = 0;
        function tick() {
            frames++;
            c.clearRect(0,0,canvas.width,canvas.height);
            pieces.forEach(function (p) {
                p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.rot += p.vr;
                c.save();
                c.translate(p.x,p.y);
                c.rotate(p.rot);
                c.fillStyle = p.color;
                c.fillRect(-p.r, -p.r/2, p.r*2, p.r);
                c.restore();
            });
            if (frames < 180) requestAnimationFrame(tick);
            else canvas.remove();
        }
        requestAnimationFrame(tick);
    }

    // Hook fin() to add sound + confetti
    const origFin = window.fin;
    window.fin = function () {
        if (typeof origFin === "function") origFin();
        kidSound.win();
        setTimeout(confetti, 100);
        // track progress
        try {
            const key = "mysak_done";
            const url = location.pathname.split("/").pop();
            const done = JSON.parse(localStorage.getItem(key) || "[]");
            if (done.indexOf(url) === -1) { done.push(url); localStorage.setItem(key, JSON.stringify(done)); }
            updateProgressBadge();
        } catch (e) {}
    };

    // Progress badge
    function updateProgressBadge() {
        let badge = document.getElementById("kid-progress");
        if (!badge) {
            badge = document.createElement("div");
            badge.id = "kid-progress";
            document.body.appendChild(badge);
        }
        let done = [];
        try { done = JSON.parse(localStorage.getItem("mysak_done") || "[]"); } catch (e) {}
        badge.textContent = "⭐ " + done.length + " / 26";

        // kliknutím na odznak vymažeš postup (s potvrzením)
        if (!badge.dataset.resetBound) {
            badge.dataset.resetBound = "1";
            badge.title = "Kliknutím vymažeš postup";
            badge.style.cursor = "pointer";
            badge.addEventListener("click", function () {
                if (confirm("Vymazat postup? Všechna splněná cvičení se vrátí na 0.")) {
                    try { localStorage.removeItem("mysak_done"); } catch (e) {}
                    updateProgressBadge();
                }
            });
        }
    }

    // Sound toggle
    function ensureSoundToggle() {
        if (document.getElementById("kid-sound-toggle")) return;
        const btn = document.createElement("button");
        btn.id = "kid-sound-toggle";
        btn.type = "button";
        btn.textContent = soundOn ? "🔊" : "🔇";
        btn.addEventListener("click", function () {
            soundOn = !soundOn;
            localStorage.setItem("mysak_sound", soundOn ? "on" : "off");
            btn.textContent = soundOn ? "🔊" : "🔇";
            if (soundOn) kidSound.ok();
        });
        document.body.appendChild(btn);
    }

    // Theme toggle
    function setTheme(next) {
        theme = next;
        document.documentElement.setAttribute("data-theme", theme);
        try { localStorage.setItem("mysak_theme", theme); } catch (e) {}
    }

    function ensureThemeToggle() {
        if (document.getElementById("kid-theme-toggle")) return;
        const btn = document.createElement("button");
        btn.id = "kid-theme-toggle";
        btn.type = "button";
        btn.title = "Přepnout světlé / tmavé téma";

        const paint = function () {
            const light = document.documentElement.getAttribute("data-theme") === "light";
            btn.textContent = light ? "🌙" : "☀️";
            btn.setAttribute("aria-label", light ? "Přepnout na tmavé téma" : "Přepnout na světlé téma");
        };
        paint();

        btn.addEventListener("click", function () {
            const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
            const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            const root = document.documentElement;
            const r = btn.getBoundingClientRect();

            // střed tlačítka jako výchozí bod animace
            root.style.setProperty("--kid-vt-x", ((r.left + r.width / 2) / window.innerWidth * 100).toFixed(2) + "%");
            root.style.setProperty("--kid-vt-y", ((r.top + r.height / 2) / window.innerHeight * 100).toFixed(2) + "%");

            btn.classList.remove("kid-spin");
            void btn.offsetWidth;
            btn.classList.add("kid-spin");
            setTimeout(function () { btn.classList.remove("kid-spin"); }, 620);

            if (!reduce && typeof document.startViewTransition === "function") {
                document.startViewTransition(function () { setTheme(next); });
            } else {
                root.classList.add("kid-theme-anim");
                setTheme(next);
                setTimeout(function () { root.classList.remove("kid-theme-anim"); }, 420);
            }

            paint();
            kidSound.ok();
        });

        document.body.appendChild(btn);
    }

    // Remove broken PHP error footer if present
    function cleanFooter() {
        document.querySelectorAll("body").forEach(function () {});
        // remove text nodes containing Fatal error
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        const toRemove = [];
        let n;
        while (n = walker.nextNode()) {
            if (n.nodeValue && n.nodeValue.indexOf("Fatal error") !== -1) {
                // remove parent if it's a stray text container
                const p = n.parentNode;
                if (p && p !== document.body) toRemove.push(p);
                else n.nodeValue = "";
            }
        }
        toRemove.forEach(function (el) { try { el.remove(); } catch(e){} });
    }

    // Friendly message bubble
    function toast(message) {
        let el = document.getElementById("kid-toast");
        if (!el) {
            el = document.createElement("div");
            el.id = "kid-toast";
            el.style.cssText = "position:fixed;left:50%;bottom:90px;transform:translateX(-50%);" +
                "background:#fff;color:#6c5ce7;font-weight:800;padding:.8rem 1.4rem;" +
                "border-radius:999px;box-shadow:0 10px 30px rgba(108,92,231,.35);z-index:10001;" +
                "transition:opacity .25s;opacity:0;pointer-events:none;font-family:inherit;";
            document.body.appendChild(el);
        }
        el.textContent = message;
        el.style.opacity = "1";
        clearTimeout(el._timer);
        el._timer = setTimeout(function () { el.style.opacity = "0"; }, 1800);
    }

    // Keep kids inside the game - never leave the local app by accident
    function guardNavigation() {
        document.addEventListener("click", function (e) {
            const a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
            if (!a) return;

            // povolené externí odkazy (např. dlaždice "Virtuální PC")
            if (a.dataset && a.dataset.external === "1") return;
            if (a.target === "_blank") return;

            const href = a.getAttribute("href");
            if (!href || href.charAt(0) === "#" || href.indexOf("javascript:") === 0) return;

            let url;
            try { url = new URL(a.href, location.href); } catch (err) { return; }

            const isLocal = url.protocol === "file:" ||
                (location.protocol !== "file:" && url.origin === location.origin);

            if (!isLocal) {
                e.preventDefault();
                kidSound.bad();
                toast("Tady zůstaneš 😊 Zpátky do hry!");
            }
        }, true);
    }

    function getCurrentGameName() {
        try {
            const t = document.title || "";
            const m = t.match(/^(.+?)\s*\|/);
            return m ? m[1].trim() : (location.pathname.split("/").pop() || "hra");
        } catch (e) { return "hra"; }
    }

    function init() {
        cleanFooter();
        ensureSoundToggle();
        ensureThemeToggle();
        updateProgressBadge();
        guardNavigation();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
